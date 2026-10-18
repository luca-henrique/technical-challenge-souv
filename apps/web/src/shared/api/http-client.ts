import { CHAVE_SESSAO, encerrarSessao } from '@/lib/sessao'
import { HttpClientError, type RequestOptions } from './types'

export { HttpClientError, type RequestOptions }

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.API_URL ||
      'http://localhost:3333'
    )
  }
  return '/api'
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const base = getBaseUrl()
  const url = new URL(`${base}${cleanEndpoint}`, 'http://localhost')

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val))
      }
    })
  }

  return typeof window !== 'undefined'
    ? `${url.pathname}${url.search}`
    : `${base}${url.pathname}${url.search}`
}

function getAuthHeader(): Record<string, string> {
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

class HttpClient {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, bodyData, headers: customHeaders, ...rest } = options
    const url = buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
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

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params })
  }

  post<T>(endpoint: string, bodyData?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', bodyData })
  }

  put<T>(endpoint: string, bodyData?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', bodyData })
  }

  patch<T>(endpoint: string, bodyData?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', bodyData })
  }

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', params })
  }
}

export const httpClient = new HttpClient()
