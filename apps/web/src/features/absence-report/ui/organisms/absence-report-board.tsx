'use client'

import { Alert } from '@/shared/ui/alert/alert'
import Spinner from '@/components/atoms/Spinner/spinner'
import { useAbsenceReport } from '../../model/use-absence-report'
import { ReportFilterBar } from '../molecules/report-filter-bar'
import { ReportMetricsGrid } from '../molecules/report-metrics-grid'
import { RepeatOffendersTable } from '../molecules/repeat-offenders-table'

export interface AbsenceReportBoardProps {
  className?: string
}

export function AbsenceReportBoard({ className = '' }: AbsenceReportBoardProps) {
  const {
    control,
    handleSubmit,
    applyFilters,
    resetFilters,
    professionals,
    report,
    isLoading,
    error,
    setPage,
  } = useAbsenceReport()

  return (
    <div className={`space-y-6 ${className}`}>
      <ReportFilterBar
        control={control}
        professionals={professionals}
        onSubmit={handleSubmit(applyFilters)}
        onReset={resetFilters}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
          <Spinner tamanho="md" aria-label="Carregando relatório..." />
          <span>Carregando relatório...</span>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <ReportMetricsGrid report={report} />
          <RepeatOffendersTable
            repeatOffenders={report.reincidentes}
            pagination={report.paginacao}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
