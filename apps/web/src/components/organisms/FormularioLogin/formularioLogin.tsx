'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Input from '@/components/atoms/Input/input'
import Field from '@/components/molecules/Field/field'
import { useLogin } from '@/hooks/useLogin'
import { loginSchema, type DadosLogin } from './schema'

export default function FormularioLogin() {
  const { mutate: realizarLogin, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  })

  const onSubmit = handleSubmit((dados) => {
    realizarLogin(dados)
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="E-mail" erro={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </Field>
      <Field label="Senha" erro={errors.senha?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.senha)}
          {...register('senha')}
        />
      </Field>
      {error && <Alert>{error.message}</Alert>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
