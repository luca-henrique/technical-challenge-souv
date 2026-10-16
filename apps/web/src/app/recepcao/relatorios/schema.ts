import { z } from 'zod'

export const filtroRelatorioSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  profissionalId: z.string().optional(),
})

export type DadosFiltroRelatorio = z.infer<typeof filtroRelatorioSchema>
