import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'Design System/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Agendada: Story = {
  args: {
    variant: 'agendada',
    children: 'Agendada',
  },
}

export const Realizada: Story = {
  args: {
    variant: 'realizada',
    children: 'Realizada',
  },
}

export const Cancelada: Story = {
  args: {
    variant: 'cancelada',
    children: 'Cancelada',
  },
}

export const Faltou: Story = {
  args: {
    variant: 'faltou',
    children: 'Falta Registrada',
  },
}
