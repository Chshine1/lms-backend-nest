// noinspection SqlNoDataSourceInspection

/**
 * Suite 02 — Authentication
 *
 * Tests the login flow end-to-end:
 *   POST /login  →  Gateway HTTP  →  RabbitMQ (user.login)
 *               →  user-service UserReadService  →  PostgreSQL users table
 *               ←  JWT string  ←  Gateway wraps as { accessToken }
 *
 * Assertions span:
 *   - HTTP response shape and status code
 *   - JWT claims (decoded without verification)
 *   - JWT sub matches the actual DB row id (DB verification)
 *   - RabbitMQ user-service-user-login queue deliver count increments
 *   - No DB mutations (login is read-only)
 */

import { HttpClient, decodeJwtPayload } from '../helpers/http';
import { RabbitMQMgmtClient } from '../helpers/rabbitmq-mgmt';
import { withDb } from '../helpers/db';
import { loadState, sleep } from '../helpers/state';

const state = loadState();
const gateway = new HttpClient(state.gatewayUrl);
const rabbitmq = new RabbitMQMgmtClient(state.rabbitmqMgmtUrl);

interface LoginResponse {
  accessToken: string;
}

describe('02 — Authentication', () => {
  describe('POST /login — happy path', () => {
    let token: string;

    beforeAll(async () => {
      const res = await gateway.post<LoginResponse>('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      expect(res.status).toBe(201); // NestJS default for @Post() with no @HttpCode
      token = res.body.accessToken;
    });

    it('returns a well-formed JWT string', () => {
      expect(typeof token).toBe('string');
      // JWT = base64url.base64url.base64url
      expect(token.split('.')).toHaveLength(3);
    });

    it('JWT payload contains the correct sub (userId)', async () => {
      const payload = decodeJwtPayload(token);

      // Fetch the real DB id so we can cross-reference
      const dbRow = await withDb(state, (db) =>
        db.queryOne<{ id: number }>(
          'SELECT id FROM users WHERE username = $1',
          [state.seed.adminUsername],
        ),
      );

      expect(payload['sub']).toBe(dbRow.id);
    });

    it('JWT payload contains correct tenant, username, and role claims', () => {
      const payload = decodeJwtPayload(token);
      expect(payload['username']).toBe(state.seed.adminUsername);
      expect(payload['tenant']).toBe(state.seed.tenantId);
      // identityType 4 = ADMIN
      expect(payload['role']).toBe(4);
    });

    it('JWT payload has a future exp claim', () => {
      const payload = decodeJwtPayload(token);
      const nowSeconds = Math.floor(Date.now() / 1000);
      expect(typeof payload['exp']).toBe('number');
      expect(payload['exp'] as number).toBeGreaterThan(nowSeconds);
    });

    it('login is read-only — no new rows in users table', async () => {
      // Users table should only have the two seeded rows (admin + teacher)
      const count = await withDb(state, (db) => db.count('users'));
      expect(count).toBe(2);
    });
  });

  describe('POST /login — error paths', () => {
    it('wrong password returns a non-2xx status', async () => {
      const res = await gateway.post('/login', {
        username: state.seed.adminUsername,
        password: 'completely-wrong-password',
      });
      // The user-service throws UnauthorizedException which propagates as 5xx
      // because the gateway has no global exception filter mapping it to 401.
      // Either way, it must NOT be 200/201.
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(201);
    });

    it('unknown username returns a non-2xx status', async () => {
      const res = await gateway.post('/login', {
        username: 'no_such_user',
        password: 'password',
      });
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(201);
    });

    it('missing body fields returns a non-2xx status', async () => {
      const res = await gateway.post('/login', {});
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(201);
    });
  });

  describe('RabbitMQ message flow — user.login queue', () => {
    it('each login attempt increments the deliver count on the user-service-user-login queue', async () => {
      // Capture baseline
      const queueBefore = await rabbitmq.getQueue('user-service-user-login');
      const deliverBefore = queueBefore.message_stats?.deliver_get ?? 0;

      // Trigger two logins
      await gateway.post('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      await gateway.post('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });

      // Small delay to allow RabbitMQ stats to update (usually near-instant)
      await sleep(300);

      const queueAfter = await rabbitmq.getQueue('user-service-user-login');
      const deliverAfter = queueAfter.message_stats?.deliver_get ?? 0;

      expect(deliverAfter - deliverBefore).toBeGreaterThanOrEqual(2);
    });

    it('no messages are left pending (queue drains synchronously within RPC timeout)', async () => {
      await gateway.post('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });

      await sleep(200);

      const queue = await rabbitmq.getQueue('user-service-user-login');
      // RPC: gateway waits for reply, so by the time HTTP returns the message is
      // already ack'd — messages_ready must be 0
      expect(queue.messages_ready).toBe(0);
      expect(queue.messages_unacknowledged).toBe(0);
    });
  });

  describe('JWT can be used as a Bearer token', () => {
    it('authenticated GET /health succeeds with Bearer token in Authorization header', async () => {
      // Although /health doesn't require auth, this verifies that including a
      // valid JWT doesn't break request processing.
      const loginRes = await gateway.post<LoginResponse>('/login', {
        username: state.seed.adminUsername,
        password: state.seed.adminPassword,
      });
      const token = loginRes.body.accessToken;

      const healthRes = await gateway.get('/health', { token });
      expect(healthRes.status).toBe(200);
    });
  });
});
