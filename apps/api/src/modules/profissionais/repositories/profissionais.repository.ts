import type { TipoConsulta } from '@bemviver/shared'
import { prisma } from '../../../infra/database'
import type {
  ConsultaAgendaEntity,
  FiltroProfissionais,
  FolgaEntity,
  ProfissionalEntity,
} from '../entities/profissionais.entity'

export interface IProfissionaisRepository {
  listarEspecialidades(): Promise<string[]>
  listarProfissionais(filtro: FiltroProfissionais): Promise<ProfissionalEntity[]>
  buscarPorId(id: string): Promise<{ id: string; especialidade: string } | null>
  buscarFolga(profissionalId: string, data: string): Promise<FolgaEntity | null>
  buscarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<FolgaEntity[]>
  buscarConsultasDoDia(profissionalId: string, data: string): Promise<ConsultaAgendaEntity[]>
  buscarConsultasAgendadasDoDia(
    profissionalId: string,
    data: string
  ): Promise<{ hora: string; tipo: TipoConsulta; status: string }[]>
  criarFolga(profissionalId: string, data: string): Promise<FolgaEntity>
  criarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<void>
}

export class PrismaProfissionaisRepository implements IProfissionaisRepository {
  async listarEspecialidades(): Promise<string[]> {
    const lista = await prisma.profissional.findMany({
      select: { especialidade: true },
      distinct: ['especialidade'],
      orderBy: { especialidade: 'asc' },
    })
    return lista.map((p) => p.especialidade)
  }

  async listarProfissionais(filtro: FiltroProfissionais): Promise<ProfissionalEntity[]> {
    const where: { id?: string; especialidade?: { equals: string; mode?: 'insensitive' } } = {}
    if (filtro.profissionalId) {
      where.id = filtro.profissionalId
    }
    if (filtro.especialidade) {
      where.especialidade = { equals: filtro.especialidade, mode: 'insensitive' }
    }

    const profissionais = await prisma.profissional.findMany({
      where,
      include: {
        usuario: { select: { nome: true } },
        ...(filtro.data ? { folgas: { where: { data: filtro.data } } } : {}),
      },
      orderBy: { usuario: { nome: 'asc' } },
    })

    return profissionais.map((p) => {
      const item: ProfissionalEntity = {
        id: p.id,
        nome: p.usuario.nome,
        especialidade: p.especialidade,
      }
      if (filtro.data) {
        item.folga = Boolean(p.folgas && p.folgas.length > 0)
      }
      return item
    })
  }

  async buscarPorId(id: string): Promise<{ id: string; especialidade: string } | null> {
    return prisma.profissional.findUnique({
      where: { id },
      select: { id: true, especialidade: true },
    })
  }

  async buscarFolga(profissionalId: string, data: string): Promise<FolgaEntity | null> {
    const folga = await prisma.folga.findUnique({
      where: { profissionalId_data: { profissionalId, data } },
    })
    return folga ? { id: folga.id, profissionalId: folga.profissionalId, data: folga.data } : null
  }

  async buscarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<FolgaEntity[]> {
    const folgas = await prisma.folga.findMany({
      where: { profissionalId, data: { in: datas } },
    })
    return folgas.map((f) => ({
      id: f.id,
      profissionalId: f.profissionalId,
      data: f.data,
    }))
  }

  async buscarConsultasDoDia(profissionalId: string, data: string): Promise<ConsultaAgendaEntity[]> {
    const consultas = await prisma.consulta.findMany({
      where: { profissionalId, data },
      include: { paciente: { select: { nome: true } } },
      orderBy: { inicio: 'asc' },
    })

    return consultas.map(({ paciente, ...c }) => ({
      ...c,
      tipo: c.tipo as TipoConsulta,
      pacienteNome: paciente.nome,
    }))
  }

  async buscarConsultasAgendadasDoDia(
    profissionalId: string,
    data: string
  ): Promise<{ hora: string; tipo: TipoConsulta; status: string }[]> {
    const marcadas = await prisma.consulta.findMany({
      where: { profissionalId, data, status: 'agendada' },
      select: { hora: true, tipo: true, status: true },
    })
    return marcadas.map((m) => ({
      hora: m.hora,
      tipo: m.tipo as TipoConsulta,
      status: m.status,
    }))
  }

  async criarFolga(profissionalId: string, data: string): Promise<FolgaEntity> {
    const folga = await prisma.folga.create({
      data: { profissionalId, data },
    })
    return {
      id: folga.id,
      profissionalId: folga.profissionalId,
      data: folga.data,
    }
  }

  async criarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<void> {
    await prisma.folga.createMany({
      data: datas.map((dia) => ({ profissionalId, data: dia })),
    })
  }
}
