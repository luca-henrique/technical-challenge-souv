import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  blockDaySchema,
  blockPeriodSchema,
} from '../src/features/doctor-schedule/model/block-schedule.schema'
import { ScheduleDateNav } from '../src/features/doctor-schedule/ui/molecules/schedule-date-nav'
import { BlockDayAction } from '../src/features/doctor-schedule/ui/molecules/block-day-action'
import { BlockPeriodModal } from '../src/features/doctor-schedule/ui/molecules/block-period-modal'
import { ScheduleAppointmentsTable } from '../src/features/doctor-schedule/ui/molecules/schedule-appointments-table'
import type { Consulta } from '@bemviver/shared'

describe('Doctor Schedule Features', () => {
  describe('Zod Schemas', () => {
    it('valida formato de data para bloqueio de dia individual', () => {
      const valid = blockDaySchema.safeParse({ date: '2026-10-26' })
      expect(valid.success).toBe(true)

      const invalid = blockDaySchema.safeParse({ date: '26/10/2026' })
      expect(invalid.success).toBe(false)
    })

    it('valida intervalo de datas para bloqueio de período (férias)', () => {
      const valid = blockPeriodSchema.safeParse({
        startDate: '2026-11-01',
        endDate: '2026-11-15',
      })
      expect(valid.success).toBe(true)

      const inverted = blockPeriodSchema.safeParse({
        startDate: '2026-11-20',
        endDate: '2026-11-10',
      })
      expect(inverted.success).toBe(false)
      if (!inverted.success) {
        expect(inverted.error.issues[0]?.message).toContain(
          'A data de início não pode ser posterior',
        )
      }
    })
  })

  describe('ScheduleDateNav Molecule', () => {
    it('renderiza a data e aciona callbacks de navegação', () => {
      const onPreviousDay = vi.fn()
      const onNextDay = vi.fn()
      const onToday = vi.fn()
      const onDateChange = vi.fn()

      render(
        <ScheduleDateNav
          selectedDate="2026-10-26"
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          onToday={onToday}
          onDateChange={onDateChange}
        />,
      )

      expect(screen.getByRole('button', { name: 'Dia anterior' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Próximo dia' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Hoje' })).toBeDefined()

      fireEvent.click(screen.getByRole('button', { name: 'Dia anterior' }))
      expect(onPreviousDay).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByRole('button', { name: 'Próximo dia' }))
      expect(onNextDay).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByRole('button', { name: 'Hoje' }))
      expect(onToday).toHaveBeenCalledTimes(1)
    })
  })

  describe('BlockDayAction Molecule', () => {
    it('alterna entre gatilho inicial e confirmação inline', () => {
      const onConfirm = vi.fn()
      const onConfirmingChange = vi.fn()

      const { rerender } = render(
        <BlockDayAction
          isConfirming={false}
          onConfirmingChange={onConfirmingChange}
          onConfirm={onConfirm}
        />,
      )

      const triggerBtn = screen.getByRole('button', {
        name: 'Bloquear este dia como folga',
      })
      fireEvent.click(triggerBtn)
      expect(onConfirmingChange).toHaveBeenCalledWith(true)

      rerender(
        <BlockDayAction
          isConfirming={true}
          onConfirmingChange={onConfirmingChange}
          onConfirm={onConfirm}
        />,
      )

      const confirmBtn = screen.getByRole('button', { name: 'Confirmar folga' })
      const backBtn = screen.getByRole('button', { name: 'Voltar' })

      expect(confirmBtn).toBeDefined()
      expect(backBtn).toBeDefined()

      fireEvent.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)

      fireEvent.click(backBtn)
      expect(onConfirmingChange).toHaveBeenCalledWith(false)
    })
  })

  describe('ScheduleAppointmentsTable Molecule', () => {
    it('renderiza tabela de consultas com badges de situação', () => {
      const mockAppointments: Consulta[] = [
        {
          id: 'c-1',
          data: '2026-10-26',
          hora: '09:00',
          inicio: '2026-10-26T09:00:00',
          fim: '2026-10-26T09:30:00',
          tipo: 'retorno',
          status: 'agendada',
          pacienteId: 'p-1',
          pacienteNome: 'Lucas Henrique',
          profissionalId: 'prof-1',
          criadaEm: '2026-10-20T10:00:00',
          canceladaEm: null,
          confirmadaEm: '2026-10-25T08:00:00',
        },
      ]

      render(<ScheduleAppointmentsTable appointments={mockAppointments} />)

      expect(screen.getByText('09:00')).toBeDefined()
      expect(screen.getByText('Lucas Henrique')).toBeDefined()
      expect(screen.getByText('Retorno')).toBeDefined()
      expect(screen.getByText('Confirmada')).toBeDefined()
    })

    it('renderiza estado vazio quando não há consultas', () => {
      render(<ScheduleAppointmentsTable appointments={[]} />)
      expect(screen.getByText('Nenhuma consulta neste dia.')).toBeDefined()
    })
  })

  describe('BlockPeriodModal Molecule', () => {
    it('renderiza modal acessível e permite fechar', () => {
      const onClose = vi.fn()
      const onConfirm = vi.fn()

      render(
        <BlockPeriodModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
        />,
      )

      expect(
        screen.getByRole('dialog', {
          name: 'Bloquear período de folga (férias/recesso)',
        }),
      ).toBeDefined()

      const cancelBtn = screen.getByRole('button', { name: 'Cancelar' })
      fireEvent.click(cancelBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
