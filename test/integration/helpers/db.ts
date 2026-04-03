import { Client as PgClient, QueryResult, QueryResultRow } from 'pg';
import { IntegrationState } from './state';

export class DbClient {
  private client: PgClient;

  constructor(state: IntegrationState) {
    this.client = new PgClient({
      host: state.pgHost,
      port: state.pgPort,
      user: state.pgUser,
      password: state.pgPassword,
      database: state.pgDatabase,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result: QueryResult<T> = await this.client.query<T>(sql, params);
    return result.rows;
  }

  /** Returns the first row or throws if no rows are found. */
  async queryOne<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T> {
    const rows = await this.query<T>(sql, params);
    if (rows.length === 0) {
      throw new Error(`Expected at least one row for query: ${sql}`);
    }
    return rows[0]!;
  }

  /** Returns a single scalar value from the first column of the first row. */
  async queryScalar<V>(sql: string, params: unknown[] = []): Promise<V> {
    const result: QueryResult = await this.client.query(sql, params);
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (row === undefined) {
      throw new Error(`Expected a row for scalar query: ${sql}`);
    }
    const keys = Object.keys(row);
    const firstKey = keys[0];
    if (firstKey === undefined) {
      throw new Error(`Expected columns in row for scalar query: ${sql}`);
    }
    return row[firstKey] as V;
  }

  /**
   * Returns the count from `SELECT COUNT(*) …` as a plain number.
   * Postgres returns counts as strings, so we coerce.
   */
  async count(
    table: string,
    where: string = '1=1',
    params: unknown[] = [],
  ): Promise<number> {
    const val = await this.queryScalar<string>(
      `SELECT COUNT(*) FROM ${table} WHERE ${where}`,
      params,
    );
    return parseInt(val, 10);
  }
}

/** Runs fn with a fresh DbClient that is automatically disconnected afterward. */
export async function withDb<T>(
  state: IntegrationState,
  fn: (db: DbClient) => Promise<T>,
): Promise<T> {
  const db = new DbClient(state);
  await db.connect();
  try {
    return await fn(db);
  } finally {
    await db.disconnect();
  }
}
