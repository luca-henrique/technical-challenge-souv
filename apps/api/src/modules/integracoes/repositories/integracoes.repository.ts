import type { TipoConsulta } from '@bemviver/shared'
import { prisma } from '../../../infra/database'
import type { LembreteConsultaEntity } from '../entities/integracoes.entity'

export interface IIntegracoesRepository {
  buscarConsultasParaLembrete(data: string): Promise<LembreteConsultaEntity[]>
}

export class PrismaIntegracoesRepository implements IIntegracoesRepository {
  async buscarConsultasParaLembrete(data: string): Promise<LembreteConsultaEntity[]> {
    const consultas = await prisma.consulta.findMany({
      where: { data, status: 'agendada' },
      include: {
        paciente: { select: { nome: true, email: true } },
        profissional: { include: { usuario: { select: { nome: true } } } },
      },
      orderBy: { inicio: 'asc' },
    })

    return consultas.map((consulta) => ({
      id: consulta.id,
      consultaId: consulta.id,
      data: consulta.data,
      hora: consulta.hora,
      tipo: consulta.tipo as TipoConsulta,
      pacienteNome: consulta.paciente.nome,
      pacienteEmail: consulta.paciente.email,
      profissionalNome: consulta.profissional.usuario.nome,
      especialidade: consulta.profissional.especialidade,
    }))
  }
}
