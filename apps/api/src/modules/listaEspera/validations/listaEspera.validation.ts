import { z } from 'zod'

export const inscreverSchema = z.object({
  profissionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  tipo: z.enum(['primeira', 'retorno']),
  turno: z.enum(['manha', 'tarde', 'qualquer']).default('qualquer'),
  pacienteId: z.string().optional(),
})

export type InscreverListaEsperaInput = z.infer<typeof inscreverSchema>
