import { api } from '@/lib/api'
import type { LembreteConsulta } from './types'

export async function buscarLembretes(data?: string): Promise<LembreteConsulta[]> {
  const url = data ? `/integracoes/lembretes?data=${encodeURIComponent(data)}` : '/integracoes/lembretes'
  return api<LembreteConsulta[]>(url)
}

export const integracoesService = {
  buscarLembretes,
}
