export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
  raw: Response;
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async get<T = unknown>(
    path: string,
    options: { token?: string } = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T = unknown>(
    path: string,
    body: unknown,
    options: { token?: string } = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T = unknown>(
    path: string,
    body: unknown,
    options: { token?: string } = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async delete<T = unknown>(
    path: string,
    options: { token?: string } = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    urlPath: string,
    body: unknown,
    options: { token?: string } = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${urlPath}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.token !== undefined) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    const raw = await fetch(url, init);

    const responseHeaders: Record<string, string> = {};
    raw.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let parsedBody: T;
    const contentType = raw.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      parsedBody = (await raw.json()) as T;
    } else {
      parsedBody = (await raw.text()) as unknown as T;
    }

    return {
      status: raw.status,
      headers: responseHeaders,
      body: parsedBody,
      raw,
    };
  }
}

/** Decode a JWT payload without verification (test-only, for asserting claims). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(
      `Invalid JWT structure: expected 3 parts, got ${parts.length}`,
    );
  }
  // base64url → base64 → Buffer → JSON
  const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(json) as Record<string, unknown>;
}
