'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfissionais } from '@/hooks/useProfissionais'
import { useRelatorioFaltas } from '@/hooks/useRelatorioFaltas'
import {
  absenceReportFilterSchema,
  type AbsenceReportFilterInput,
} from './absence-report.schema'

export function useAbsenceReport() {
  const [activeFilters, setActiveFilters] = useState<AbsenceReportFilterInput>({})
  const [page, setPage] = useState(1)

  const { data: professionals = [] } = useProfissionais()

  const {
    relatorio: report,
    carregando: isLoading,
    erro: error,
    refetch,
  } = useRelatorioFaltas({
    dataInicio: activeFilters.startDate || undefined,
    dataFim: activeFilters.endDate || undefined,
    profissionalId: activeFilters.doctorId || undefined,
    pagina: page,
    limite: 10,
  })

  const { control, handleSubmit, reset } = useForm<AbsenceReportFilterInput>({
    resolver: zodResolver(absenceReportFilterSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      doctorId: '',
    },
  })

  function applyFilters(data: AbsenceReportFilterInput) {
    setPage(1)
    setActiveFilters({
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      doctorId: data.doctorId || undefined,
    })
  }

  function resetFilters() {
    reset({ startDate: '', endDate: '', doctorId: '' })
    setPage(1)
    setActiveFilters({})
  }

  return {
    control,
    handleSubmit,
    applyFilters,
    resetFilters,
    activeFilters,
    professionals,
    report,
    isLoading,
    error: error || null,
    refetch,
    page,
    setPage,
  }
}
