import { z } from 'zod'

export const absenceReportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorId: z.string().optional(),
})

export type AbsenceReportFilterInput = z.infer<typeof absenceReportFilterSchema>
