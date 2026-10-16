export type Perfil = 'paciente' | 'recepcao' | 'profissional'
export type TipoConsulta = 'primeira' | 'retorno'
export type StatusConsulta = 'agendada' | 'cancelada' | 'realizada' | 'faltou'

export interface Usuario {
  id: string
  nome: string
  perfil: Perfil
}

export interface Profissional {
  id: string
  nome: string
  especialidade: string
  folga?: boolean
}

export interface Paciente {
  id: string
  nome: string
  email: string
}

export interface Consulta {
  id: string
  profissionalId: string
  pacienteId: string
  data: string
  hora: string
  inicio: string
  fim: string
  tipo: TipoConsulta
  status: StatusConsulta
  criadaEm: string
  canceladaEm: string | null
  pacienteNome?: string
  profissionalNome?: string
  especialidade?: string
}

export interface Agenda {
  data: string
  folga: boolean
  consultas: Consulta[]
}

export interface RelatorioFaltas {
  periodo: {
    dataInicio?: string
    dataFim?: string
  }
  totais: {
    agendadas: number
    realizadas: number
    canceladas: number
    faltas: number
  }
  taxaFaltas: number
  reincidentes: Array<{
    pacienteId: string
    nome: string
    email: string
    totalFaltas: number
  }>
  faltasPorProfissional: Array<{
    profissionalId: string
    nome: string
    especialidade: string
    totalConsultas: number
    faltas: number
    taxaFaltas: number
  }>
}

export type TurnoListaEspera = 'manha' | 'tarde' | 'qualquer'
export type StatusListaEspera = 'aguardando' | 'notificado' | 'atendido' | 'cancelado'

export interface ItemListaEspera {
  id: string
  profissionalId: string
  pacienteId: string
  data: string
  tipo: TipoConsulta
  turno: TurnoListaEspera
  status: StatusListaEspera
  criadaEm: string
  notificadoEm?: string | null
  profissionalNome?: string
  especialidade?: string
  pacienteNome?: string
  pacienteEmail?: string
}

export const FUSO = 'America/Recife'

export const DURACAO_MINUTOS: Record<TipoConsulta, number> = {
  primeira: 60,
  retorno: 30,
}

// Períodos de atendimento em minutos desde a meia-noite (8h às 12h e 13h às 18h)
export const EXPEDIENTE = [
  { inicio: 8 * 60, fim: 12 * 60 },
  { inicio: 13 * 60, fim: 18 * 60 },
]

export function paraMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function paraHora(minutos: number) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0')
  const m = String(minutos % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Todos os horários de início da grade de 30 minutos (08:00, 08:30, ..., 17:30)
export const GRADE = EXPEDIENTE.flatMap((periodo) => {
  const horas: string[] = []
  for (let minuto = periodo.inicio; minuto < periodo.fim; minuto += 30) {
    horas.push(paraHora(minuto))
  }
  return horas
})

// Data de hoje (YYYY-MM-DD) no fuso da clínica, independente do fuso de quem roda o código
export function hojeEmRecife(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(agora)
}

export function dataValida(data: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(data) && !isNaN(new Date(`${data}T12:00:00Z`).getTime()) && new Date(`${data}T12:00:00Z`).toISOString().startsWith(data)
}

export function diaUtil(data: string) {
  const diaDaSemana = new Date(`${data}T12:00:00Z`).getUTCDay()
  return diaDaSemana >= 1 && diaDaSemana <= 5
}

// Recife não tem horário de verão, então o deslocamento é sempre -03:00
export function instante(data: string, hora: string) {
  return new Date(`${data}T${hora}:00-03:00`)
}

export function ehTipoConsulta(tipo: unknown): tipo is TipoConsulta {
  return tipo === 'primeira' || tipo === 'retorno'
}

export function cabeNoExpediente({ hora, tipo }: { hora: string; tipo: TipoConsulta }) {
  const inicio = paraMinutos(hora)
  const fim = inicio + (DURACAO_MINUTOS[tipo] ?? 30)
  return EXPEDIENTE.some((periodo) => inicio >= periodo.inicio && fim <= periodo.fim)
}

export function gradePorTipo(tipo: TipoConsulta) {
  return GRADE.filter((hora) => cabeNoExpediente({ hora, tipo }))
}

// Devolve o motivo quando o horário não pode ser marcado de acordo com a RN01
export function validarHorario(data: string, hora: string, tipo: TipoConsulta, agora = new Date()) {
  if (!dataValida(data)) return 'Informe a data no formato AAAA-MM-DD'
  if (!diaUtil(data)) return 'A clínica só atende de segunda a sexta'
  if (!GRADE.includes(hora)) return 'Escolha um horário da grade de 30 minutos'
  if (!cabeNoExpediente({ hora, tipo })) return 'A consulta precisa terminar antes do almoço ou do fim do expediente'
  if (instante(data, hora) <= agora) return 'Esse horário já passou'
  return null
}

