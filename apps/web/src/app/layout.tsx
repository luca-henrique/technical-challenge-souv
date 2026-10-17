import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { ProvedorQuery } from '@/providers/provedorQuery'
import { ProvedorSessao } from '@/providers/provedorSessao'

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
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Pular para o conteúdo principal
        </a>
        <ProvedorQuery>
          <ProvedorSessao>{children}</ProvedorSessao>
        </ProvedorQuery>
      </body>
    </html>
  )
}
