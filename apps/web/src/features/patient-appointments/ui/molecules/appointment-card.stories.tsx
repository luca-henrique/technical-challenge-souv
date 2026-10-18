import type { Meta, StoryObj } from '@storybook/react'
import type { Consulta } from '@bemviver/shared'
import { AppointmentCard } from './appointment-card'

const meta: Meta<typeof AppointmentCard> = {
  title: 'Features/Patient/AppointmentCard',
  component: AppointmentCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AppointmentCard>

const sampleAppointment: Consulta = {
  id: 'c-1',
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
  confirmadaEm: null,
  profissionalNome: 'Dra. Ana Silva',
  especialidade: 'Cardiologia',
}

export const Scheduled: Story = {
  args: {
    appointment: sampleAppointment,
    isHistory: false,
    onCancelRequest: () => {},
  },
}

export const ConfirmedHistory: Story = {
  args: {
    appointment: {
      ...sampleAppointment,
      status: 'realizada',
    },
    isHistory: true,
  },
}

export const Cancelled: Story = {
  args: {
    appointment: {
      ...sampleAppointment,
      status: 'cancelada',
    },
    isHistory: true,
  },
}
