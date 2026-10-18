import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button/button'
import { Modal } from './modal'

const meta: Meta<typeof Modal> = {
  title: 'Design System/Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Modal>

export const OpenModal: Story = {
  args: {
    isOpen: true,
    title: 'Confirmar Cancelamento',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Deseja realmente cancelar este agendamento? Esta ação não poderá ser desfeita.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="compact">
            Voltar
          </Button>
          <Button variant="danger" size="compact">
            Confirmar Cancelamento
          </Button>
        </div>
      </div>
    ),
  },
}
