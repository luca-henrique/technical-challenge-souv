import { z } from 'zod'

export const pacienteIdParamSchema = z.object({
  id: z.string().min(1, 'ID do paciente é obrigatório'),
})
