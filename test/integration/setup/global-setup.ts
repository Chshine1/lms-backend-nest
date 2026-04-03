// noinspection SqlNoDataSourceInspection

/**
 * Integration test global setup.
 *
 * Strategy:
 * 1. Spin up the REAL docker-compose.development.yml using @testcontainers/compose.
 *    All services (postgres, rabbitmq, migrations, all microservices, loki, promtail) are
 *    started exactly as in development — no fake modules, no mocking.
 * 2. Wait until the gateway /health endpoint reports "ok" (which transitively means
 *    postgres, rabbitmq, migrations, and all microservices are ready).
 * 3. Seed minimal reference data directly via pg so that read-path tests have
 *    something to query without relying on broken write-path APIs.
 * 4. Write connection coordinates to a temp JSON file that test workers read via
 *    the INTEGRATION_STATE_FILE env var.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { Client as PgClient } from 'pg';
import { hash as bcryptHash } from 'bcrypt';

/** Shape persisted to the state file. */
export interface IntegrationState {
  gatewayUrl: string;
  userServiceUrl: string;
  courseServiceUrl: string;
  assignmentServiceUrl: string;
  enrollmentServiceUrl: string;
  schedulingServiceUrl: string;
  fileServiceUrl: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: string;
  pgDatabase: string;
  rabbitmqMgmtUrl: string;
  lokiUrl: string;
  seed: {
    adminUserId: number;
    adminUsername: string;
    adminPassword: string;
    tenantId: number;
    courseId: number;
    courseUnitId: number;
    assignmentId: number;
  };
}

const STATE_FILE = path.join(os.tmpdir(), 'lms-integration-state.json');
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const COMPOSE_FILE = 'docker-compose.development.yml';

// Stored on global so that global-teardown (same process) can call .down()
declare global {
  // eslint-disable-next-line no-var
  var __COMPOSE_ENV__:
    | Awaited<ReturnType<DockerComposeEnvironment['up']>>
    | undefined;
}

