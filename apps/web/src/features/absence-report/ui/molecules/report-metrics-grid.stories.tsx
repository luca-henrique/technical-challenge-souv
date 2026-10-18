import type { Meta, StoryObj } from '@storybook/nextjs'
import { ReportMetricsGrid } from './report-metrics-grid'

const meta: Meta<typeof ReportMetricsGrid> = {
  title: 'Features/AbsenceReport/ReportMetricsGrid',
  component: ReportMetricsGrid,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ReportMetricsGrid>

export const Default: Story = {
  args: {
    report: {
      periodo: {},
      totais: {
        agendadas: 20,
        realizadas: 14,
        canceladas: 2,
        faltas: 4,
      },
      taxaFaltas: 20.0,
      reincidentes: [],
      faltasPorProfissional: [],
    },
  },
}
