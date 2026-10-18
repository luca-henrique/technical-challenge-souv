import type { Meta, StoryObj } from '@storybook/react'
import { DoctorSelector } from './doctor-selector'

const meta: Meta<typeof DoctorSelector> = {
  title: 'Features/Patient/DoctorSelector',
  component: DoctorSelector,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DoctorSelector>

const mockDoctors = [
  { id: '1', nome: 'Dra. Ana Costa', especialidade: 'Cardiologia' },
  { id: '2', nome: 'Dr. Carlos Santos', especialidade: 'Dermatologia' },
  { id: '3', nome: 'Dra. Beatriz Lima', especialidade: 'Pediatria', folga: true },
]

export const Default: Story = {
  args: {
    doctors: mockDoctors,
    value: '',
    onChange: () => {},
  },
}

export const Loading: Story = {
  args: {
    doctors: [],
    value: '',
    isLoading: true,
    onChange: () => {},
  },
}

export const WithError: Story = {
  args: {
    doctors: mockDoctors,
    value: '',
    error: 'Selecione um profissional para continuar',
    onChange: () => {},
  },
}
