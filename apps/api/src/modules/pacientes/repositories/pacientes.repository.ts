import type { TipoConsulta } from '@bemviver/shared'
import { prisma } from '../../../infra/database'
import type { ConsultaPacienteEntity, PacienteEntity } from '../entities/pacientes.entity'

export interface IPacientesRepository {
  listarPacientes(): Promise<PacienteEntity[]>
  cancelarConsultasExpiradasNaoConfirmadas(pacienteId?: string): Promise<void>
  listarConsultasPaciente(pacienteId: string): Promise<ConsultaPacienteEntity[]>
}

export class PrismaPacientesRepository implements IPacientesRepository {
  async listarPacientes(): Promise<PacienteEntity[]> {
    return prisma.usuario.findMany({
      where: { perfil: 'paciente' },
      select: { id: true, nome: true, email: true },
      orderBy: { nome: 'asc' },
    })
  }

  async cancelarConsultasExpiradasNaoConfirmadas(pacienteId?: string): Promise<void> {
    const agora = new Date()
    await prisma.consulta.updateMany({
      where: {
        ...(pacienteId ? { pacienteId } : {}),
        status: 'agendada',
        confirmadaEm: null,
        inicio: { lte: agora },
      },
      data: {
        status: 'cancelada',
        canceladaEm: agora,
      },
    })
  }

  async listarConsultasPaciente(pacienteId: string): Promise<ConsultaPacienteEntity[]> {
    const consultas = await prisma.consulta.findMany({
      where: { pacienteId },
      include: { profissional: { include: { usuario: { select: { nome: true } } } } },
      orderBy: { inicio: 'desc' },
    })

    return consultas.map(({ profissional, ...c }) => ({
      ...c,
      tipo: c.tipo as TipoConsulta,
      profissionalNome: profissional.usuario.nome,
      especialidade: profissional.especialidade,
    }))
  }
}
