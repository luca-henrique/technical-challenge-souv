import type { Consulta } from '@bemviver/shared'
import { api } from '@/lib/api'
import type { CriarConsultaParams } from './types'

export async function listarMinhasConsultas(historico = false): Promise<Consulta[]> {
  const caminho = historico ? '/consultas/minhas?historico=true' : '/consultas/minhas'
  return api<Consulta[]>(caminho)
}

export async function agendarConsulta(dados: CriarConsultaParams): Promise<Consulta> {
  return api<Consulta>('/consultas', {
    metodo: 'POST',
    corpo: dados,
  })
}

export async function cancelarConsulta(consultaId: string): Promise<Consulta> {
  return api<Consulta>(`/consultas/${encodeURIComponent(consultaId)}/cancelar`, {
    metodo: 'POST',
  })
}

export async function registrarFalta(consultaId: string): Promise<Consulta> {
  return api<Consulta>(`/consultas/${encodeURIComponent(consultaId)}/falta`, {
    metodo: 'POST',
  })
}

export const consultasService = {
  listarMinhasConsultas,
  agendarConsulta,
  cancelarConsulta,
  registrarFalta,
}
