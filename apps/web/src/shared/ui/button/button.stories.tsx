import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'Design System/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Agendar Consulta',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancelar Agendamento',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Registrar Falta',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    loadingText: 'Salvando consulta...',
    children: 'Salvar',
  },
}
