import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { receptionAgendaFilterSchema } from '../src/features/reception-agenda/model/reception-agenda.schema'
import { absenceReportFilterSchema } from '../src/features/absence-report/model/absence-report.schema'
import { ReportMetricsGrid } from '../src/features/absence-report/ui/molecules/report-metrics-grid'
import { RepeatOffendersTable } from '../src/features/absence-report/ui/molecules/repeat-offenders-table'
import type { RelatorioFaltas } from '@bemviver/shared'

describe('Reception & Report Features', () => {
  describe('Zod Schemas', () => {
    it('valida formato de data do filtro da recepção', () => {
      const valid = receptionAgendaFilterSchema.safeParse({
        date: '2026-10-26',
        professionalId: 'prof-1',
      })
      expect(valid.success).toBe(true)

      const invalid = receptionAgendaFilterSchema.safeParse({
        date: '26/10/2026',
      })
      expect(invalid.success).toBe(false)
    })

    it('valida campos opcionais do filtro de relatório de absenteísmo', () => {
      const empty = absenceReportFilterSchema.safeParse({})
      expect(empty.success).toBe(true)

      const withValues = absenceReportFilterSchema.safeParse({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        doctorId: 'prof-1',
      })
      expect(withValues.success).toBe(true)
    })
  })

  describe('ReportMetricsGrid Molecule', () => {
    it('renderiza todos os cards com os totais e percentual de absenteísmo', () => {
      const mockReport: RelatorioFaltas = {
        periodo: {},
        totais: {
          agendadas: 40,
          realizadas: 30,
          canceladas: 3,
          faltas: 7,
        },
        taxaFaltas: 17.5,
        reincidentes: [],
        faltasPorProfissional: [],
      }

      render(<ReportMetricsGrid report={mockReport} />)

      expect(screen.getByText('Total agendadas')).toBeDefined()
      expect(screen.getByText('40')).toBeDefined()
      expect(screen.getByText('Realizadas')).toBeDefined()
      expect(screen.getByText('30')).toBeDefined()
      expect(screen.getByText('Canceladas')).toBeDefined()
      expect(screen.getByText('3')).toBeDefined()
      expect(screen.getByText('Faltas (No-Show)')).toBeDefined()
      expect(screen.getByText('17.5%')).toBeDefined()
    })
  })

  describe('RepeatOffendersTable Molecule', () => {
    it('renderiza lista de reincidentes com número de faltas', () => {
      const reincidentes = [
        {
          pacienteId: 'p-1',
          nome: 'Carlos Ferreira',
          email: 'carlos@teste.com',
          totalFaltas: 3,
        },
        {
          pacienteId: 'p-2',
          nome: 'Juliana Costa',
          email: 'juliana@teste.com',
          totalFaltas: 1,
        },
      ]

      render(<RepeatOffendersTable repeatOffenders={reincidentes} />)

      expect(screen.getByText('Carlos Ferreira')).toBeDefined()
      expect(screen.getByText('carlos@teste.com')).toBeDefined()
      expect(screen.getByText('3 faltas')).toBeDefined()

      expect(screen.getByText('Juliana Costa')).toBeDefined()
      expect(screen.getByText('1 falta')).toBeDefined()
    })

    it('renderiza estado vazio quando não há pacientes reincidentes', () => {
      render(<RepeatOffendersTable repeatOffenders={[]} />)
      expect(
        screen.getByText('Nenhum paciente reincidente em faltas registrado no período.'),
      ).toBeDefined()
    })

    it('aciona callback de mudança de página ao interagir com a paginação', () => {
      const onPageChange = vi.fn()
      const reincidentes = [
        {
          pacienteId: 'p-1',
          nome: 'Carlos Ferreira',
          email: 'carlos@teste.com',
          totalFaltas: 3,
        },
      ]

      render(
        <RepeatOffendersTable
          repeatOffenders={reincidentes}
          pagination={{
            pagina: 1,
            limite: 1,
            totalItens: 2,
            totalPaginas: 2,
          }}
          onPageChange={onPageChange}
        />,
      )

      const nextBtn = screen.getByRole('button', { name: 'Ir para a próxima página' })
      expect(nextBtn).toBeDefined()
      fireEvent.click(nextBtn)
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })
})
