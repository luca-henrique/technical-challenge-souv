import type { Agenda, Profissional, TipoConsulta } from '@bemviver/shared'
import { api } from '@/lib/api'
import type { RespostaFolga, RespostaHorarios } from './types'

export async function listarProfissionais(): Promise<Profissional[]> {
  return api<Profissional[]>('/profissionais')
}

export async function buscarAgenda(profissionalId: string, data: string): Promise<Agenda> {
  return api<Agenda>(`/profissionais/${profissionalId}/agenda?data=${encodeURIComponent(data)}`)
}

export async function buscarHorarios(
  profissionalId: string,
  data: string,
  tipo: TipoConsulta,
): Promise<string[]> {
  const resposta = await api<RespostaHorarios>(
    `/profissionais/${profissionalId}/horarios?data=${encodeURIComponent(data)}&tipo=${encodeURIComponent(tipo)}`,
  )
  return resposta.horarios
}

export async function bloquearDia(profissionalId: string, data: string): Promise<RespostaFolga> {
  return api<RespostaFolga>(`/profissionais/${profissionalId}/folgas`, {
    metodo: 'POST',
    corpo: { data },
  })
}

export const profissionaisService = {
  listarProfissionais,
  buscarAgenda,
  buscarHorarios,
  bloquearDia,
}
