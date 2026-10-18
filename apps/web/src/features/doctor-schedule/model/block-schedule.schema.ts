import { z } from 'zod'

export const blockDaySchema = z.object({
  date: z
    .string()
    .min(1, 'A data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
})

export type BlockDayInput = z.infer<typeof blockDaySchema>

export const blockPeriodSchema = z
  .object({
    startDate: z
      .string()
      .min(1, 'Informe a data de início')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato AAAA-MM-DD'),
    endDate: z
      .string()
      .min(1, 'Informe a data de término')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de término deve estar no formato AAAA-MM-DD'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'A data de início não pode ser posterior à data de término',
    path: ['endDate'],
  })

export type BlockPeriodInput = z.infer<typeof blockPeriodSchema>
