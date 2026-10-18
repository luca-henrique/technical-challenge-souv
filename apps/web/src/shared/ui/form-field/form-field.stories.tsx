import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../input/input'
import { FormField } from './form-field'

const meta: Meta<typeof FormField> = {
  title: 'Design System/Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  args: {
    id: 'name-input',
    label: 'Nome Completo',
    hint: 'Informe o nome completo do paciente',
    children: <Input id="name-input" placeholder="João da Silva" />,
  },
}

export const WithError: Story = {
  args: {
    id: 'email-input',
    label: 'E-mail',
    errorText: 'Informe um e-mail válido com @ e domínio.',
    children: (
      <Input
        id="email-input"
        hasError
        defaultValue="email-invalido"
      />
    ),
  },
}

export const RequiredField: Story = {
  args: {
    id: 'cpf-input',
    label: 'CPF',
    required: true,
    children: <Input id="cpf-input" placeholder="000.000.000-00" />,
  },
}
