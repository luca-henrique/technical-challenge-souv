import type { Meta, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'
import { ReceptionFilterBar } from './reception-filter-bar'
import type { ReceptionAgendaFilterInput } from '../../model/reception-agenda.schema'

function ReceptionFilterBarWrapper() {
  const { control, formState: { errors } } = useForm<ReceptionAgendaFilterInput>({
    defaultValues: {
      professionalId: 'prof-1',
      date: '2026-10-26',
    },
  })

  return (
    <ReceptionFilterBar
      control={control}
      errors={errors}
      professionals={[
        { id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' },
        { id: 'prof-2', nome: 'Dra. Julia', especialidade: 'Pediatria' },
      ]}
    />
  )
}

const meta: Meta<typeof ReceptionFilterBarWrapper> = {
  title: 'Features/ReceptionAgenda/ReceptionFilterBar',
  component: ReceptionFilterBarWrapper,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ReceptionFilterBarWrapper>

export const Default: Story = {}
