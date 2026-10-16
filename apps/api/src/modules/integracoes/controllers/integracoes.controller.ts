import { timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { dataValida } from '../../../agenda'
import { PrismaIntegracoesRepository } from '../repositories/integracoes.repository'
import { ListarLembretesUseCase } from '../usecases/listarLembretes.usecase'

const CHAVE = Buffer.from(process.env.CHAVE_INTEGRACAO ?? '')

export function autenticarIntegracao(req: Request, res: Response, next: NextFunction): void {
  const recebida = Buffer.from(String(req.headers['x-chave-integracao'] ?? ''))
  if (CHAVE.length > 0 && recebida.length === CHAVE.length && timingSafeEqual(recebida, CHAVE)) {
    next()
    return
  }
  res.status(401).json({ erro: 'Chave de integração inválida' })
}

export class IntegracoesController {
  private readonly listarLembretesUseCase: ListarLembretesUseCase

  constructor(repository = new PrismaIntegracoesRepository()) {
    this.listarLembretesUseCase = new ListarLembretesUseCase(repository)
  }

  listarLembretes = async (req: Request, res: Response): Promise<void> => {
    const data = req.query.data ? String(req.query.data) : undefined
    if (data && !dataValida(data)) {
      res.status(400).json({ erro: 'Informe a data no formato AAAA-MM-DD' })
      return
    }

    const lembretes = await this.listarLembretesUseCase.executar(data)
    res.json(lembretes)
  }
}

export const integracoesController = new IntegracoesController()
