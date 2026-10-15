import { NextResponse, type NextRequest } from 'next/server'
import type { Perfil } from '@bemviver/shared'
import { CHAVE_SESSAO, type Sessao } from './lib/sessao'

const ROTAS_PUBLICAS = ['/']

const ROTAS_PROTEGIDAS: Record<string, Perfil> = {
  '/paciente': 'paciente',
  '/recepcao': 'recepcao',
  '/profissional': 'profissional',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessaoCookie = request.cookies.get(CHAVE_SESSAO)?.value

  let sessao: Sessao | null = null
  if (sessaoCookie) {
    try {
      sessao = JSON.parse(decodeURIComponent(sessaoCookie))
    } catch {
      sessao = null
    }
  }

  const estaAutenticado = Boolean(sessao?.token && sessao?.usuario?.perfil)
  const rotaPublica = ROTAS_PUBLICAS.includes(pathname)

  // Se o usuário autenticado acessar uma rota pública (login /), redireciona para sua respectiva área
  if (estaAutenticado && rotaPublica) {
    const destino = `/${sessao!.usuario.perfil}`
    return NextResponse.redirect(new URL(destino, request.url))
  }

  // Verifica se é uma rota privada/protegida
  const prefixoProtegido = Object.keys(ROTAS_PROTEGIDAS).find(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  )

  if (prefixoProtegido) {
    // Se não está autenticado, redireciona para a página de login
    if (!estaAutenticado) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Se está autenticado, mas com perfil incompatível para a área
    const perfilNecessario = ROTAS_PROTEGIDAS[prefixoProtegido]
    if (sessao!.usuario.perfil !== perfilNecessario) {
      const areaCorreta = `/${sessao!.usuario.perfil}`
      return NextResponse.redirect(new URL(areaCorreta, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
