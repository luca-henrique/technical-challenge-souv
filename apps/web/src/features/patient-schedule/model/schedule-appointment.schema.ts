import { z } from 'zod'
import {
  cabeNoExpediente,
  dataValida,
  diaUtil,
  GRADE,
  instante,
} from '@bemviver/shared'

export const scheduleAppointmentSchema = z
  .object({
    profissionalId: z.string().min(1, 'Selecione um profissional'),
    data: z
      .string()
      .min(1, 'Selecione uma data')
      .refine(dataValida, 'Informe uma data válida no formato AAAA-MM-DD')
      .refine(diaUtil, 'A clínica só atende de segunda a sexta'),
    tipo: z.enum(['primeira', 'retorno'] as const, {
      message: 'Informe o tipo da consulta',
    }),
    hora: z.string().min(1, 'Selecione um horário'),
  })
  .superRefine((dados, ctx) => {
    if (dados.data && !diaUtil(dados.data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['data'],
        message: 'A clínica só atende de segunda a sexta',
      })
    }

    if (dados.hora && dados.tipo) {
      if (!cabeNoExpediente({ hora: dados.hora, tipo: dados.tipo })) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hora'],
          message:
            'A consulta precisa terminar antes do almoço ou do fim do expediente',
        })
      }
    }

    if (
      dados.data &&
      dados.hora &&
      dataValida(dados.data) &&
      GRADE.includes(dados.hora)
    ) {
      if (instante(dados.data, dados.hora) <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hora'],
          message: 'Esse horário já passou',
        })
      }
    }
  })

export type ScheduleAppointmentValues = z.infer<typeof scheduleAppointmentSchema>
