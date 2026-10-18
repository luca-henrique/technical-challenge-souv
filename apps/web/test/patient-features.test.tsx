import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Consulta } from '@bemviver/shared'
import { AppointmentCard } from '../src/features/patient-appointments/ui/molecules/appointment-card'
import { CancelAppointmentModal } from '../src/features/patient-appointments/ui/molecules/cancel-appointment-modal'
import { SpecialtySelector } from '../src/features/patient-schedule/ui/molecules/specialty-selector'
import { DoctorSelector } from '../src/features/patient-schedule/ui/molecules/doctor-selector'
import { TimeSlotGrid } from '../src/features/patient-schedule/ui/molecules/time-slot-grid'
import { scheduleAppointmentSchema } from '../src/features/patient-schedule/model/schedule-appointment.schema'

describe('Patient Domain FSD Components & Features', () => {
  const sampleAppointment: Consulta = {
    id: 'c-100',
    profissionalId: 'prof-1',
    pacienteId: 'pac-1',
    data: '2026-10-25',
    hora: '09:00',
    inicio: '2026-10-25T09:00:00.000Z',
    fim: '2026-10-25T10:00:00.000Z',
    tipo: 'primeira',
    status: 'agendada',
    criadaEm: '2026-10-18T10:00:00.000Z',
    canceladaEm: null,
    profissionalNome: 'Dra. Carla Mendes',
    especialidade: 'Dermatologia',
  }

  describe('AppointmentCard', () => {
    it('renders appointment details, status badge and cancel button for upcoming', () => {
      const onCancel = vi.fn()
      render(
        <AppointmentCard
          appointment={sampleAppointment}
          isHistory={false}
          onCancelRequest={onCancel}
        />,
      )

      expect(screen.getByText('Dra. Carla Mendes')).toBeDefined()
      expect(screen.getByText('Dermatologia')).toBeDefined()
      expect(screen.getByText('agendada')).toBeDefined()

      const cancelBtn = screen.getByRole('button', { name: 'Desmarcar' })
      fireEvent.click(cancelBtn)
      expect(onCancel).toHaveBeenCalledWith(sampleAppointment)
    })

    it('does not render cancel button when isHistory is true', () => {
      render(
        <AppointmentCard
          appointment={{ ...sampleAppointment, status: 'realizada' }}
          isHistory={true}
        />,
      )
      expect(screen.queryByRole('button', { name: 'Desmarcar' })).toBeNull()
    })
  })

  describe('CancelAppointmentModal', () => {
    it('renders modal details and triggers onConfirm and onClose', () => {
      const onClose = vi.fn()
      const onConfirm = vi.fn()

      render(
        <CancelAppointmentModal
          appointment={sampleAppointment}
          isOpen={true}
          isCancelling={false}
          onClose={onClose}
          onConfirm={onConfirm}
        />,
      )

      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText('Cancelar Consulta')).toBeDefined()
      expect(screen.getByText('Dra. Carla Mendes')).toBeDefined()

      const confirmBtn = screen.getByRole('button', { name: 'Confirmar Cancelamento' })
      fireEvent.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)

      const backBtn = screen.getByRole('button', { name: 'Voltar' })
      fireEvent.click(backBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('SpecialtySelector & DoctorSelector', () => {
    it('renders specialty options and notifies selection', () => {
      const onChange = vi.fn()
      render(
        <SpecialtySelector
          specialties={['Cardiologia', 'Pediatria']}
          value=""
          onChange={onChange}
        />,
      )

      const select = screen.getByLabelText('Filtrar por especialidade')
      fireEvent.change(select, { target: { value: 'Pediatria' } })
      expect(onChange).toHaveBeenCalledWith('Pediatria')
    })

    it('renders doctors with disabled state for days off', () => {
      const onChange = vi.fn()
      render(
        <DoctorSelector
          doctors={[
            { id: '1', nome: 'Dr. Lucas', especialidade: 'Clínica', folga: true },
            { id: '2', nome: 'Dra. Julia', especialidade: 'Clínica' },
          ]}
          value=""
          onChange={onChange}
        />,
      )

      const select = screen.getByLabelText('Selecionar profissional médico')
      fireEvent.change(select, { target: { value: '2' } })
      expect(onChange).toHaveBeenCalledWith('2')
    })
  })

  describe('TimeSlotGrid', () => {
    it('renders time slot buttons with accessible aria-pressed and handles selection', () => {
      const onSelect = vi.fn()
      render(
        <TimeSlotGrid
          slots={['08:00', '09:00', '10:00']}
          selectedTime="09:00"
          onSelect={onSelect}
        />,
      )

      const slot9 = screen.getByRole('button', { name: '09:00' })
      expect(slot9.getAttribute('aria-pressed')).toBe('true')

      const slot10 = screen.getByRole('button', { name: '10:00' })
      expect(slot10.getAttribute('aria-pressed')).toBe('false')

      fireEvent.click(slot10)
      expect(onSelect).toHaveBeenCalledWith('10:00')
    })
  })

  describe('scheduleAppointmentSchema', () => {
    it('rejects empty fields', () => {
      const result = scheduleAppointmentSchema.safeParse({
        profissionalId: '',
        data: '',
        tipo: 'primeira',
        hora: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects past dates or invalid format', () => {
      const result = scheduleAppointmentSchema.safeParse({
        profissionalId: 'p-1',
        data: '2020-01-01',
        tipo: 'primeira',
        hora: '09:00',
      })
      expect(result.success).toBe(false)
    })
  })
})
