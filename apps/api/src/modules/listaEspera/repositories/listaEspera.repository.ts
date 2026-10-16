import type { TipoConsulta } from '@bemviver/shared'
import { prisma } from '../../../infra/database'
import type {
  FiltroListaEspera,
  ItemListaEsperaDetalhadoEntity,
  ItemListaEsperaEntity,
  PacienteNotificadoListaEspera,
  TurnoListaEspera,
} from '../entities/listaEspera.entity'

export interface IListaEsperaRepository {
  buscarProfissional(id: string): Promise<boolean>
  buscarFolga(profissionalId: string, data: string): Promise<boolean>
  buscarRegistro(
    profissionalId: string,
    pacienteId: string,
    data: string
  ): Promise<ItemListaEsperaEntity | null>
  criar(dados: {
    profissionalId: string
    pacienteId: string
    data: string
    tipo: TipoConsulta
    turno: TurnoListaEspera
  }): Promise<ItemListaEsperaEntity>
  atualizarParaAguardando(
    id: string,
    tipo: TipoConsulta,
    turno: TurnoListaEspera
  ): Promise<ItemListaEsperaEntity>
  listar(filtro: FiltroListaEspera): Promise<ItemListaEsperaDetalhadoEntity[]>
  listarPorPaciente(pacienteId: string): Promise<ItemListaEsperaDetalhadoEntity[]>
  buscarPorId(id: string): Promise<ItemListaEsperaEntity | null>
  cancelar(id: string): Promise<ItemListaEsperaEntity>
  notificarProximo(
    profissionalId: string,
    data: string,
    turno: 'manha' | 'tarde'
  ): Promise<PacienteNotificadoListaEspera | null>
}

export class PrismaListaEsperaRepository implements IListaEsperaRepository {
  async buscarProfissional(id: string): Promise<boolean> {
    const p = await prisma.profissional.findUnique({ where: { id } })
    return Boolean(p)
  }

  async buscarFolga(profissionalId: string, data: string): Promise<boolean> {
    const f = await prisma.folga.findUnique({
      where: { profissionalId_data: { profissionalId, data } },
    })
    return Boolean(f)
  }

  async buscarRegistro(
    profissionalId: string,
    pacienteId: string,
    data: string
  ): Promise<ItemListaEsperaEntity | null> {
    const item = await prisma.listaEspera.findUnique({
      where: { profissionalId_pacienteId_data: { profissionalId, pacienteId, data } },
    })
    if (!item) return null
    return {
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
    }
  }

  async criar(dados: {
    profissionalId: string
    pacienteId: string
    data: string
    tipo: TipoConsulta
    turno: TurnoListaEspera
  }): Promise<ItemListaEsperaEntity> {
    const item = await prisma.listaEspera.create({
      data: {
        profissionalId: dados.profissionalId,
        pacienteId: dados.pacienteId,
        data: dados.data,
        tipo: dados.tipo,
        turno: dados.turno,
        status: 'aguardando',
      },
    })
    return {
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
    }
  }

  async atualizarParaAguardando(
    id: string,
    tipo: TipoConsulta,
    turno: TurnoListaEspera
  ): Promise<ItemListaEsperaEntity> {
    const item = await prisma.listaEspera.update({
      where: { id },
      data: {
        tipo,
        turno,
        status: 'aguardando',
        criadaEm: new Date(),
        notificadoEm: null,
      },
    })
    return {
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
    }
  }

  async listar(filtro: FiltroListaEspera): Promise<ItemListaEsperaDetalhadoEntity[]> {
    const where: Record<string, unknown> = {}
    if (typeof filtro.profissionalId === 'string' && filtro.profissionalId) {
      where.profissionalId = filtro.profissionalId
    }
    if (typeof filtro.data === 'string' && filtro.data) {
      where.data = filtro.data
    }
    if (typeof filtro.status === 'string' && filtro.status) {
      where.status = filtro.status
    }

    const itens = await prisma.listaEspera.findMany({
      where,
      include: {
        profissional: { include: { usuario: true } },
        paciente: true,
      },
      orderBy: { criadaEm: 'asc' },
    })

    return itens.map((item) => ({
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
      profissionalNome: item.profissional.usuario.nome,
      especialidade: item.profissional.especialidade,
      pacienteNome: item.paciente.nome,
      pacienteEmail: item.paciente.email,
    }))
  }

  async listarPorPaciente(pacienteId: string): Promise<ItemListaEsperaDetalhadoEntity[]> {
    const itens = await prisma.listaEspera.findMany({
      where: { pacienteId },
      include: { profissional: { include: { usuario: true } } },
      orderBy: { criadaEm: 'desc' },
    })

    return itens.map((item) => ({
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
      profissionalNome: item.profissional.usuario.nome,
      especialidade: item.profissional.especialidade,
    }))
  }

  async buscarPorId(id: string): Promise<ItemListaEsperaEntity | null> {
    const item = await prisma.listaEspera.findUnique({ where: { id } })
    if (!item) return null
    return {
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
    }
  }

  async cancelar(id: string): Promise<ItemListaEsperaEntity> {
    const item = await prisma.listaEspera.update({
      where: { id },
      data: { status: 'cancelado' },
    })
    return {
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo as TipoConsulta,
      turno: item.turno as TurnoListaEspera,
      status: item.status,
      criadaEm: item.criadaEm,
      notificadoEm: item.notificadoEm,
    }
  }

  async notificarProximo(
    profissionalId: string,
    data: string,
    turno: 'manha' | 'tarde'
  ): Promise<PacienteNotificadoListaEspera | null> {
    const proximo = await prisma.listaEspera.findFirst({
      where: {
        profissionalId,
        data,
        status: 'aguardando',
        turno: { in: [turno, 'qualquer'] },
      },
      include: {
        paciente: true,
        profissional: { include: { usuario: true } },
      },
      orderBy: { criadaEm: 'asc' },
    })

    if (!proximo) return null

    const atualizado = await prisma.listaEspera.update({
      where: { id: proximo.id },
      data: {
        status: 'notificado',
        notificadoEm: new Date(),
      },
    })

    return {
      id: atualizado.id,
      pacienteId: proximo.pacienteId,
      pacienteNome: proximo.paciente.nome,
      pacienteEmail: proximo.paciente.email,
      profissionalNome: proximo.profissional.usuario.nome,
      data: atualizado.data,
      turno: atualizado.turno,
      notificadoEm: atualizado.notificadoEm?.toISOString() ?? null,
    }
  }
}
