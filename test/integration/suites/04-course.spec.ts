// noinspection SqlNoDataSourceInspection

/**
 * Suite 04 — Course Management
 *
 * Tests the course read path end-to-end (happy path):
 *   GET /courses/:id  →  Gateway  →  RabbitMQ (course.find-course-with-units)
 *                    →  course-service CourseReadService  →  PostgreSQL
 *                    ←  { course, courseUnits }
 *
 *   GET /courses/:id/units/:unitId  →  course.find-unit-detail  →  PostgreSQL
 *                                  ←  { assignments, courseMaterials }
 *
 * Also documents the broken write path:
 *   POST /courses → course-service CourseWriteService.createCourse()
 *                 → getRequiredUserId() throws because gateway never sets userId in CLS
 *
 *   PUT /courses/:id → same root cause for the parts of batchUpdateCourse that
 *                      access userId context
 *
 * Full assertions per request:
 *   - HTTP status and response shape
 *   - Database cross-reference (response values match DB rows exactly)
 *   - RabbitMQ queue deliver count increments for each RPC call
 *   - No stale messages left on queues after processing
 */

import { HttpClient } from '../helpers/http';
import { RabbitMQMgmtClient } from '../helpers/rabbitmq-mgmt';
import { withDb } from '../helpers/db';
import { loadState, sleep } from '../helpers/state';
import { globalSetup } from '../setup/global-setup';
import { globalTeardown } from '../setup/global-teardown';

const state = loadState();
const gateway = new HttpClient(state.gatewayUrl);
const rabbitmq = new RabbitMQMgmtClient(state.rabbitmqMgmtUrl);

