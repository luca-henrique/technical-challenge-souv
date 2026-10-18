import type { Meta, StoryObj } from '@storybook/nextjs'
import { ScheduleAppointmentsTable } from './schedule-appointments-table'

const meta: Meta<typeof ScheduleAppointmentsTable> = {
  title: 'Features/DoctorSchedule/ScheduleAppointmentsTable',
  component: ScheduleAppointmentsTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScheduleAppointmentsTable>

export const WithAppointments: Story = {
  args: {
    appointments: [
      {
        id: '1',
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
      {
        id: '2',
        data: '2026-10-26',
        hora: '10:00',
        inicio: '2026-10-26T10:00:00',
        fim: '2026-10-26T11:00:00',
        tipo: 'primeira',
        status: 'agendada',
        pacienteId: 'p-2',
        pacienteNome: 'Mariana Souza',
        profissionalId: 'prof-1',
        criadaEm: '2026-10-21T11:00:00',
        canceladaEm: null,
        confirmadaEm: null,
      },
    ],
  },
}

export const Empty: Story = {
  args: {
    appointments: [],
  },
}
