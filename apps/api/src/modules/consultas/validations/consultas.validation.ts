import { z } from 'zod'
import {
  cabeNoExpediente,
  dataValida,
  diaUtil,
  GRADE,
  instante,
} from '@bemviver/shared'

export const criarConsultaSchema = z
  .object({
    profissionalId: z.string({ message: 'Informe o profissional' }).min(1, 'Informe o profissional'),
    pacienteId: z.string({ message: 'Informe o paciente' }).min(1, 'Informe o paciente'),
    data: z
      .string({ message: 'Informe a data' })
      .min(1, 'Informe a data')
      .refine(dataValida, 'Informe a data no formato AAAA-MM-DD')
      .refine(diaUtil, 'A clínica só atende de segunda a sexta'),
    hora: z
      .string({ message: 'Informe o horário' })
      .min(1, 'Informe o horário')
      .refine((h) => GRADE.includes(h), 'Escolha um horário da grade de 30 minutos'),
    tipo: z.enum(['primeira', 'retorno'] as const, {
      message: 'Informe o tipo da consulta',
    }),
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

    if (dados.data && dados.hora && dataValida(dados.data) && GRADE.includes(dados.hora)) {
      if (instante(dados.data, dados.hora) <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hora'],
          message: 'Esse horário já passou',
        })
      }
    }
  })

export type CriarConsultaInput = z.infer<typeof criarConsultaSchema>

export const remarcarSchema = z.object({
  novaData: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  novaHora: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
})

export type RemarcarInput = z.infer<typeof remarcarSchema>
