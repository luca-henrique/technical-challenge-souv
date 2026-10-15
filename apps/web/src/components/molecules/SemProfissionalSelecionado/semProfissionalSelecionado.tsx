import Card from '@/components/atoms/Card/card'
import type { SemProfissionalSelecionadoProps } from './types'

export default function SemProfissionalSelecionado({
  titulo = 'Nenhum profissional selecionado',
  mensagem = 'Selecione um profissional acima para visualizar a agenda do dia, horários disponíveis e marcar consultas.',
  className = '',
}: SemProfissionalSelecionadoProps) {
  return (
    <Card
      role="status"
      aria-label={titulo}
      className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
        {titulo}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-gray-500">
        {mensagem}
      </p>
    </Card>
  )
}
