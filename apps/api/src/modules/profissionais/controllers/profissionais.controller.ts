import type { Request, Response } from 'express'
import type { TipoConsulta } from '@bemviver/shared'
import { PrismaProfissionaisRepository } from '../repositories/profissionais.repository'
import { BloquearFolgaUseCase } from '../usecases/bloquearFolga.usecase'
import { BloquearPeriodoFolgaUseCase } from '../usecases/bloquearPeriodoFolga.usecase'
import { ListarEspecialidadesUseCase } from '../usecases/listarEspecialidades.usecase'
import { ListarHorariosDisponiveisUseCase } from '../usecases/listarHorariosDisponiveis.usecase'
import { ListarProfissionaisUseCase } from '../usecases/listarProfissionais.usecase'
import { ObterAgendaProfissionalUseCase } from '../usecases/obterAgendaProfissional.usecase'
import {
  agendaQuerySchema,
  bloquearFolgaSchema,
  bloquearPeriodoSchema,
  filtroProfissionaisSchema,
  horariosQuerySchema,
} from '../validations/profissionais.validation'

export class ProfissionaisController {
  private readonly listarEspecialidadesUseCase: ListarEspecialidadesUseCase
  private readonly listarProfissionaisUseCase: ListarProfissionaisUseCase
  private readonly obterAgendaProfissionalUseCase: ObterAgendaProfissionalUseCase
  private readonly listarHorariosDisponiveisUseCase: ListarHorariosDisponiveisUseCase
  private readonly bloquearFolgaUseCase: BloquearFolgaUseCase
  private readonly bloquearPeriodoFolgaUseCase: BloquearPeriodoFolgaUseCase

  constructor(repository = new PrismaProfissionaisRepository()) {
    this.listarEspecialidadesUseCase = new ListarEspecialidadesUseCase(repository)
    this.listarProfissionaisUseCase = new ListarProfissionaisUseCase(repository)
    this.obterAgendaProfissionalUseCase = new ObterAgendaProfissionalUseCase(repository)
    this.listarHorariosDisponiveisUseCase = new ListarHorariosDisponiveisUseCase(repository)
    this.bloquearFolgaUseCase = new BloquearFolgaUseCase(repository)
    this.bloquearPeriodoFolgaUseCase = new BloquearPeriodoFolgaUseCase(repository)
  }

  listarEspecialidades = async (_req: Request, res: Response): Promise<void> => {
    const especialidades = await this.listarEspecialidadesUseCase.executar()
    res.json(especialidades)
  }

  listarProfissionais = async (req: Request, res: Response): Promise<void> => {
    const validacao = filtroProfissionaisSchema.safeParse(req.query)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Parâmetros inválidos' })
      return
    }

    const { data, profissionalId, especialidade } = validacao.data
    const profissionais = await this.listarProfissionaisUseCase.executar({
      data,
      profissionalId,
      especialidade,
    })
    res.json(profissionais)
  }

  obterAgenda = async (req: Request, res: Response): Promise<void> => {
    const profissionalId = req.params.id
    const validacao = agendaQuerySchema.safeParse(req.query)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Informe a data no formato AAAA-MM-DD' })
      return
    }

    try {
      const agenda = await this.obterAgendaProfissionalUseCase.executar({
        profissionalId,
        data: validacao.data.data,
        usuarioPerfil: req.usuario.perfil,
        usuarioId: req.usuario.id,
      })
      res.json(agenda)
    } catch (erro) {
      if (erro instanceof Error && erro.message === 'Você só pode ver a sua própria agenda') {
        res.status(403).json({ erro: erro.message })
        return
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }

  listarHorarios = async (req: Request, res: Response): Promise<void> => {
    const profissionalId = req.params.id
    const validacao = horariosQuerySchema.safeParse(req.query)
    if (!validacao.success) {
      res.status(400).json({ erro: 'Informe a data (AAAA-MM-DD) e o tipo da consulta' })
      return
    }

    const horarios = await this.listarHorariosDisponiveisUseCase.executar({
      profissionalId,
      data: validacao.data.data,
      tipo: validacao.data.tipo as TipoConsulta,
    })
    res.json({ horarios })
  }

  bloquearFolga = async (req: Request, res: Response): Promise<void> => {
    const profissionalId = req.params.id
    const validacao = bloquearFolgaSchema.safeParse(req.body)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Informe a data no formato AAAA-MM-DD' })
      return
    }

    try {
      const folga = await this.bloquearFolgaUseCase.executar({
        profissionalId,
        data: validacao.data.data,
        usuarioId: req.usuario.id,
      })
      res.status(201).json(folga)
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Você só pode bloquear a sua própria agenda') {
          res.status(403).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Não é possível bloquear um dia que já passou' ||
          erro.message === 'Informe a data no formato AAAA-MM-DD'
        ) {
          res.status(400).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Profissional não encontrado') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Esse dia já está bloqueado') {
          res.status(409).json({ erro: erro.message })
          return
        }
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }

  bloquearPeriodo = async (req: Request, res: Response): Promise<void> => {
    const profissionalId = req.params.id
    const validacao = bloquearPeriodoSchema.safeParse(req.body)
    if (!validacao.success) {
      res.status(400).json({
        erro: validacao.error.issues[0]?.message ?? 'Informe as datas de início e fim no formato AAAA-MM-DD',
      })
      return
    }

    try {
      const resultado = await this.bloquearPeriodoFolgaUseCase.executar({
        profissionalId,
        dataInicio: validacao.data.dataInicio,
        dataFim: validacao.data.dataFim,
        usuarioPerfil: req.usuario.perfil,
        usuarioId: req.usuario.id,
      })
      res.status(201).json(resultado)
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Você só pode bloquear a sua própria agenda') {
          res.status(403).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Não é possível bloquear um período que já passou' ||
          erro.message === 'A data de início não pode ser posterior à data de término' ||
          erro.message === 'O período máximo de bloqueio é de 90 dias'
        ) {
          res.status(400).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Profissional não encontrado') {
          res.status(404).json({ erro: erro.message })
          return
        }
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }
}

export const profissionaisController = new ProfissionaisController()
