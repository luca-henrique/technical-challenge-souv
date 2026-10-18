import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from './typography'

const meta: Meta<typeof Typography> = {
  title: 'Design System/Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Typography>

export const PageTitle: Story = {
  args: {
    variant: 'title',
    children: 'Agenda da Recepção',
  },
}

export const PageSubtitle: Story = {
  args: {
    variant: 'subtitle',
    children: 'Gerenciamento de atendimentos e profissionais da clínica',
  },
}

export const SectionTitle: Story = {
  args: {
    variant: 'section-title',
    children: 'Consultas Marcadas',
  },
}

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'Texto de corpo padrão da aplicação para descrições e listagens.',
  },
}

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'Atualizado em tempo real via BFF Next.js',
  },
}
