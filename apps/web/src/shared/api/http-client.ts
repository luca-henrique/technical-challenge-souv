import { CHAVE_SESSAO, encerrarSessao } from '@/lib/sessao'

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

class HttpClient {
  private getBaseUrl(): string {
    if (typeof window === 'undefined') {
      return (
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        'http://localhost:3333'
      )
    }
    return '/api'
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const base = this.getBaseUrl()
    const url = new URL(`${base}${cleanEndpoint}`, 'http://localhost')

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val))
        }
      })
    }

    if (typeof window !== 'undefined') {
      return `${url.pathname}${url.search}`
    }
    return `${base}${url.pathname}${url.search}`
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(CHAVE_SESSAO)
      if (!raw) return {}
      const session = JSON.parse(raw)
      return session?.token ? { Authorization: `Bearer ${session.token}` } : {}
    } catch {
      return {}
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, bodyData, headers: customHeaders, ...rest } = options
    const url = this.buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...((customHeaders as Record<string, string>) || {}),
    }

    const config: RequestInit = {
      ...rest,
      headers,
    }

    if (bodyData !== undefined) {
      config.body = JSON.stringify(bodyData)
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      encerrarSessao()
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = await response.text().catch(() => null)
    }

    if (!response.ok) {
      throw new HttpClientError(response.status, response.statusText, data)
    }

    return data as T
  }

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params })
  }

  post<T>(
    endpoint: string,
    bodyData?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      bodyData,
    })
  }

  put<T>(
    endpoint: string,
    bodyData?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      bodyData,
    })
  }

  patch<T>(
    endpoint: string,
    bodyData?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      bodyData,
    })
  }

  delete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', params })
  }
}

export const httpClient = new HttpClient()
