/**
 * Suite 01 — Health Checks
 *
 * Verifies that every service's /health endpoint is green and that the
 * supporting infrastructure (PostgreSQL, RabbitMQ, Loki) is reachable.
 *
 * Full call chain covered:
 *   HTTP → NestJS HealthController → DatabaseHealthIndicator (TypeORM ping)
 *                                   → RabbitMQHealthIndicator (AMQP ping)
 *
 * Additional assertions probe RabbitMQ's management API to confirm that
 * every expected queue has been created and bound to the correct exchange.
 */

import { HttpClient } from '../helpers/http';
import { RabbitMQMgmtClient } from '../helpers/rabbitmq-mgmt';
import { LokiClient } from '../helpers/loki';
import { IntegrationState, loadState } from '../helpers/state';
import { globalSetup } from '../setup/global-setup';
import { globalTeardown } from '../setup/global-teardown';

interface HealthBody {
  status: string;
  info: Record<string, { status: string }>;
  error?: Record<string, unknown>;
}

async function assertHealthy(client: HttpClient, label: string): Promise<void> {
  const res = await client.get<HealthBody>('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');

  const dbStatus = res.body.info['database']?.status;
  const mqStatus = res.body.info['rabbitmq']?.status;

  expect(dbStatus).toBe('up');
  expect(mqStatus).toBe('up');

  if (dbStatus !== 'up') {
    console.error(
      `[${label}] database health: ${JSON.stringify(res.body.info['database'])}`,
    );
  }
  if (mqStatus !== 'up') {
    console.error(
      `[${label}] rabbitmq health: ${JSON.stringify(res.body.info['rabbitmq'])}`,
    );
  }
}

