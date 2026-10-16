import type {
  FiltroRelatorioFaltas,
  RelatorioFaltas,
} from '../entities/relatorios.entity'
import type { IRelatoriosRepository } from '../repositories/relatorios.repository'

export class GerarRelatorioFaltasUseCase {
  constructor(private readonly relatoriosRepository: IRelatoriosRepository) {}

  async executar(filtro: FiltroRelatorioFaltas): Promise<RelatorioFaltas> {
    const consultas = await this.relatoriosRepository.buscarConsultasRelatorio(filtro)

    const totalAgendadas = consultas.length
    let totalRealizadas = 0
    let totalCanceladas = 0
    let totalFaltas = 0

    const mapaPacientesFaltas = new Map<
      string,
      { pacienteId: string; nome: string; email: string; totalFaltas: number }
    >()

    const mapaProfissionais = new Map<
      string,
      {
        profissionalId: string
        nome: string
        especialidade: string
        totalConsultas: number
        faltas: number
      }
    >()

    for (const c of consultas) {
      if (c.status === 'realizada') totalRealizadas++
      else if (c.status === 'cancelada') totalCanceladas++
      else if (c.status === 'faltou') {
        totalFaltas++

        const existente = mapaPacientesFaltas.get(c.pacienteId)
        if (existente) {
          existente.totalFaltas++
        } else {
          mapaPacientesFaltas.set(c.pacienteId, {
            pacienteId: c.paciente.id,
            nome: c.paciente.nome,
            email: c.paciente.email,
            totalFaltas: 1,
          })
        }
      }

      const profExistente = mapaProfissionais.get(c.profissionalId)
      if (profExistente) {
        profExistente.totalConsultas++
        if (c.status === 'faltou') profExistente.faltas++
      } else {
        mapaProfissionais.set(c.profissionalId, {
          profissionalId: c.profissional.id,
          nome: c.profissional.usuario.nome,
          especialidade: c.profissional.especialidade,
          totalConsultas: 1,
          faltas: c.status === 'faltou' ? 1 : 0,
        })
      }
    }

    const taxaFaltas =
      totalAgendadas > 0 ? Number(((totalFaltas / totalAgendadas) * 100).toFixed(1)) : 0

    const reincidentes = Array.from(mapaPacientesFaltas.values()).sort(
      (a, b) => b.totalFaltas - a.totalFaltas
    )

    const totalItens = reincidentes.length
    const pagina = filtro.pagina ?? 1
    const limite = filtro.limite ?? 10
    const totalPaginas = Math.max(1, Math.ceil(totalItens / limite))

    const reincidentesPaginados =
      filtro.pagina !== undefined
        ? reincidentes.slice((pagina - 1) * limite, pagina * limite)
        : reincidentes

    const faltasPorProfissional = Array.from(mapaProfissionais.values()).map((p) => ({
      ...p,
      taxaFaltas: p.totalConsultas > 0 ? Number(((p.faltas / p.totalConsultas) * 100).toFixed(1)) : 0,
    }))

    return {
      periodo: {
        dataInicio: filtro.dataInicio,
        dataFim: filtro.dataFim,
      },
      totais: {
        agendadas: totalAgendadas,
        realizadas: totalRealizadas,
        canceladas: totalCanceladas,
        faltas: totalFaltas,
      },
      taxaFaltas,
      reincidentes: reincidentesPaginados,
      faltasPorProfissional,
      paginacao: {
        pagina,
        limite,
        totalItens,
        totalPaginas,
      },
    }
  }
}
