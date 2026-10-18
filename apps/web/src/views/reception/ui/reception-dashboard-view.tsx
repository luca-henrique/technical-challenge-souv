'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/button/button'
import { Typography } from '@/shared/ui/typography/typography'
import { ReceptionAgendaBoard } from '@/features/reception-agenda/ui/organisms/reception-agenda-board'

export interface ReceptionDashboardViewProps {
  initialDate?: string
  className?: string
}

export function ReceptionDashboardView({
  initialDate,
  className = '',
}: ReceptionDashboardViewProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography variant="title" className="text-2xl font-bold tracking-tight">
            Agenda da Recepção
          </Typography>
          <Typography variant="body" className="text-gray-500 dark:text-gray-400">
            Acompanhe e controle os atendimentos diários de todos os profissionais.
          </Typography>
        </div>

        <Link href="/recepcao/relatorios">
          <Button variant="secondary" size="compact" className="min-h-11 px-4">
            Relatório de faltas
          </Button>
        </Link>
      </div>

      <ReceptionAgendaBoard initialDate={initialDate} />
    </div>
  )
}
