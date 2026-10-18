import type { Meta, StoryObj } from '@storybook/react'
import { ToastCard, type ToastItem } from './toast'

const meta: Meta<typeof ToastCard> = {
  title: 'Shared/UI/Toast',
  component: ToastCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ToastCard>

const sampleToast: ToastItem = {
  id: 'toast-1',
  type: 'success',
  title: 'Consulta Confirmada',
  description: 'Sua consulta foi agendada para 18/10 às 09:00.',
}

export const Success: Story = {
  args: {
    toast: sampleToast,
    onDismiss: () => {},
  },
}

export const ErrorState: Story = {
  args: {
    toast: {
      id: 'toast-2',
      type: 'error',
      title: 'Erro ao desmarcar',
      description: 'Não foi possível cancelar com menos de 2h de antecedência.',
    },
    onDismiss: () => {},
  },
}

export const WarningState: Story = {
  args: {
    toast: {
      id: 'toast-3',
      type: 'warning',
      title: 'Atenção aos horários',
      description: 'Chegue com pelo menos 15 minutos de antecedência.',
    },
    onDismiss: () => {},
  },
}

export const InfoState: Story = {
  args: {
    toast: {
      id: 'toast-4',
      type: 'info',
      title: 'Nova mensagem',
      description: 'A recepcionista confirmou seu encaixe na fila de espera.',
    },
    onDismiss: () => {},
  },
}
