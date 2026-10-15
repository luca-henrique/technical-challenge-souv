'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import type { DadosLogin } from '@/components/organisms/FormularioLogin/schema'
import { salvarSessao } from '@/lib/sessao'
import { fazerLogin, type RespostaLogin } from '@/services/auth'

export type { RespostaLogin }

export function useLogin() {
  const router = useRouter()

  return useMutation<RespostaLogin, Error, DadosLogin>({
    mutationFn: async (dados: DadosLogin) => {
      return fazerLogin(dados)
    },
    onSuccess: (sessao) => {
      salvarSessao(sessao)
      router.push(`/${sessao.usuario.perfil}`)
    },
  })
}
