import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import { Button } from '../button/button'

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Dashed: Story = {
  args: {
    title: 'Nenhuma consulta encontrada',
    description: 'Você ainda não possui consultas agendadas para esta semana.',
    variant: 'dashed',
    action: <Button size="sm">Agendar agora</Button>,
  },
}

export const CardVariant: Story = {
  args: {
    title: 'Fila de espera vazia',
    description: 'Não há pacientes aguardando vagas no momento.',
    variant: 'card',
  },
}

export const InlineVariant: Story = {
  args: {
    title: 'Sem atividades recentes',
    variant: 'inline',
  },
}
