import { z } from 'zod'

export const bloquearPeriodoSchema = z
  .object({
    dataInicio: z.string().min(1, 'Informe a data de início'),
    dataFim: z.string().min(1, 'Informe a data de término'),
  })
  .refine((d) => d.dataInicio <= d.dataFim, {
    message: 'A data de início não pode ser posterior à data de término',
    path: ['dataFim'],
  })

export type DadosBloquearPeriodo = z.infer<typeof bloquearPeriodoSchema>
