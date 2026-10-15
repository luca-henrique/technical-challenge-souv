import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { ProvedorQuery } from '@/providers/provedorQuery'

export const metadata: Metadata = {
  title: 'Clínica Bem Viver',
  description: 'Agendamento de consultas da Clínica Bem Viver',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <ProvedorQuery>{children}</ProvedorQuery>
      </body>
    </html>
  )
}
