export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  bodyData?: unknown
}

export class HttpClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    const message =
      typeof data === 'object' && data !== null && 'erro' in data
        ? String((data as { erro: string }).erro)
        : `Request failed with status ${status}: ${statusText}`
    super(message)
    this.name = 'HttpClientError'
  }
}
