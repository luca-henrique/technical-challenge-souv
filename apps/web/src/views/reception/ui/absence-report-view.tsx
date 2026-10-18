'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/button/button'
import { Typography } from '@/shared/ui/typography/typography'
import BotaoExportarPdf from '@/components/molecules/BotaoExportarPdf/botaoExportarPdf'
import { AbsenceReportBoard } from '@/features/absence-report/ui/organisms/absence-report-board'

export interface AbsenceReportViewProps {
  className?: string
}

export function AbsenceReportView({ className = '' }: AbsenceReportViewProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography variant="title" className="text-2xl font-bold tracking-tight">
            Relatório de Absenteísmo (No-Show)
          </Typography>
          <Typography variant="body" className="text-gray-500 dark:text-gray-400">
            Métricas consolidadas de faltas e lista de pacientes reincidentes.
          </Typography>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Link href="/recepcao">
            <Button variant="secondary" size="compact" className="min-h-11 px-4">
              Voltar para Agenda
            </Button>
          </Link>
          <BotaoExportarPdf rotulo="Exportar Relatório" tipo="absenteismo" />
        </div>
      </div>

      <AbsenceReportBoard />
    </div>
  )
}