export default async function globalSetup(): Promise<void> {
  console.log('\n[integration] Starting docker-compose stack…');
  console.log(`[integration] Project root: ${PROJECT_ROOT}`);
  console.log(
    '[integration] TIP: Pre-build images with ' +
      '`docker compose -f docker-compose.development.yml build` to skip the build step.\n',
  );

  // ---------------------------------------------------------------------------
  // 1.  Start the full compose stack.
  //     withBuild() rebuilds images if the Dockerfile or context changed.
  //     We wait for the gateway health check because it transitively depends on
  //     postgres (via TypeORM), rabbitmq (via @golevelup), and all migrations.
  // ---------------------------------------------------------------------------
  const env = await new DockerComposeEnvironment(PROJECT_ROOT, COMPOSE_FILE)
    .withBuild()
    // Gateway healthcheck: `wget -q --spider http://localhost:3000/health`
    // We replicate that as an HTTP wait strategy so TestContainers knows when
    // the gateway is fully ready.
    .withWaitStrategy('gateway', Wait.forHealthCheck())
    .withWaitStrategy('user-service', Wait.forHealthCheck())
    .withWaitStrategy('course-service', Wait.forHealthCheck())
    .withWaitStrategy('assignment-service', Wait.forHealthCheck())
    .withWaitStrategy('course-enrollment-service', Wait.forHealthCheck())
    .withWaitStrategy('course-scheduling-service', Wait.forHealthCheck())
    .withWaitStrategy('file-service', Wait.forHealthCheck())
    .withWaitStrategy('loki', Wait.forHealthCheck())
    .up();

  global.__COMPOSE_ENV__ = env;

  // ---------------------------------------------------------------------------
  // 2.  Resolve mapped ports.
  //     The compose file uses fixed host-port bindings (3000:3000, 5432:5432 …).
  //     getMappedPort() returns the actual host port; it equals the value in the
  //     compose file unless something else is already occupying that port.
  // ---------------------------------------------------------------------------
  const gatewayPort = env.getContainer('gateway').getMappedPort(3000);
  const userSvcPort = env.getContainer('user-service').getMappedPort(3001);
  const courseSvcPort = env.getContainer('course-service').getMappedPort(3002);
  const assignmentSvcPort = env
    .getContainer('assignment-service')
    .getMappedPort(3003);
  const enrollmentSvcPort = env
    .getContainer('course-enrollment-service')
    .getMappedPort(3004);
  const schedulingSvcPort = env
    .getContainer('course-scheduling-service')
    .getMappedPort(3005);
  const fileSvcPort = env.getContainer('file-service').getMappedPort(3006);
  const pgPort = env.getContainer('postgres').getMappedPort(5432);
  const rabbitmqMgmtPort = env.getContainer('rabbitmq').getMappedPort(15672);
  const lokiPort = env.getContainer('loki').getMappedPort(3100);

  console.log(`[integration] Gateway:     http://localhost:${gatewayPort}`);
  console.log(`[integration] PostgreSQL:  localhost:${pgPort}`);
  console.log(
    `[integration] RabbitMQ mgmt: http://localhost:${rabbitmqMgmtPort}`,
  );
  console.log(`[integration] Loki:        http://localhost:${lokiPort}`);

  // ---------------------------------------------------------------------------
  // 3.  Seed reference data via direct pg connection.
  //     We bypass the broken write-path APIs intentionally so that read-path
  //     and authentication tests have stable, known data to work with.
  //     See test suite 03-user.spec.ts for tests that document the write-path bugs.
  // ---------------------------------------------------------------------------
  const pgClient = new PgClient({
    host: 'localhost',
    port: pgPort,
    user: 'lms',
    password: 'lms',
    database: 'lms',
  });
  await pgClient.connect();

  const seed = await seedReferenceData(pgClient);
  await pgClient.end();

  console.log(
    `[integration] Seed data: adminUserId=${seed.adminUserId}, ` +
      `courseId=${seed.courseId}, unitId=${seed.courseUnitId}`,
  );

  // ---------------------------------------------------------------------------
  // 4.  Persist state so test worker processes can read it.
  //     The INTEGRATION_STATE_FILE env var is propagated to workers by Jest.
  // ---------------------------------------------------------------------------
  const state: IntegrationState = {
    gatewayUrl: `http://localhost:${gatewayPort}`,
    userServiceUrl: `http://localhost:${userSvcPort}`,
    courseServiceUrl: `http://localhost:${courseSvcPort}`,
    assignmentServiceUrl: `http://localhost:${assignmentSvcPort}`,
    enrollmentServiceUrl: `http://localhost:${enrollmentSvcPort}`,
    schedulingServiceUrl: `http://localhost:${schedulingSvcPort}`,
    fileServiceUrl: `http://localhost:${fileSvcPort}`,
    pgHost: 'localhost',
    pgPort,
    pgUser: 'lms',
    pgPassword: 'lms',
    pgDatabase: 'lms',
    rabbitmqMgmtUrl: `http://lms:lms@localhost:${rabbitmqMgmtPort}`,
    lokiUrl: `http://localhost:${lokiPort}`,
    seed,
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  process.env['INTEGRATION_STATE_FILE'] = STATE_FILE;

  console.log(`[integration] State written to ${STATE_FILE}`);
  console.log('[integration] Stack ready — running tests.\n');
}

// -----------------------------------------------------------------------------
// Seed helpers
// -----------------------------------------------------------------------------

async function seedReferenceData(
  pg: PgClient,
): Promise<IntegrationState['seed']> {
  // Password hash for the well-known test credential 'Integration@Test123'
  const adminPassword = 'Integration@Test123';
  const passwordHash = await bcryptHash(adminPassword, 10);

  // tenant_id is just an integer column with no FK constraint (ADR-0004),
  // so we use a stable value of 1 without inserting into a tenants table.
  const tenantId = 1;
  const adminUsername = 'admin_test';

  // Admin user (identityType=4 ADMIN, status=1 ACTIVE)
  const userResult = await pg.query<{ id: number }>(
    `INSERT INTO users
       (tenant_id, username, email, phone, password_hash, status, identity_type,
        created_at, updated_at, version)
     VALUES ($1, $2, $3, $4, $5, 1, 4, NOW(), NOW(), 1)
     RETURNING id`,
    [
      tenantId,
      adminUsername,
      'admin_test@example.com',
      '+10000000000',
      passwordHash,
    ],
  );
  const adminUserId = userResult.rows[0]!.id;

  // USER MANAGE permission (resource=1, action=4) so the user can call
  // user.create via the RabbitMQ permission guard when auth is fixed.
  await pg.query(
    `INSERT INTO user_permissions
       (user_id, resource, action, created_at, updated_at, version)
     VALUES ($1, 1, 4, NOW(), NOW(), 1)`,
    [adminUserId],
  );

  // A teacher user (identityType=2) for course teacher-assignment tests
  const teacherResult = await pg.query<{ id: number }>(
    `INSERT INTO users
       (tenant_id, username, email, phone, password_hash, status, identity_type,
        created_at, updated_at, version)
     VALUES ($1, $2, $3, $4, $5, 1, 2, NOW(), NOW(), 1)
     RETURNING id`,
    [
      tenantId,
      'teacher_test',
      'teacher_test@example.com',
      '+10000000001',
      passwordHash,
    ],
  );
  const teacherUserId = teacherResult.rows[0]!.id;

  // Course (created_by = teacherUserId, teachers = [teacherUserId])
  const courseResult = await pg.query<{ id: number }>(
    `INSERT INTO courses
       (name, description, tenant_id, teachers, created_by, created_at, updated_at, version)
     VALUES ($1, $2, $3, $4::int[], $5, NOW(), NOW(), 1)
     RETURNING id`,
    [
      'Integration Test Course',
      'A course seeded by the integration test setup',
      tenantId,
      `{${teacherUserId}}`,
      teacherUserId,
    ],
  );
  const courseId = courseResult.rows[0]!.id;

  // Course unit (position stored as float8 in course_units)
  const unitResult = await pg.query<{ id: number }>(
    `INSERT INTO course_units
       (course_id, title, description, position, created_at, updated_at, version)
     VALUES ($1, $2, $3, 1.0, NOW(), NOW(), 1)
     RETURNING id`,
    [
      courseId,
      'Unit 1: Foundations',
      'The first unit seeded for integration tests',
    ],
  );
  const courseUnitId = unitResult.rows[0]!.id;

  // Assignment inside the unit
  const assignmentResult = await pg.query<{ id: number }>(
    `INSERT INTO assignments
       (course_unit_id, title, description, due_date, attachments,
        created_at, updated_at, version)
     VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', '{}'::int[], NOW(), NOW(), 1)
     RETURNING id`,
    [
      courseUnitId,
      'Assignment 1: Getting Started',
      'Complete the introductory exercises',
    ],
  );
  const assignmentId = assignmentResult.rows[0]!.id;

  return {
    adminUserId,
    adminUsername,
    adminPassword,
    tenantId,
    courseId,
    courseUnitId,
    assignmentId,
  };
}
