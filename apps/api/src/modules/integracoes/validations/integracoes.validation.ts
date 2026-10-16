import { z } from 'zod'
import { dataValida } from '../../../agenda'

export const lembretesQuerySchema = z.object({
  data: z
    .string()
    .optional()
    .refine((d) => !d || dataValida(d), { message: 'Informe a data no formato AAAA-MM-DD' }),
})
