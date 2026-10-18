import { FUSO } from '@bemviver/shared'

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    if (!year || !month || !day) return dateString
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: FUSO,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return isoString
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    if (!year || !month || !day) return dateString
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  } catch {
    return dateString
  }
}

export const APPOINTMENT_TYPE_LABELS = {
  primeira: 'Primeira consulta (60 min)',
  retorno: 'Retorno (30 min)',
} as const
