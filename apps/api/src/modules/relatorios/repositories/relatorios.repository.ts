import { prisma } from '../../../infra/database'
import type { ConsultaRelatorioEntity, FiltroRelatorioFaltas } from '../entities/relatorios.entity'

export interface IRelatoriosRepository {
  buscarConsultasRelatorio(filtro: FiltroRelatorioFaltas): Promise<ConsultaRelatorioEntity[]>
}

export class PrismaRelatoriosRepository implements IRelatoriosRepository {
  async buscarConsultasRelatorio(filtro: FiltroRelatorioFaltas): Promise<ConsultaRelatorioEntity[]> {
    const where: {
      data?: { gte?: string; lte?: string }
      profissionalId?: string
    } = {}

    if (filtro.dataInicio || filtro.dataFim) {
      where.data = {
        ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
        ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
      }
    }

    if (filtro.profissionalId) {
      where.profissionalId = filtro.profissionalId
    }

    return prisma.consulta.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true, email: true } },
        profissional: {
          include: {
            usuario: { select: { nome: true } },
          },
        },
      },
      orderBy: { inicio: 'asc' },
    })
  }
}
