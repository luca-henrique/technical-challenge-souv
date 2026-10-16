import type { Request, Response } from 'express'
import { dataValida } from '../../../agenda'
import { PrismaRelatoriosRepository } from '../repositories/relatorios.repository'
import { GerarRelatorioFaltasUseCase } from '../usecases/gerarRelatorioFaltas.usecase'

export class RelatoriosController {
  private readonly gerarRelatorioFaltasUseCase: GerarRelatorioFaltasUseCase

  constructor(repository = new PrismaRelatoriosRepository()) {
    this.gerarRelatorioFaltasUseCase = new GerarRelatorioFaltasUseCase(repository)
  }

  gerarRelatorioFaltas = async (req: Request, res: Response): Promise<void> => {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined
    const profissionalId = req.query.profissionalId ? String(req.query.profissionalId) : undefined

    if (dataInicio && !dataValida(dataInicio)) {
      res.status(400).json({ erro: 'Data de início inválida. Use o formato AAAA-MM-DD' })
      return
    }
    if (dataFim && !dataValida(dataFim)) {
      res.status(400).json({ erro: 'Data de término inválida. Use o formato AAAA-MM-DD' })
      return
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
      res.status(400).json({ erro: 'A data de início não pode ser posterior à data de término' })
      return
    }

    const relatorio = await this.gerarRelatorioFaltasUseCase.executar({
      dataInicio,
      dataFim,
      profissionalId,
    })
    res.json(relatorio)
  }
}

export const relatoriosController = new RelatoriosController()
export const gerarRelatorioFaltas = relatoriosController.gerarRelatorioFaltas
