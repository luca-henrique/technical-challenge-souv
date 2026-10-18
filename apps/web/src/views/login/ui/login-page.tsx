'use client'

import { Card } from '@/shared/ui/card/card'
import { Typography } from '@/shared/ui/typography/typography'
import { LoginForm } from '@/features/auth/ui/login-form'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 transition-colors dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-1">
          <Typography variant="title">Clínica Bem Viver</Typography>
          <Typography variant="subtitle">Entre com seu e-mail para acessar o sistema</Typography>
        </header>

        <Card className="shadow-md">
          <LoginForm />
        </Card>
      </div>
    </div>
  )
}
