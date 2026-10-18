import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Atoms/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    className: 'w-64 h-24',
  },
}

export const Circular: Story = {
  args: {
    variant: 'circular',
    className: 'w-12 h-12',
  },
}

export const TextLine: Story = {
  args: {
    variant: 'text',
    className: 'w-48 h-4',
  },
}
