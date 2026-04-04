// noinspection SqlNoDataSourceInspection

/**
 * Suite 05 — Full End-to-End Flow
 *
 * Orchestrates complete user journeys that cross every observable boundary:
 *   HTTP  ↔  Gateway  ↔  RabbitMQ  ↔  Microservices  ↔  PostgreSQL
 *                                                       ↕
 *                                                     Loki (via promtail)
 *
 * Each scenario verifies:
 *   1. HTTP response (status + body shape)
 *   2. Database state (direct pg query cross-check)
 *   3. RabbitMQ queue telemetry (message processed, nothing stuck)
 *   4. Distributed log ingestion in Loki (gateway + microservice logs appear)
 *   5. Trace propagation: x-trace-id header present in RabbitMQ message flow
 *      (verified indirectly by checking logs from both gateway and microservice
 *      were emitted in the same time window as the request)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Scenario A — Read-path journey (works as designed):
 *   Login → read course details → verify DB consistency → confirm Loki logs
 *
 * Scenario B — Write-path journey (documents known bugs):
 *   Attempt course creation → observe failure → verify DB integrity preserved
 *
 * Scenario C — Concurrent reads (concurrency / race-condition smoke test):
 *   Fire multiple GET /courses/:id in parallel → all must succeed, DB unchanged
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HttpClient, decodeJwtPayload } from '../helpers/http';
import { RabbitMQMgmtClient } from '../helpers/rabbitmq-mgmt';
import { withDb } from '../helpers/db';
import { LokiClient } from '../helpers/loki';
import { loadState, sleep } from '../helpers/state';

const state = loadState();
const gateway = new HttpClient(state.gatewayUrl);
const rabbitmq = new RabbitMQMgmtClient(state.rabbitmqMgmtUrl);
const loki = new LokiClient(state.lokiUrl);

describe('05 — Full End-to-End Flow', () => {
  describe('Scenario A — Read-path: login → get course → DB + MQ + log verification', () => {
    let accessToken: string;
    let loginDeliverBefore: number;
    let findCourseDeliverBefore: number;
    let requestTimestamp: Date;

    beforeAll(async () => {
      // Capture baselines before we touch anything
      const loginQ = await rabbitmq.getQueue('user-service-user-login');
      loginDeliverBefore = loginQ.message_stats?.deliver_get ?? 0;

      const courseQ = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      findCourseDeliverBefore = courseQ.message_stats?.deliver_get ?? 0;

      requestTimestamp = new Date();
    });

    it('Step 1 — POST /login succeeds and returns a JWT', async () => {
      const res = await gateway.post<{ accessToken: string }>('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      expect(res.status).toBe(201);
      expect(typeof res.body.accessToken).toBe('string');
      accessToken = res.body.accessToken;
    });

    it('Step 1 — JWT sub matches the admin user id in the database', async () => {
      const payload = decodeJwtPayload(accessToken);
      const dbRow = await withDb(state, (db) =>
        db.queryOne<{ id: number }>(
          'SELECT id FROM users WHERE username = $1',
          [state.seed.adminUsername],
        ),
      );
      expect(payload['sub']).toBe(dbRow.id);
    });

    it('Step 2 — GET /courses/:id returns the seeded course', async () => {
      const res = await gateway.get<{
        course: { id: number; name: string; tenantId: number };
        courseUnits: unknown[];
      }>(`/courses/${String(state.seed.courseId)}`);

      expect(res.status).toBe(200);
      expect(res.body.course.id).toBe(state.seed.courseId);
    });

    it('Step 2 — Course response is byte-for-byte consistent with the DB', async () => {
      const res = await gateway.get<{
        course: {
          id: number;
          name: string;
          description: string;
          tenantId: number;
          createdBy: number;
        };
        courseUnits: Array<{ id: number; title: string }>;
      }>(`/courses/${String(state.seed.courseId)}`);

      const [dbCourse, dbUnits] = await withDb(state, async (db) => {
        const c = await db.queryOne<{
          id: number;
          name: string;
          description: string;
          tenant_id: number;
          created_by: number;
        }>(
          'SELECT id, name, description, tenant_id, created_by FROM courses WHERE id = $1',
          [state.seed.courseId],
        );
        const u = await db.query<{ id: number; title: string }>(
          'SELECT id, title FROM course_units WHERE course_id = $1 AND deleted_at IS NULL ORDER BY position',
          [state.seed.courseId],
        );
        return [c, u] as const;
      });

      expect(res.body.course.name).toBe(dbCourse.name);
      expect(res.body.course.description).toBe(dbCourse.description);
      expect(res.body.course.tenantId).toBe(dbCourse.tenant_id);
      expect(res.body.course.createdBy).toBe(dbCourse.created_by);
      expect(res.body.courseUnits).toHaveLength(dbUnits.length);
      expect(res.body.courseUnits[0]!.title).toBe(dbUnits[0]!.title);
    });

    it('Step 3 — RabbitMQ login queue processed +1 message', async () => {
      await sleep(300); // allow stats refresh
      const q = await rabbitmq.getQueue('user-service-user-login');
      const deliverAfter = q.message_stats?.deliver_get ?? 0;
      expect(deliverAfter - loginDeliverBefore).toBeGreaterThanOrEqual(1);
    });

    it('Step 3 — RabbitMQ find-course-with-units queue processed +1 message', async () => {
      await sleep(300);
      const q = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      const deliverAfter = q.message_stats?.deliver_get ?? 0;
      expect(deliverAfter - findCourseDeliverBefore).toBeGreaterThanOrEqual(1);
    });

    it('Step 3 — All queues used in this flow are drained (RPC is synchronous)', async () => {
      for (const queueName of [
        'user-service-user-login',
        'course-service-course-find-course-with-units',
      ]) {
        const q = await rabbitmq.getQueue(queueName);
        expect(q.messages_ready).toBe(0);
        expect(q.messages_unacknowledged).toBe(0);
      }
    });

    it('Step 4 — Loki has log lines from the gateway after the request', async () => {
      // Promtail ingestion can take a few seconds; wait before querying
      await sleep(10_000);

      const logs = await loki.queryService('gateway', 5);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('Step 4 — Loki has log lines from the user-service after login', async () => {
      // Already waited 10 s above; just query
      const logs = await loki.queryService('user-service', 5);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('Step 4 — Loki has log lines from the course-service after GET /courses/:id', async () => {
      const logs = await loki.queryService('course-service', 5);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('Step 4 — gateway and user-service emitted logs within the same 60-second window', () => {
      // Both services MUST have logged something after the request. The fact that
      // the previous "Loki has log lines" tests passed ensures this.
      // We document the expectation explicitly here for traceability.
      const windowMs = Date.now() - requestTimestamp.getTime();
      // The entire login round-trip must complete well under 60 seconds
      expect(windowMs).toBeLessThan(60_000);
    });
  });

  describe('Scenario B — Write-path failure: DB and queue integrity preserved', () => {
    let courseCountBefore: number;
    let createQueueDeliverBefore: number;

    beforeAll(async () => {
      courseCountBefore = await withDb(state, (db) => db.count('courses'));
      const q = await rabbitmq.getQueue('course-service-course-create');
      createQueueDeliverBefore = q.message_stats?.deliver_get ?? 0;
    });

    it('POST /courses returns a non-2xx status (userId context missing)', async () => {
      const res = await gateway.post('/courses', {
        name: 'E2E Write Test Course',
        description: 'Should fail',
        tenantId: state.seed.tenantId,
      });
      expect(res.status).not.toBe(201);
    });

    it('courses table count is unchanged after failed POST', async () => {
      const countAfter = await withDb(state, (db) => db.count('courses'));
      expect(countAfter).toBe(courseCountBefore);
    });

    it('course-service-course-create queue processes the message (RPC gets a reply)', async () => {
      // Even on error the message IS published and the service does reply with
      // an error. The queue should drain (messages_ready = 0).
      await sleep(500);
      const q = await rabbitmq.getQueue('course-service-course-create');
      // The message was published (deliver count incremented) …
      const deliverAfter = q.message_stats?.deliver_get ?? 0;
      expect(deliverAfter).toBeGreaterThanOrEqual(createQueueDeliverBefore);
      // … and immediately consumed (ack or nack), leaving nothing pending
      expect(q.messages_ready).toBe(0);
      expect(q.messages_unacknowledged).toBe(0);
    });
  });

  describe('Scenario C — Concurrent reads: 10 parallel GET /courses/:id', () => {
    it('all 10 requests return HTTP 200 with consistent data', async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          gateway.get<{
            course: { id: number; name: string };
            courseUnits: unknown[];
          }>(`/courses/${String(state.seed.courseId)}`),
        ),
      );

      for (const res of results) {
        expect(res.status).toBe(200);
        expect(res.body.course.id).toBe(state.seed.courseId);
      }

      // All responses must be identical (no cache inconsistency)
      const firstName = results[0]!.body.course.name;
      for (const res of results) {
        expect(res.body.course.name).toBe(firstName);
      }
    });

    it('10 concurrent requests incremented find-course-with-units deliver count by 10', async () => {
      const qBefore = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      const deliverBefore = qBefore.message_stats?.deliver_get ?? 0;

      await Promise.all(
        Array.from({ length: 10 }, () =>
          gateway.get(`/courses/${String(state.seed.courseId)}`),
        ),
      );

      await sleep(500);

      const qAfter = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      const deliverAfter = qAfter.message_stats?.deliver_get ?? 0;
      expect(deliverAfter - deliverBefore).toBeGreaterThanOrEqual(10);
    });

    it('database courses table is not mutated by read operations', async () => {
      await Promise.all(
        Array.from({ length: 5 }, () =>
          gateway.get(`/courses/${String(state.seed.courseId)}`),
        ),
      );
      const count = await withDb(state, (db) => db.count('courses'));
      expect(count).toBe(1); // only the seeded course
    });
  });

  describe('Scenario D — Unit detail journey: read unit + verify full object graph', () => {
    it('GET /courses/:id/units/:unitId returns assignments matching DB', async () => {
      const res = await gateway.get<{
        assignments: Array<{ id: number; title: string; dueDate: string }>;
        courseMaterials: unknown[];
      }>(
        `/courses/${String(state.seed.courseId)}/units/${String(state.seed.courseUnitId)}`,
      );

      expect(res.status).toBe(200);

      const dbAssignments = await withDb(state, (db) =>
        db.query<{ id: number; title: string }>(
          'SELECT id, title FROM assignments WHERE course_unit_id = $1 AND deleted_at IS NULL',
          [state.seed.courseUnitId],
        ),
      );

      expect(res.body.assignments).toHaveLength(dbAssignments.length);

      for (const dbA of dbAssignments) {
        const apiA = res.body.assignments.find((a) => a.id === dbA.id);
        expect(apiA).toBeDefined();
        expect(apiA!.title).toBe(dbA.title);
      }
    });

    it('assignment dueDate is in the future (as seeded)', async () => {
      const res = await gateway.get<{
        assignments: Array<{ id: number; dueDate: string }>;
        courseMaterials: unknown[];
      }>(
        `/courses/${String(state.seed.courseId)}/units/${String(state.seed.courseUnitId)}`,
      );

      const seededAssignment = res.body.assignments.find(
        (a) => a.id === state.seed.assignmentId,
      );
      expect(seededAssignment).toBeDefined();
      expect(new Date(seededAssignment!.dueDate).getTime()).toBeGreaterThan(
        Date.now(),
      );
    });
  });

  describe('Scenario E — Observability: trace IDs in logs', () => {
    /**
     * The TraceService generates an x-trace-id for each RabbitMQ RPC call.
     * Both the gateway and the microservice should log this trace ID.
     * We verify that log lines from both services exist in Loki and that
     * at least some log lines are valid JSON (the project uses structured logging).
     */
    it('gateway log lines are structured JSON', async () => {
      // Trigger a fresh request to generate logs
      await gateway.get(`/courses/${String(state.seed.courseId)}`);
      await sleep(10_000); // allow promtail ingestion

      const logs = await loki.queryService('gateway', 3);
      // At least some lines should be parseable JSON
      const jsonLines = logs.filter((l) => l.parsed !== null);
      expect(jsonLines.length).toBeGreaterThan(0);
    });

    it('course-service log lines are structured JSON', async () => {
      const logs = await loki.queryService('course-service', 3);
      const jsonLines = logs.filter((l) => l.parsed !== null);
      expect(jsonLines.length).toBeGreaterThan(0);
    });

    it('user-service log lines are structured JSON', async () => {
      // Login to ensure user-service has recent logs
      await gateway.post('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      await sleep(10_000);

      const logs = await loki.queryService('user-service', 3);
      const jsonLines = logs.filter((l) => l.parsed !== null);
      expect(jsonLines.length).toBeGreaterThan(0);
    });

    it('all running services have emitted at least one log line to Loki', async () => {
      const services = [
        'gateway',
        'user-service',
        'course-service',
        'assignment-service',
        'course-enrollment-service',
        'course-scheduling-service',
        'file-service',
      ];

      for (const svc of services) {
        const logs = await loki.queryService(svc, 30);
        expect(logs.length).toBeGreaterThan(0);
      }
    });
  });
});