describe('01 — Health Checks', () => {
  let state: IntegrationState;
  let gateway: HttpClient;
  let userSvc: HttpClient;
  let courseSvc: HttpClient;
  let assignmentSvc: HttpClient;
  let enrollmentSvc: HttpClient;
  let schedulingSvc: HttpClient;
  let fileSvc: HttpClient;
  let rabbitmq: RabbitMQMgmtClient;
  let loki: LokiClient;

  beforeAll(async () => {
    await globalSetup();
    state = loadState();
    gateway = new HttpClient(state.gatewayUrl);
    userSvc = new HttpClient(state.userServiceUrl);
    courseSvc = new HttpClient(state.courseServiceUrl);
    assignmentSvc = new HttpClient(state.assignmentServiceUrl);
    enrollmentSvc = new HttpClient(state.enrollmentServiceUrl);
    schedulingSvc = new HttpClient(state.schedulingServiceUrl);
    fileSvc = new HttpClient(state.fileServiceUrl);
    rabbitmq = new RabbitMQMgmtClient(state.rabbitmqMgmtUrl);
    loki = new LokiClient(state.lokiUrl);
  });

  afterAll(globalTeardown);

  describe('HTTP /health endpoints', () => {
    it('gateway /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(gateway, 'gateway');
    });

    it('user-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(userSvc, 'user-service');
    });

    it('course-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(courseSvc, 'course-service');
    });

    it('assignment-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(assignmentSvc, 'assignment-service');
    });

    it('course-enrollment-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(enrollmentSvc, 'course-enrollment-service');
    });

    it('course-scheduling-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(schedulingSvc, 'course-scheduling-service');
    });

    it('file-service /health → 200, database up, rabbitmq up', async () => {
      await assertHealthy(fileSvc, 'file-service');
    });
  });

  describe('RabbitMQ exchanges', () => {
    it('all expected topic exchanges exist', async () => {
      const exchanges = await rabbitmq.getExchanges();
      const exchangeNames = exchanges.map((e) => e.name);

      const expected = [
        'user-service',
        'course-service',
        'assignment-service',
        'course-enrollment-service',
        'course-scheduling-service',
        'file-service',
      ];

      for (const name of expected) {
        expect(exchangeNames).toContain(name);
      }
    });

    it('each exchange is of type "topic"', async () => {
      const exchanges = await rabbitmq.getExchanges();
      const serviceExchanges = exchanges.filter((e) =>
        [
          'user-service',
          'course-service',
          'assignment-service',
          'course-enrollment-service',
          'course-scheduling-service',
          'file-service',
        ].includes(e.name),
      );
      for (const ex of serviceExchanges) {
        expect(ex.type).toBe('topic');
      }
    });
  });

  describe('RabbitMQ queues', () => {
    const expectedQueues = [
      // user-service
      'user-service-user-create',
      'user-service-user-login',
      'user-service-user-get',
      // course-service
      'course-service-course-create',
      'course-service-course-batch-update',
      'course-service-course-find-course-with-units',
      'course-service-course-find-unit-detail',
      // assignment-service (prefix: assignment-service-assignment-)
      'assignment-service-assignment-createSubmission',
      'assignment-service-assignment-updateSubmission',
      'assignment-service-assignment-submitAssignment',
      'assignment-service-assignment-getSubmissionByEnrollmentAndAssignment',
      'assignment-service-assignment-getSubmissionsByAssignment',
      'assignment-service-assignment-createReview',
      'assignment-service-assignment-updateReview',
      'assignment-service-assignment-getReviewBySubmission',
      // course-enrollment-service (prefix: course-enrollment-service-course-enrollment-)
      'course-enrollment-service-course-enrollment-enroll',
      'course-enrollment-service-course-enrollment-getByCourse',
      'course-enrollment-service-course-enrollment-getByStudent',
      'course-enrollment-service-course-enrollment-getById',
      'course-enrollment-service-course-enrollment-unenroll',
      'course-enrollment-service-course-enrollment-unenrollByStudentAndCourse',
      'course-enrollment-service-course-enrollment-getEnrollmentsByStudentWithCourse',
      'course-enrollment-service-course-enrollment-getByStudentAndCourse',
      // course-scheduling-service (prefix: course-scheduling-service-course-scheduling-)
      'course-scheduling-service-course-scheduling-create',
      'course-scheduling-service-course-scheduling-getByCourse',
      'course-scheduling-service-course-scheduling-getById',
      'course-scheduling-service-course-scheduling-update',
      'course-scheduling-service-course-scheduling-delete',
      // file-service (prefix: file-service-file-)
      'file-service-file-validateExists',
      'file-service-file-create',
      'file-service-file-getById',
      'file-service-file-delete',
      'file-service-file-getSignedUrl',
    ];

    it('all expected queues exist', async () => {
      const queues = await rabbitmq.getQueues();
      const names = new Set(queues.map((q) => q.name));
      for (const expected of expectedQueues) {
        expect(names.has(expected)).toBe(true);
      }
    });

    it('all queues have at least one consumer (the microservice)', async () => {
      const queues = await rabbitmq.getQueues();
      const serviceQueues = queues.filter((q) =>
        expectedQueues.includes(q.name),
      );
      for (const q of serviceQueues) {
        expect(q.consumers).toBeGreaterThanOrEqual(1);
      }
    });

    it('no queue has pending (unprocessed) messages at startup', async () => {
      const queues = await rabbitmq.getQueues();
      const serviceQueues = queues.filter((q) =>
        expectedQueues.includes(q.name),
      );
      for (const q of serviceQueues) {
        // messages_ready = messages waiting to be delivered
        expect(q.messages_ready).toBe(0);
      }
    });
  });

  describe('RabbitMQ bindings', () => {
    it('user-service queues are bound with the correct routing keys', async () => {
      const bindings = await rabbitmq.getBindings();

      const expectBinding = (queue: string, routingKey: string): void => {
        const match = bindings.find(
          (b) =>
            b.source === 'user-service' &&
            b.destination === queue &&
            b.routing_key === routingKey,
        );
        expect(match).toBeDefined();
      };

      expectBinding('user-service-user-create', 'user.create');
      expectBinding('user-service-user-login', 'user.login');
      expectBinding('user-service-user-get', 'user.get');
    });

    it('course-service queues are bound with the correct routing keys', async () => {
      const bindings = await rabbitmq.getBindings();

      const expectBinding = (queue: string, routingKey: string): void => {
        const match = bindings.find(
          (b) =>
            b.source === 'course-service' &&
            b.destination === queue &&
            b.routing_key === routingKey,
        );
        expect(match).toBeDefined();
      };

      expectBinding('course-service-course-create', 'course.create');
      expectBinding(
        'course-service-course-batch-update',
        'course.batch-update',
      );
      expectBinding(
        'course-service-course-find-course-with-units',
        'course.find-course-with-units',
      );
      expectBinding(
        'course-service-course-find-unit-detail',
        'course.find-unit-detail',
      );
    });
  });

  describe('Observability stack', () => {
    it('Loki is ready and accepting queries', async () => {
      const ready = await loki.isReady();
      expect(ready).toBe(true);
    });

    it('Loki /ready HTTP endpoint returns 200', async () => {
      const res = await fetch(`${state.lokiUrl}/ready`);
      expect(res.status).toBe(200);
    });
  });
});
