import type { StatusConsulta, TipoConsulta } from '@bemviver/shared'

export function formatarData(data: string) {
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}

export const NOME_TIPO: Record<TipoConsulta, string> = {
  primeira: 'Primeira consulta',
  retorno: 'Retorno',
}

export const NOME_TIPO_COM_DURACAO: Record<TipoConsulta, string> = {
  primeira: 'Primeira consulta (60 min)',
  retorno: 'Retorno (30 min)',
}

export const NOME_STATUS: Record<StatusConsulta, string> = {
  agendada: 'Agendada',
  cancelada: 'Cancelada',
  realizada: 'Realizada',
  faltou: 'Faltou',
}
