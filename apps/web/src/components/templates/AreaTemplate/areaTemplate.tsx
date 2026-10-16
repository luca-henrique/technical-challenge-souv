'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Button from '@/components/atoms/Button/button'
import BotaoTema from '@/components/atoms/BotaoTema/botaoTema'
import { useSessao } from '@/hooks/useSessao'
import { encerrarSessao } from '@/lib/sessao'
import type { AreaTemplateProps } from './types'

export default function AreaTemplate({ perfil, titulo, children }: AreaTemplateProps) {
  const router = useRouter()
  const sessao = useSessao()
  const autorizado = sessao?.usuario.perfil === perfil

  useEffect(() => {
    if (sessao !== undefined && !autorizado) router.replace('/')
  }, [sessao, autorizado, router])

  if (!sessao || !autorizado) return null

  function sair() {
    encerrarSessao()
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-semibold text-teal-800 dark:text-teal-400">Clínica Bem Viver</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{titulo}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BotaoTema />
            <span className="hidden text-gray-600 dark:text-gray-300 sm:inline">{sessao.usuario.nome}</span>
            <Button variante="secundario" tamanho="compacto" onClick={sair} aria-label="Sair da conta">
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main id="conteudo-principal" tabIndex={-1} className="mx-auto max-w-5xl p-4 outline-none">
        {children}
      </main>
    </div>
  )
}
