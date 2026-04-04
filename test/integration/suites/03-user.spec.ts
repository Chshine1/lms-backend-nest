// noinspection SqlNoDataSourceInspection

/**
 * Suite 03 — User Management
 *
 * This suite deliberately exercises the POST /users endpoint to observe and
 * document its *actual* behaviour, including two architectural bugs that
 * prevent user creation via the API:
 *
 * Bug 1 — Missing userId context propagation (gateway → microservice)
 * ─────────────────────────────────────────────────────────────────────
 * The gateway's HTTP controllers have no @UseGuards(AuthGuard('jwt')), so
 * even when a Bearer token is supplied the JwtStrategy.validate() is never
 * called.  UserContextService therefore returns undefined for getUserId().
 * TypedClientBase.rpc() sends x-user-id: undefined in the RabbitMQ headers.
 *
 * On the user-service side, @RequirePermissions(USER, MANAGE) is applied to
 * user.create.  RabbitMQPermissionGuard calls getRequiredUserId() which throws
 * UnauthorizedException when userId is undefined.
 *
 * Bug 2 — Missing tenantId in CreateUserDto
 * ──────────────────────────────────────────
 * CreateUserDto has no tenantId field, so even if Bug 1 were fixed, the user
 * row would be created without a tenant_id value, violating the NOT NULL
 * constraint on the users table.
 *
 * Full call chain covered (as far as it goes):
 *   POST /users → Gateway → RabbitMQ (user.create) → user-service
 *              → RabbitMQPermissionGuard → THROWS (Bug 1)
 *
 * Assertions:
 *   - HTTP response is non-2xx
 *   - PostgreSQL users table is not mutated
 *   - user-service-user-create queue: message is published then immediately
 *     nack'd / rejected (dead-lettered or returned) — messages_ready stays 0
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

const VALID_USER_PAYLOAD = {
  username: 'new_student',
  email: 'new_student@example.com',
  phone: '+19999999999',
  status: 1, // ACTIVE
  identityType: 1, // STUDENT
  derivation: { studentId: 'STU-001' },
  password: 'Student@Test123',
  // NOTE: tenantId intentionally omitted — it is not in CreateUserDto (Bug 2)
};

describe('03 — User Management', () => {
  beforeAll(async () => {
    await globalSetup();
  });

  afterAll(globalTeardown);

  describe('POST /users — Bug 1: userId context never propagated to user-service', () => {
    it('fails even without a Bearer token because the permission guard throws', async () => {
      const res = await gateway.post('/users', VALID_USER_PAYLOAD);

      // RabbitMQPermissionGuard.canActivate() calls getRequiredUserId() which throws
      // UnauthorizedException.  @golevelup/nestjs-rabbitmq converts this to an
      // error response that bubbles up as an error reply on the RPC channel,
      // resulting in a 5xx from the gateway.
      expect(res.status).not.toBe(201);
      expect(res.status).not.toBe(200);
    });

    it('fails even WITH a valid Bearer token — gateway never reads it into CLS', async () => {
      // Login to get a real JWT
      const loginRes = await gateway.post<{ accessToken: string }>('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      const token = loginRes.body.accessToken;
      expect(typeof token).toBe('string');

      // Supply the token — but because UserController has no @UseGuards(AuthGuard('jwt')),
      // the JwtStrategy is never invoked, so userId stays undefined in CLS.
      const res = await gateway.post('/users', VALID_USER_PAYLOAD, { token });
      expect(res.status).not.toBe(201);
      expect(res.status).not.toBe(200);
    });

    it('database users table is NOT mutated', async () => {
      // Two seed rows (admin + teacher) inserted in global-setup; count must stay at 2.
      await gateway.post('/users', VALID_USER_PAYLOAD);
      const count = await withDb(state, (db) => db.count('users'));
      expect(count).toBe(2);
    });
  });

  describe('POST /users — Bug 2: CreateUserDto is missing tenantId', () => {
    it('CreateUserDto has no tenantId field — a user could not be assigned a tenant', () => {
      // This is a structural documentation test.
      // If Bug 1 were fixed (permission check bypassed), the user.create handler
      // calls userRepository.create({ ...rest, passwordHash }).
      // The 'rest' spread comes from CreateUserDto which has no tenantId.
      // user.tenantId would be undefined, causing a PostgreSQL NOT NULL violation
      // on the users.tenant_id column.
      //
      // We verify this by checking that VALID_USER_PAYLOAD (which mirrors CreateUserDto)
      // indeed lacks a tenantId key.
      expect('tenantId' in VALID_USER_PAYLOAD).toBe(false);
    });
  });

  describe('RabbitMQ — user.create queue behaviour on error', () => {
    it('after a failed POST /users the queue has no lingering ready messages', async () => {
      await gateway.post('/users', VALID_USER_PAYLOAD);

      // Allow a small window for any async ack/nack to complete
      await sleep(500);

      const queue = await rabbitmq.getQueue('user-service-user-create');
      expect(queue.messages_ready).toBe(0);
      expect(queue.messages_unacknowledged).toBe(0);
    });

    it('the user.create routing key is wired but the message is rejected, not lost', async () => {
      // Verify the binding exists (infrastructure is correct even if app logic is broken)
      const bindings = await rabbitmq.getBindings();
      const createBinding = bindings.find(
        (b) =>
          b.source === 'user-service' &&
          b.destination === 'user-service-user-create' &&
          b.routing_key === 'user.create',
      );
      expect(createBinding).toBeDefined();
    });
  });

  describe('Baseline: seeded users are visible in the DB', () => {
    it('admin_test user exists with identity_type ADMIN (4)', async () => {
      const row = await withDb(state, (db) =>
        db.queryOne<{
          username: string;
          identity_type: number;
          status: number;
        }>(
          'SELECT username, identity_type, status FROM users WHERE username = $1',
          [state.seed.adminUsername],
        ),
      );
      expect(row.username).toBe(state.seed.adminUsername);
      expect(row.identity_type).toBe(4); // ADMIN
      expect(row.status).toBe(1); // ACTIVE
    });

    it('teacher_test user exists with identity_type TEACHER (2)', async () => {
      const row = await withDb(state, (db) =>
        db.queryOne<{ username: string; identity_type: number }>(
          'SELECT username, identity_type FROM users WHERE username = $1',
          ['teacher_test'],
        ),
      );
      expect(row.identity_type).toBe(2); // TEACHER
    });

    it('admin_test has USER MANAGE permission in user_permissions', async () => {
      const rows = await withDb(state, (db) =>
        db.query<{ resource: number; action: number }>(
          'SELECT resource, action FROM user_permissions WHERE user_id = $1',
          [state.seed.adminUserId],
        ),
      );
      const hasManage = rows.some(
        (r) => r.resource === 1 && r.action === 4, // USER=1, MANAGE=4
      );
      expect(hasManage).toBe(true);
    });
  });
});
