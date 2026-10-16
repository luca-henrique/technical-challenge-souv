import { NextResponse, type NextRequest } from 'next/server'

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  'http://localhost:3333'

// Headers de hop-by-hop que não devem ser repassados
const HEADERS_IGNORADOS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
])

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  const targetPath = `/${path.join('/')}`
  const queryString = request.nextUrl.search
  const targetUrl = `${BACKEND_URL}${targetPath}${queryString}`

  // Prepara headers a serem enviados para o backend
  const forwardHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (!HEADERS_IGNORADOS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  })

  // Adiciona cabeçalhos de encaminhamento e auditoria BFF
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  forwardHeaders.set('x-forwarded-for', clientIp)
  forwardHeaders.set('x-forwarded-host', request.headers.get('host') || 'localhost:3100')
  forwardHeaders.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''))
  forwardHeaders.set('x-bff-agent', 'nextjs-bff')

  // Obtém o corpo da requisição para métodos com payload
  const hasBody = !['GET', 'HEAD'].includes(request.method)
  let body: ArrayBuffer | undefined = undefined

  if (hasBody) {
    try {
      const buffer = await request.arrayBuffer()
      if (buffer.byteLength > 0) {
        body = buffer
      }
    } catch {
      body = undefined
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
      cache: 'no-store',
    })

    // Monta resposta com os cabeçalhos retornados pelo backend
    const responseHeaders = new Headers()
    backendResponse.headers.forEach((val, key) => {
      if (!HEADERS_IGNORADOS.has(key.toLowerCase())) {
        responseHeaders.set(key, val)
      }
    })

    responseHeaders.set('x-handled-by', 'nextjs-bff')

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error(`[BFF Proxy Error] ${request.method} ${targetUrl}:`, error)
    return NextResponse.json(
      {
        erro: 'Serviço temporariamente indisponível. Falha na comunicação com o backend.',
      },
      { status: 502 },
    )
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}
