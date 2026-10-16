import { z } from 'zod'
import { dataValida } from '../../../agenda'

export const relatorioFaltasQuerySchema = z
  .object({
    dataInicio: z
      .string()
      .optional()
      .refine((d) => !d || dataValida(d), {
        message: 'Data de início inválida. Use o formato AAAA-MM-DD',
      }),
    dataFim: z
      .string()
      .optional()
      .refine((d) => !d || dataValida(d), {
        message: 'Data de término inválida. Use o formato AAAA-MM-DD',
      }),
    profissionalId: z.string().optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.dataInicio && dados.dataFim && dados.dataInicio > dados.dataFim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de início não pode ser posterior à data de término',
      })
    }
  })
