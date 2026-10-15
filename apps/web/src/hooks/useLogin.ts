'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import type { Usuario } from '@bemviver/shared'
import type { DadosLogin } from '@/components/organisms/FormularioLogin/schema'
import { api } from '@/lib/api'
import { salvarSessao } from '@/lib/sessao'

export interface RespostaLogin {
  token: string
  usuario: Usuario
}

export function useLogin() {
  const router = useRouter()

  return useMutation<RespostaLogin, Error, DadosLogin>({
    mutationFn: async (dados: DadosLogin) => {
      return api<RespostaLogin>('/auth/login', {
        metodo: 'POST',
        corpo: dados,
      })
    },
    onSuccess: (sessao) => {
      salvarSessao(sessao)
      router.push(`/${sessao.usuario.perfil}`)
    },
  })
}
