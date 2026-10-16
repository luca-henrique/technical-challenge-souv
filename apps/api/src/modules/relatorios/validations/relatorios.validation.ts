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
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(10),
  })
  .superRefine((dados, ctx) => {
    if (dados.dataInicio && dados.dataFim && dados.dataInicio > dados.dataFim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de início não pode ser posterior à data de término',
      })
    }
  })

export const gerarPdfBodySchema = z.object({
  tipo: z.enum(['agenda', 'absenteismo']),
  filtros: z
    .object({
      data: z
        .string()
        .optional()
        .refine((d) => !d || dataValida(d), { message: 'Data inválida (AAAA-MM-DD)' }),
      profissionalId: z.string().optional(),
      dataInicio: z
        .string()
        .optional()
        .refine((d) => !d || dataValida(d), { message: 'Data de início inválida' }),
      dataFim: z
        .string()
        .optional()
        .refine((d) => !d || dataValida(d), { message: 'Data de término inválida' }),
      especialidade: z.string().optional(),
    })
    .default({}),
})