describe('04 — Course Management', () => {
  beforeAll(async () => {
    await globalSetup();
  });

  afterAll(globalTeardown);

  describe('GET /courses/:id — course with units (happy path)', () => {
    interface CourseResponse {
      course: {
        id: number;
        name: string;
        description: string;
        tenantId: number;
        teachers: number[];
        createdBy: number;
        createdAt: string;
        updatedAt: string;
        version: number;
      };
      courseUnits: Array<{
        id: number;
        courseId: number;
        title: string;
        description?: string;
        position: number;
      }>;
    }

    let res: Awaited<ReturnType<typeof gateway.get<CourseResponse>>>;

    beforeAll(async () => {
      res = await gateway.get<CourseResponse>(
        `/courses/${String(state.seed.courseId)}`,
      );
    });

    it('returns HTTP 200', () => {
      expect(res.status).toBe(200);
    });

    it('response body has course and courseUnits fields', () => {
      expect(res.body.course).toBeDefined();
      expect(Array.isArray(res.body.courseUnits)).toBe(true);
    });

    it('course.id matches the seeded course', () => {
      expect(res.body.course.id).toBe(state.seed.courseId);
    });

    it('course fields exactly match the database row', async () => {
      const dbRow = await withDb(state, (db) =>
        db.queryOne<{
          id: number;
          name: string;
          description: string;
          tenant_id: number;
          created_by: number;
        }>(
          'SELECT id, name, description, tenant_id, created_by FROM courses WHERE id = $1',
          [state.seed.courseId],
        ),
      );

      expect(res.body.course.name).toBe(dbRow.name);
      expect(res.body.course.description).toBe(dbRow.description);
      expect(res.body.course.tenantId).toBe(dbRow.tenant_id);
      expect(res.body.course.createdBy).toBe(dbRow.created_by);
    });

    it('courseUnits length matches DB count', async () => {
      const count = await withDb(state, (db) =>
        db.count('course_units', 'course_id = $1 AND deleted_at IS NULL', [
          state.seed.courseId,
        ]),
      );
      expect(res.body.courseUnits).toHaveLength(count);
    });

    it('each courseUnit.courseId refers to the requested course', () => {
      for (const unit of res.body.courseUnits) {
        expect(unit.courseId).toBe(state.seed.courseId);
      }
    });

    it('courseUnit fields match the DB row', async () => {
      const seededUnit = res.body.courseUnits.find(
        (u) => u.id === state.seed.courseUnitId,
      );
      expect(seededUnit).toBeDefined();

      const dbUnit = await withDb(state, (db) =>
        db.queryOne<{ id: number; title: string; position: number }>(
          'SELECT id, title, position FROM course_units WHERE id = $1',
          [state.seed.courseUnitId],
        ),
      );
      expect(seededUnit!.title).toBe(dbUnit.title);
      expect(seededUnit!.position).toBe(dbUnit.position);
    });
  });

  describe('GET /courses/:id/units/:unitId — unit detail (happy path)', () => {
    interface UnitDetailResponse {
      assignments: Array<{
        id: number;
        courseUnitId: number;
        title: string;
        description: string;
        dueDate: string;
        attachments: number[];
      }>;
      courseMaterials: Array<{
        id: number;
        courseUnitId: number;
        fileId: number;
        title: string;
      }>;
    }

    let res: Awaited<ReturnType<typeof gateway.get<UnitDetailResponse>>>;

    beforeAll(async () => {
      res = await gateway.get<UnitDetailResponse>(
        `/courses/${String(state.seed.courseId)}/units/${String(state.seed.courseUnitId)}`,
      );
    });

    it('returns HTTP 200', () => {
      expect(res.status).toBe(200);
    });

    it('response has assignments and courseMaterials arrays', () => {
      expect(Array.isArray(res.body.assignments)).toBe(true);
      expect(Array.isArray(res.body.courseMaterials)).toBe(true);
    });

    it('assignments length matches DB count for this unit', async () => {
      const count = await withDb(state, (db) =>
        db.count('assignments', 'course_unit_id = $1 AND deleted_at IS NULL', [
          state.seed.courseUnitId,
        ]),
      );
      expect(res.body.assignments).toHaveLength(count);
    });

    it('assignment fields match the DB row', async () => {
      const seededAssignment = res.body.assignments.find(
        (a) => a.id === state.seed.assignmentId,
      );
      expect(seededAssignment).toBeDefined();

      const dbRow = await withDb(state, (db) =>
        db.queryOne<{ id: number; title: string; description: string }>(
          'SELECT id, title, description FROM assignments WHERE id = $1',
          [state.seed.assignmentId],
        ),
      );
      expect(seededAssignment!.title).toBe(dbRow.title);
      expect(seededAssignment!.description).toBe(dbRow.description);
      expect(seededAssignment!.courseUnitId).toBe(state.seed.courseUnitId);
    });

    it('no course materials exist for the seeded unit (none were seeded)', () => {
      // We intentionally seeded no course_materials so this must be empty
      expect(res.body.courseMaterials).toHaveLength(0);
    });
  });

  describe('GET /courses/:id — not found', () => {
    it('returns a non-2xx status for a non-existent courseId', async () => {
      const res = await gateway.get('/courses/999999');
      // course-service throws NotFoundException → gateway propagates as 5xx
      // (no global exception filter to remap it to 404)
      expect(res.status).not.toBe(200);
    });
  });

  describe('POST /courses — Bug: userId not propagated from HTTP context to course-service', () => {
    it('POST /courses without token fails because CourseWriteService calls getRequiredUserId()', async () => {
      // Root cause: gateway's UserContextModule.forRoot('http') registers
      // RabbitMQUserContextInterceptor as APP_INTERCEPTOR — the wrong token
      // (should be APP_GUARD or a proper HTTP interceptor).  As a result userId
      // is never set in CLS for HTTP requests.  CourseWriteService.createCourse()
      // calls getRequiredUserId() → throws UnauthorizedException.
      const res = await gateway.post('/courses', {
        name: 'New Course',
        description: 'Should not be created',
        tenantId: state.seed.tenantId,
      });

      expect(res.status).not.toBe(201);
      expect(res.status).not.toBe(200);
    });

    it('POST /courses with a valid JWT still fails (gateway has no @UseGuards on CourseController)', async () => {
      const loginRes = await gateway.post<{ accessToken: string }>('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      const token = loginRes.body.accessToken;

      const res = await gateway.post(
        '/courses',
        { name: 'New Course', description: 'Still should fail', tenantId: 1 },
        { token },
      );

      expect(res.status).not.toBe(201);
      expect(res.status).not.toBe(200);
    });

    it('database courses table is NOT mutated', async () => {
      await gateway.post('/courses', {
        name: 'Mutation Test',
        description: 'Must not appear in DB',
        tenantId: state.seed.tenantId,
      });

      const count = await withDb(state, (db) => db.count('courses'));
      // Only the one course seeded in global-setup
      expect(count).toBe(1);
    });

    it('course-service-course-create queue stays clean after rejected RPC', async () => {
      await gateway.post('/courses', {
        name: 'Queue Pollution Test',
        description: 'Test',
        tenantId: 1,
      });

      await sleep(500);

      const queue = await rabbitmq.getQueue('course-service-course-create');
      expect(queue.messages_ready).toBe(0);
      expect(queue.messages_unacknowledged).toBe(0);
    });
  });

  describe('RabbitMQ message flow — read queues', () => {
    it('GET /courses/:id increments deliver count on course.find-course-with-units queue', async () => {
      const qBefore = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      const deliverBefore = qBefore.message_stats?.deliver_get ?? 0;

      await gateway.get(`/courses/${String(state.seed.courseId)}`);

      await sleep(300);

      const qAfter = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      const deliverAfter = qAfter.message_stats?.deliver_get ?? 0;
      expect(deliverAfter - deliverBefore).toBeGreaterThanOrEqual(1);
    });

    it('GET /courses/:id/units/:unitId increments deliver count on course.find-unit-detail queue', async () => {
      const qBefore = await rabbitmq.getQueue(
        'course-service-course-find-unit-detail',
      );
      const deliverBefore = qBefore.message_stats?.deliver_get ?? 0;

      await gateway.get(
        `/courses/${String(state.seed.courseId)}/units/${String(state.seed.courseUnitId)}`,
      );

      await sleep(300);

      const qAfter = await rabbitmq.getQueue(
        'course-service-course-find-unit-detail',
      );
      const deliverAfter = qAfter.message_stats?.deliver_get ?? 0;
      expect(deliverAfter - deliverBefore).toBeGreaterThanOrEqual(1);
    });

    it('no messages linger on find-course-with-units after RPC completes', async () => {
      await gateway.get(`/courses/${String(state.seed.courseId)}`);
      await sleep(200);
      const q = await rabbitmq.getQueue(
        'course-service-course-find-course-with-units',
      );
      expect(q.messages_ready).toBe(0);
      expect(q.messages_unacknowledged).toBe(0);
    });
  });
});
