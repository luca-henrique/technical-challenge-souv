import { z } from 'zod'

export const scheduleAppointmentSchema = z.object({
  profissionalId: z.string().min(1, 'Selecione o profissional'),
  pacienteId: z.string().min(1, 'Selecione o paciente'),
  data: z.string().min(1, 'Selecione a data'),
  tipo: z.enum(['primeira', 'retorno']),
  hora: z.string().min(1, 'Selecione o horário'),
})

export type ScheduleAppointmentFormData = z.infer<typeof scheduleAppointmentSchema>
