'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import type { Perfil } from '@bemviver/shared'
import { Button } from '@/shared/ui/button/button'
import { Typography } from '@/shared/ui/typography/typography'
import BotaoTema from '@/components/atoms/BotaoTema/botaoTema'
import { useSessaoContext } from '@/providers/provedorSessao'
import { useSessao } from '@/hooks/useSessao'

export interface AppShellProps {
  requiredRole?: Perfil
  title?: string
  subtitle?: string
  children: ReactNode
}

function useSafeRouter() {
  try {
    return useRouter()
  } catch {
    return {
      push: () => {},
      replace: () => {},
    }
  }
}

export function AppShell({
  requiredRole,
  title,
  subtitle,
  children,
}: AppShellProps) {
  const router = useSafeRouter()
  const sessaoContext = useSessaoContext()
  const fallbackSessao = useSessao()
  const session = sessaoContext?.sessao ?? fallbackSessao

  const isAuthorized =
    !requiredRole || (session && session.usuario.perfil === requiredRole)

  useEffect(() => {
    if (session !== undefined && !isAuthorized) {
      router.replace('/')
    }
  }, [session, isAuthorized, router])

  if (session === undefined || !isAuthorized) {
    return null
  }

  function handleLogout() {
    if (sessaoContext) {
      sessaoContext.encerrar()
    }
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <Typography variant="body" className="font-semibold text-teal-800 dark:text-teal-400">
              Clínica Bem Viver
            </Typography>
            {title && (
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                {title}
              </Typography>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <BotaoTema />
            {session && (
              <span className="hidden font-medium text-gray-700 dark:text-gray-300 sm:inline">
                {session.usuario.nome}
              </span>
            )}
            <Button
              variant="secondary"
              size="compact"
              onClick={handleLogout}
              aria-label="Sair da conta"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="mx-auto max-w-5xl p-4 sm:p-6 outline-none space-y-6"
      >
        {children}
      </main>
    </div>
  )
}
