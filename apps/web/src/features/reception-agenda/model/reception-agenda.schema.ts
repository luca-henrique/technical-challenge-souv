import { z } from 'zod'

export const receptionAgendaFilterSchema = z.object({
  professionalId: z.string().optional(),
  date: z
    .string()
    .min(1, 'A data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
})

export type ReceptionAgendaFilterInput = z.infer<typeof receptionAgendaFilterSchema>
