import { z } from 'zod'

export const agendarConsultaSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  tipo: z.enum(['primeira', 'retorno']),
  hora: z.string().min(1, 'Selecione um horário'),
})

export type DadosAgendarConsulta = z.infer<typeof agendarConsultaSchema>
