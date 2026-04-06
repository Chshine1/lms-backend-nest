export interface LokiLogLine {
  timestamp: string;
  line: string;
  parsed: Record<string, unknown> | null;
}

interface LokiQueryRangeResult {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      stream: Record<string, string>;
      values: Array<[string, string]>;
    }>;
  };
}

export class LokiClient {
  constructor(private readonly lokiUrl: string) {}

  /**
   * Query Loki for log lines matching `logqlExpr` within the last `lookbackMinutes`.
   * Returns lines newest-first.
   */
  async queryLogs(
    logqlExpr: string,
    lookbackMinutes: number = 5,
  ): Promise<LokiLogLine[]> {
    const end = Date.now();
    const start = end - lookbackMinutes * 60 * 1000;

    const url = new URL(`${this.lokiUrl}/loki/api/v1/query_range`);
    url.searchParams.set('query', logqlExpr);
    url.searchParams.set('start', (start * 1_000_000).toString()); // nanoseconds
    url.searchParams.set('end', (end * 1_000_000).toString()); // nanoseconds
    url.searchParams.set('limit', '500');
    url.searchParams.set('direction', 'backward');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Loki query failed (${String(response.status)}) for "${logqlExpr}": ${text}`,
      );
    }

    const data = (await response.json()) as LokiQueryRangeResult;

    const lines: LokiLogLine[] = [];
    for (const stream of data.data.result) {
      for (const [ts, rawLine] of stream.values) {
        let parsed: Record<string, unknown> | null = null;
        try {
          parsed = JSON.parse(rawLine) as Record<string, unknown>;
        } catch {
          // not JSON — leave as null
        }
        lines.push({ timestamp: ts, line: rawLine, parsed });
      }
    }

    return lines;
  }

  /**
   * Query Loki for all log lines from a specific compose service within the
   * last `lookbackMinutes` minutes.
   *
   * Promtail's Docker SD uses the label `compose_service` for the service name.
   */
  async queryContainer(
    containerName: string,
    lookbackMinutes: number = 5,
  ): Promise<LokiLogLine[]> {
    return this.queryLogs(
      `{container="${containerName}"}`,
      lookbackMinutes,
    );
  }

  /**
   * Checks whether Loki's /ready endpoint returns 200.
   * Useful in tests that want to assert the observability stack is healthy.
   */
  async isReady(): Promise<boolean> {
    try {
      const res = await fetch(`${this.lokiUrl}/ready`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
