'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { salvarSessao } from '@/lib/sessao'
import { useSessaoContext } from '@/providers/provedorSessao'
import { httpClient, HttpClientError } from '@/shared/api/http-client'
import { loginSchema, type LoginFormData } from './login-schema'
import type { Sessao } from '@/lib/sessao'

const REDIRECT_MAP = {
  recepcao: '/recepcao',
  profissional: '/profissional',
  paciente: '/paciente',
} as const

export function useLoginForm() {
  const router = useRouter()
  const sessaoContext = useSessaoContext()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  })

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = form

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    try {
      const response = await httpClient.post<Sessao>('/auth/login', {
        email: data.email.trim().toLowerCase(),
        senha: data.senha,
      })

      salvarSessao(response)

      if (sessaoContext) {
        sessaoContext.definirSessao(response)
      }

      const destination =
        REDIRECT_MAP[response.usuario.perfil] || '/recepcao'
      router.push(destination)
    } catch (err) {
      const message =
        err instanceof HttpClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao autenticar. Verifique suas credenciais.'
      setError('root', { message })
    }
  })

  return {
    form,
    onSubmit,
    isSubmitting,
  }
}
