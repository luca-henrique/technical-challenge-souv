import type {
  Consulta,
  StatusConsulta,
  TipoConsulta,
} from '@bemviver/shared'

export type Appointment = Consulta
export type AppointmentStatus = StatusConsulta
export type AppointmentType = TipoConsulta

export interface ScheduleAppointmentParams {
  profissionalId: string
  pacienteId: string
  data: string
  hora: string
  tipo: TipoConsulta
}

export interface RescheduleAppointmentParams {
  id: string
  novaData: string
  novaHora: string
}
