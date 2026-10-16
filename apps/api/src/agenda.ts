import {
  cabeNoExpediente,
  dataValida,
  diaUtil,
  DURACAO_MINUTOS,
  ehTipoConsulta,
  GRADE,
  instante,
  paraMinutos,
  type TipoConsulta,
  validarHorario,
} from '@bemviver/shared'

export interface Horario {
  hora: string
  tipo: TipoConsulta
  status?: string
}

export { cabeNoExpediente, dataValida, diaUtil, ehTipoConsulta, instante, validarHorario }

export function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function temConflito(marcadas: Horario[], nova: Horario) {
  const iniNova = paraMinutos(nova.hora)
  const fimNova = iniNova + (DURACAO_MINUTOS[nova.tipo] ?? 30)

  return marcadas.some((marcada) => {
    if (marcada.status === 'cancelada') {
      return false
    }
    const iniMarcada = paraMinutos(marcada.hora)
    const fimMarcada = iniMarcada + (DURACAO_MINUTOS[marcada.tipo] ?? 30)
    return iniNova < fimMarcada && fimNova > iniMarcada
  })
}

export function horariosDisponiveis(marcadas: Horario[], tipo: TipoConsulta, data: string, agora = new Date()) {
  if (!diaUtil(data)) {
    return []
  }

  return GRADE.filter(
    (hora) =>
      cabeNoExpediente({ hora, tipo }) &&
      instante(data, hora) > agora &&
      !temConflito(marcadas, { hora, tipo }),
  )
}
