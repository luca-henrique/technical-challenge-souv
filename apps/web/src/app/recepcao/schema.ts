import { z } from 'zod'

export const filtroRecepcaoSchema = z.object({
  profissionalId: z.string().min(1, 'Selecione um profissional'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida no formato AAAA-MM-DD'),
})

export type FiltroRecepcao = z.infer<typeof filtroRecepcaoSchema>
