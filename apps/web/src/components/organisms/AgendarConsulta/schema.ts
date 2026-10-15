import { z } from 'zod'

export const agendarConsultaPacienteSchema = z.object({
  profissionalId: z.string().min(1, 'Selecione um profissional'),
  data: z.string().min(1, 'Selecione uma data'),
  tipo: z.enum(['primeira', 'retorno']),
  hora: z.string().min(1, 'Selecione um horário'),
})

export type DadosAgendarConsultaPaciente = z.infer<typeof agendarConsultaPacienteSchema>
