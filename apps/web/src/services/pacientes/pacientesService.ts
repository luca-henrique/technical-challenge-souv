import type { Paciente } from '@bemviver/shared'
import { api } from '@/lib/api'

export async function listarPacientes(): Promise<Paciente[]> {
  return api<Paciente[]>('/pacientes')
}

export const pacientesService = {
  listarPacientes,
}
