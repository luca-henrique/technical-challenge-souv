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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var salvo = localStorage.getItem('tema-clinica-bem-viver');
                  var prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (salvo === 'escuro' || ((!salvo || salvo === 'sistema') && prefereEscuro)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ProvedorQuery>{children}</ProvedorQuery>
      </body>
    </html>
  )
}
