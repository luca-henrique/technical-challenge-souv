import type { Meta, StoryObj } from '@storybook/nextjs'
import { ScheduleDateNav } from './schedule-date-nav'

const meta: Meta<typeof ScheduleDateNav> = {
  title: 'Features/DoctorSchedule/ScheduleDateNav',
  component: ScheduleDateNav,
  tags: ['autodocs'],
  args: {
    selectedDate: '2026-10-26',
    disabled: false,
    onDateChange: () => {},
    onPreviousDay: () => {},
    onNextDay: () => {},
    onToday: () => {},
  },
}

export default meta
type Story = StoryObj<typeof ScheduleDateNav>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
