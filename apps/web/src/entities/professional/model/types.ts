import type { Agenda, Profissional } from '@bemviver/shared'

export type Professional = Profissional
export type ProfessionalSchedule = Agenda

export interface ProfessionalFilters {
  data?: string
  profissionalId?: string
  especialidade?: string
}
