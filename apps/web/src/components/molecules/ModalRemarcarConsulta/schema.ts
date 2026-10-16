import { z } from 'zod'
import { diaUtil, hojeEmRecife } from '@bemviver/shared'

export const remarcarConsultaSchema = z.object({
  novaData: z
    .string()
    .min(1, 'Selecione uma nova data')
    .refine((data) => data >= hojeEmRecife(), 'A data não pode ser anterior a hoje')
    .refine((data) => diaUtil(data), 'A clínica não atende aos finais de semana'),
  novaHora: z
    .string()
    .min(1, 'Selecione um horário disponível'),
})

export type DadosRemarcarConsultaForm = z.infer<typeof remarcarConsultaSchema>
