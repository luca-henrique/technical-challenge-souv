import type { Agenda, Profissional, TipoConsulta } from '@bemviver/shared'
import { httpClient } from '@/shared/api/http-client'
import type { ProfessionalFilters } from '../model/types'

export const professionalApi = {
  list(filters?: ProfessionalFilters): Promise<Profissional[]> {
    return httpClient.get<Profissional[]>('/profissionais', filters as Record<string, string | number | boolean | undefined>)
  },

  listSpecialties(): Promise<string[]> {
    return httpClient.get<string[]>('/profissionais/especialidades')
  },

  getSchedule(professionalId: string, date: string): Promise<Agenda> {
    return httpClient.get<Agenda>(`/profissionais/${professionalId}/agenda`, {
      data: date,
    })
  },

  getAvailableSlots(
    professionalId: string,
    date: string,
    type: TipoConsulta,
  ): Promise<string[]> {
    return httpClient.get<string[]>(
      `/profissionais/${professionalId}/horarios`,
      {
        data: date,
        tipo: type,
      },
    )
  },

  blockDay(professionalId: string, date: string): Promise<{ data: string }> {
    return httpClient.post<{ data: string }>(
      `/profissionais/${professionalId}/folgas`,
      { data: date },
    )
  },

  blockPeriod(
    professionalId: string,
    period: { dataInicio: string; dataFim: string },
  ): Promise<{ dataInicio: string; dataFim: string; totalDias: number }> {
    return httpClient.post<{
      dataInicio: string
      dataFim: string
      totalDias: number
    }>(`/profissionais/${professionalId}/folgas/periodo`, period)
  },
}
