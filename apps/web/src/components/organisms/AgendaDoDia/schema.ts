import { z } from 'zod'
import { cabeNoExpediente } from '@bemviver/shared'

export const agendarConsultaSchema = z
  .object({
    pacienteId: z.string().min(1, 'Selecione um paciente'),
    tipo: z.enum(['primeira', 'retorno'] as const),
    hora: z.string().min(1, 'Selecione um horário'),
  })
  .superRefine((dados, ctx) => {
    if (dados.hora && dados.tipo) {
      if (!cabeNoExpediente({ hora: dados.hora, tipo: dados.tipo })) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hora'],
          message: 'A consulta precisa terminar antes do almoço ou do fim do expediente',
        })
      }
    }
  })

export type DadosAgendarConsulta = z.infer<typeof agendarConsultaSchema>
