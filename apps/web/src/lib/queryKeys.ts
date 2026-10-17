/**
 * Type-safe Query Keys Factory following English nomenclature
 * Provides consistent caching keys across all queries and mutations
 */
export const queryKeys = {
  professionals: {
    all: ['profissionais'] as const,
    list: (params?: unknown) => ['profissionais', params] as const,
    specialties: ['especialidades'] as const,
    agenda: (id: string, date: string) => ['agenda', id, date] as const,
    slots: (id?: string, date?: string, type?: string) =>
      ['horarios', id, date, type] as const,
  },
  patients: {
    all: ['pacientes'] as const,
  },
  consultations: {
    all: ['consultas'] as const,
    my: (patientId?: string) => ['consultas', 'paciente', patientId] as const,
  },
  reports: {
    absences: (filters?: unknown) => ['relatorios', 'faltas', filters] as const,
  },
  waitingList: {
    all: ['lista-espera'] as const,
    my: ['lista-espera', 'minhas'] as const,
    reception: (filters?: unknown) => ['lista-espera', 'todos', filters] as const,
  },
} as const
