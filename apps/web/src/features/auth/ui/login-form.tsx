'use client'

import { Alert } from '@/shared/ui/alert/alert'
import { Button } from '@/shared/ui/button/button'
import { FormField } from '@/shared/ui/form-field/form-field'
import { Input } from '@/shared/ui/input/input'
import { Typography } from '@/shared/ui/typography/typography'
import { useLoginForm } from '../model/use-login-form'

export function LoginForm() {
  const { form, onSubmit, isSubmitting } = useLoginForm()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {errors.root?.message && (
        <Alert variant="danger">{errors.root.message}</Alert>
      )}

      <FormField
        id="login-email"
        label="E-mail"
        errorText={errors.email?.message}
        hint="Ex: recepcao@bemviver.com.br, roberta@bemviver.com.br ou ana@exemplo.com"
      >
        <Input
          id="login-email"
          type="email"
          placeholder="seu.email@exemplo.com"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>

      <FormField
        id="login-senha"
        label="Senha"
        errorText={errors.senha?.message}
      >
        <Input
          id="login-senha"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          hasError={Boolean(errors.senha)}
          {...register('senha')}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isSubmitting}
        loadingText="Entrando..."
      >
        Entrar
      </Button>

      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <Typography variant="caption" className="font-semibold block mb-1">
          Usuários para teste:
        </Typography>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Recepção: <code>recepcao@bemviver.com.br</code></li>
          <li>Médica: <code>roberta@bemviver.com.br</code></li>
          <li>Paciente: <code>ana@exemplo.com</code></li>
        </ul>
      </div>
    </form>
  )
}
