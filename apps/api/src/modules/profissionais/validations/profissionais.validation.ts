import { z } from 'zod'
import { dataValida, ehTipoConsulta } from '../../../agenda'

export const filtroProfissionaisSchema = z.object({
  data: z
    .string()
    .optional()
    .refine((d) => !d || dataValida(d), { message: 'Informe a data no formato AAAA-MM-DD' }),
  profissionalId: z.string().optional(),
  especialidade: z.string().optional(),
})

export const agendaQuerySchema = z.object({
  data: z
    .string({ message: 'Informe a data no formato AAAA-MM-DD' })
    .refine(dataValida, { message: 'Informe a data no formato AAAA-MM-DD' }),
})

export const horariosQuerySchema = z.object({
  data: z
    .string({ message: 'Informe a data (AAAA-MM-DD) e o tipo da consulta' })
    .refine(dataValida, { message: 'Informe a data (AAAA-MM-DD) e o tipo da consulta' }),
  tipo: z
    .string({ message: 'Informe a data (AAAA-MM-DD) e o tipo da consulta' })
    .refine(ehTipoConsulta, { message: 'Informe a data (AAAA-MM-DD) e o tipo da consulta' }),
})

export const bloquearFolgaSchema = z.object({
  data: z
    .string({ message: 'Informe a data no formato AAAA-MM-DD' })
    .refine(dataValida, { message: 'Informe a data no formato AAAA-MM-DD' }),
})

export const bloquearPeriodoSchema = z.object({
  dataInicio: z
    .string({ message: 'Informe as datas de início e fim no formato AAAA-MM-DD' })
    .refine(dataValida, { message: 'Informe as datas de início e fim no formato AAAA-MM-DD' }),
  dataFim: z
    .string({ message: 'Informe as datas de início e fim no formato AAAA-MM-DD' })
    .refine(dataValida, { message: 'Informe as datas de início e fim no formato AAAA-MM-DD' }),
})
