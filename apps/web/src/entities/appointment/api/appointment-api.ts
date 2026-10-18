import type { Consulta } from '@bemviver/shared'
import { httpClient } from '@/shared/api/http-client'
import type {
  RescheduleAppointmentParams,
  ScheduleAppointmentParams,
} from '../model/types'

export const appointmentApi = {
  schedule(data: ScheduleAppointmentParams): Promise<Consulta> {
    return httpClient.post<Consulta>('/consultas', data)
  },

  cancel(id: string): Promise<Consulta> {
    return httpClient.post<Consulta>(`/consultas/${id}/cancelar`)
  },

  registerAbsence(id: string): Promise<Consulta> {
    return httpClient.post<Consulta>(`/consultas/${id}/falta`)
  },

  confirm(id: string): Promise<Consulta> {
    return httpClient.post<Consulta>(`/consultas/${id}/confirmar`)
  },

  reschedule({ id, novaData, novaHora }: RescheduleAppointmentParams): Promise<Consulta> {
    return httpClient.patch<Consulta>(`/consultas/${id}/remarcar`, {
      novaData,
      novaHora,
    })
  },

  myAppointments(): Promise<Consulta[]> {
    return httpClient.get<Consulta[]>('/consultas/minhas')
  },
}
