import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Design System/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Digite seu nome completo',
  },
}

export const WithError: Story = {
  args: {
    value: 'email-invalido',
    hasError: true,
  },
}

export const Disabled: Story = {
  args: {
    value: 'Valor bloqueado',
    disabled: true,
  },
}
