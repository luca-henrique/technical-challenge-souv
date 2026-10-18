import type { Paciente } from '@bemviver/shared'
import { httpClient } from '@/shared/api/http-client'

export const patientApi = {
  list(): Promise<Paciente[]> {
    return httpClient.get<Paciente[]>('/pacientes')
  },
}
