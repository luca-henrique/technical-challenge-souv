import type { TipoConsulta } from '@bemviver/shared'
import { prisma, type Prisma } from '../../../infra/database'
import type {
  ConsultaComProfissionalEntity,
  ConsultaEntity,
  CriarConsultaDados,
} from '../entities/consultas.entity'

export interface IConsultasRepository {
  buscarPorId(id: string): Promise<ConsultaComProfissionalEntity | null>
  buscarPaciente(id: string): Promise<boolean>
  buscarProfissional(id: string): Promise<boolean>
  cancelarConsultasExpiradasNaoConfirmadas(pacienteId?: string): Promise<void>
  listarMinhasConsultas(
    pacienteId: string,
    historico: boolean
  ): Promise<ConsultaComProfissionalEntity[]>
  criarConsulta(dados: CriarConsultaDados & { inicio: Date; fim: Date }): Promise<ConsultaEntity>
  cancelarConsulta(id: string): Promise<ConsultaEntity>
  confirmarConsulta(id: string): Promise<ConsultaComProfissionalEntity>
  remarcarConsulta(
    id: string,
    dados: { novaData: string; novaHora: string; novoInicio: Date; novoFim: Date }
  ): Promise<ConsultaEntity>
  registrarFalta(id: string): Promise<ConsultaEntity>
}

export class PrismaConsultasRepository implements IConsultasRepository {
  async buscarPorId(id: string): Promise<ConsultaComProfissionalEntity | null> {
    const consulta = await prisma.consulta.findUnique({
      where: { id },
      include: { profissional: { include: { usuario: true } } },
    })

    if (!consulta) return null

    return {
      id: consulta.id,
      profissionalId: consulta.profissionalId,
      pacienteId: consulta.pacienteId,
      data: consulta.data,
      hora: consulta.hora,
      tipo: consulta.tipo as TipoConsulta,
      status: consulta.status,
      inicio: consulta.inicio,
      fim: consulta.fim,
      confirmadaEm: consulta.confirmadaEm,
      canceladaEm: consulta.canceladaEm,
      profissionalNome: consulta.profissional.usuario.nome,
      especialidade: consulta.profissional.especialidade,
    }
  }

  async buscarPaciente(id: string): Promise<boolean> {
    const paciente = await prisma.usuario.findFirst({
      where: { id, perfil: 'paciente' },
    })
    return Boolean(paciente)
  }

  async buscarProfissional(id: string): Promise<boolean> {
    const profissional = await prisma.profissional.findUnique({
      where: { id },
    })
    return Boolean(profissional)
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

  async listarMinhasConsultas(
    pacienteId: string,
    historico: boolean
  ): Promise<ConsultaComProfissionalEntity[]> {
    const agora = new Date()
    const whereClause: Prisma.ConsultaWhereInput = historico
      ? {
          pacienteId,
          OR: [
            { inicio: { lte: agora } },
            { status: { in: ['realizada', 'faltou', 'cancelada'] } },
          ],
        }
      : {
          pacienteId,
          inicio: { gt: agora },
          status: 'agendada',
        }

    const consultas = await prisma.consulta.findMany({
      where: whereClause,
      include: { profissional: { include: { usuario: { select: { nome: true } } } } },
      orderBy: { inicio: historico ? 'desc' : 'asc' },
    })

    return consultas.map(({ profissional, ...c }) => ({
      ...c,
      tipo: c.tipo as TipoConsulta,
      profissionalNome: profissional.usuario.nome,
      especialidade: profissional.especialidade,
    }))
  }

  async criarConsulta(
    dados: CriarConsultaDados & { inicio: Date; fim: Date }
  ): Promise<ConsultaEntity> {
    const criada = await prisma.consulta.create({
      data: {
        profissionalId: dados.profissionalId,
        pacienteId: dados.pacienteId,
        data: dados.data,
        hora: dados.hora,
        tipo: dados.tipo,
        inicio: dados.inicio,
        fim: dados.fim,
      },
    })

    return {
      id: criada.id,
      profissionalId: criada.profissionalId,
      pacienteId: criada.pacienteId,
      data: criada.data,
      hora: criada.hora,
      tipo: criada.tipo as TipoConsulta,
      status: criada.status,
      inicio: criada.inicio,
      fim: criada.fim,
      confirmadaEm: criada.confirmadaEm,
      canceladaEm: criada.canceladaEm,
    }
  }

  async cancelarConsulta(id: string): Promise<ConsultaEntity> {
    const cancelada = await prisma.consulta.update({
      where: { id },
      data: { status: 'cancelada', canceladaEm: new Date() },
    })

    return {
      id: cancelada.id,
      profissionalId: cancelada.profissionalId,
      pacienteId: cancelada.pacienteId,
      data: cancelada.data,
      hora: cancelada.hora,
      tipo: cancelada.tipo as TipoConsulta,
      status: cancelada.status,
      inicio: cancelada.inicio,
      fim: cancelada.fim,
      confirmadaEm: cancelada.confirmadaEm,
      canceladaEm: cancelada.canceladaEm,
    }
  }

  async confirmarConsulta(id: string): Promise<ConsultaComProfissionalEntity> {
    const atualizada = await prisma.consulta.update({
      where: { id },
      data: { confirmadaEm: new Date() },
      include: { profissional: { include: { usuario: true } } },
    })

    return {
      id: atualizada.id,
      profissionalId: atualizada.profissionalId,
      pacienteId: atualizada.pacienteId,
      data: atualizada.data,
      hora: atualizada.hora,
      tipo: atualizada.tipo as TipoConsulta,
      status: atualizada.status,
      inicio: atualizada.inicio,
      fim: atualizada.fim,
      confirmadaEm: atualizada.confirmadaEm,
      canceladaEm: atualizada.canceladaEm,
      profissionalNome: atualizada.profissional.usuario.nome,
      especialidade: atualizada.profissional.especialidade,
    }
  }

  async remarcarConsulta(
    id: string,
    dados: { novaData: string; novaHora: string; novoInicio: Date; novoFim: Date }
  ): Promise<ConsultaEntity> {
    const atualizada = await prisma.consulta.update({
      where: { id },
      data: {
        data: dados.novaData,
        hora: dados.novaHora,
        inicio: dados.novoInicio,
        fim: dados.novoFim,
      },
    })

    return {
      id: atualizada.id,
      profissionalId: atualizada.profissionalId,
      pacienteId: atualizada.pacienteId,
      data: atualizada.data,
      hora: atualizada.hora,
      tipo: atualizada.tipo as TipoConsulta,
      status: atualizada.status,
      inicio: atualizada.inicio,
      fim: atualizada.fim,
      confirmadaEm: atualizada.confirmadaEm,
      canceladaEm: atualizada.canceladaEm,
    }
  }

  async registrarFalta(id: string): Promise<ConsultaEntity> {
    const atualizada = await prisma.consulta.update({
      where: { id },
      data: { status: 'faltou' },
    })

    return {
      id: atualizada.id,
      profissionalId: atualizada.profissionalId,
      pacienteId: atualizada.pacienteId,
      data: atualizada.data,
      hora: atualizada.hora,
      tipo: atualizada.tipo as TipoConsulta,
      status: atualizada.status,
      inicio: atualizada.inicio,
      fim: atualizada.fim,
      confirmadaEm: atualizada.confirmadaEm,
      canceladaEm: atualizada.canceladaEm,
    }
  }
}
