import fs from 'node:fs'
import type { Request, Response } from 'express'
import { cacheService } from '../../../infra/cache/cacheService'
import { pdfQueue } from '../../../infra/jobs/pdfQueue'
import { PrismaRelatoriosRepository } from '../repositories/relatorios.repository'
import { GerarRelatorioFaltasUseCase } from '../usecases/gerarRelatorioFaltas.usecase'
import {
  gerarPdfBodySchema,
  relatorioFaltasQuerySchema,
} from '../validations/relatorios.validation'

export class RelatoriosController {
  private readonly gerarRelatorioFaltasUseCase: GerarRelatorioFaltasUseCase

  constructor(repository = new PrismaRelatoriosRepository()) {
    this.gerarRelatorioFaltasUseCase = new GerarRelatorioFaltasUseCase(repository)
  }

  gerarRelatorioFaltas = async (req: Request, res: Response): Promise<void> => {
    const validacao = relatorioFaltasQuerySchema.safeParse(req.query)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Parâmetros inválidos' })
      return
    }

    const { dataInicio, dataFim, profissionalId, pagina, limite } = validacao.data

    const chaveCache = `cache:relatorios:faltas:${dataInicio ?? ''}:${dataFim ?? ''}:${profissionalId ?? ''}:${pagina}:${limite}`
    const cacheado = await cacheService.obter(chaveCache)
    if (cacheado) {
      res.setHeader('X-Cache', 'HIT')
      res.json(cacheado)
      return
    }

    const relatorio = await this.gerarRelatorioFaltasUseCase.executar({
      dataInicio,
      dataFim,
      profissionalId,
      pagina,
      limite,
    })

    await cacheService.salvar(chaveCache, relatorio, 60)
    res.setHeader('X-Cache', 'MISS')
    res.json(relatorio)
  }

  solicitarGeracaoPdf = async (req: Request, res: Response): Promise<void> => {
    const validacao = gerarPdfBodySchema.safeParse(req.body)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0].message })
      return
    }

    const job = await pdfQueue.add('gerar-pdf', {
      tipo: validacao.data.tipo,
      filtros: validacao.data.filtros,
      solicitanteId: req.usuario.id,
      solicitanteNome: req.usuario.nome,
    })

    res.status(202).json({
      jobId: job.id,
      status: 'pendente',
      mensagem: 'Geração de PDF enfileirada no worker com sucesso',
    })
  }

  consultarStatusPdf = async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.params.jobId)
    const job = await pdfQueue.getJob(jobId)

    if (!job) {
      res.status(404).json({ erro: 'Job de geração de PDF não encontrado' })
      return
    }

    const state = await job.getState()
    const progress = job.progress

    if (state === 'completed') {
      res.json({
        id: job.id,
        status: 'concluido',
        progresso: 100,
        resultado: job.returnvalue,
      })
      return
    }

    if (state === 'failed') {
      res.json({
        id: job.id,
        status: 'falha',
        erro: job.failedReason || 'Erro ao compilar documento PDF',
      })
      return
    }

    res.json({
      id: job.id,
      status: state === 'active' ? 'processando' : 'esperando',
      progresso: progress,
    })
  }

  baixarPdf = async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.params.jobId)
    const job = await pdfQueue.getJob(jobId)

    if (!job) {
      res.status(404).json({ erro: 'Job não encontrado' })
      return
    }

    const state = await job.getState()
    if (state !== 'completed' || !job.returnvalue) {
      res.status(400).json({ erro: `O documento ainda não está pronto. Status atual: ${state}` })
      return
    }

    const caminhoArquivo = job.returnvalue.caminho
    if (!fs.existsSync(caminhoArquivo)) {
      res.status(404).json({ erro: 'Arquivo PDF não encontrado no servidor' })
      return
    }

    res.download(caminhoArquivo, job.returnvalue.arquivoNome)
  }
}

export const relatoriosController = new RelatoriosController()
export const gerarRelatorioFaltas = relatoriosController.gerarRelatorioFaltas
export const solicitarGeracaoPdf = relatoriosController.solicitarGeracaoPdf
export const consultarStatusPdf = relatoriosController.consultarStatusPdf
export const baixarPdf = relatoriosController.baixarPdf
