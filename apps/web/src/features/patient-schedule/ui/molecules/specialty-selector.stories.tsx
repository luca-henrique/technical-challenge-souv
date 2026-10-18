import type { Meta, StoryObj } from '@storybook/react'
import { SpecialtySelector } from './specialty-selector'

const meta: Meta<typeof SpecialtySelector> = {
  title: 'Features/Patient/SpecialtySelector',
  component: SpecialtySelector,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SpecialtySelector>

export const Default: Story = {
  args: {
    specialties: ['Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria'],
    value: '',
    onChange: () => {},
  },
}

export const Selected: Story = {
  args: {
    specialties: ['Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria'],
    value: 'Cardiologia',
    onChange: () => {},
  },
}
