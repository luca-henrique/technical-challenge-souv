import type { Request, Response } from 'express'
import { PrismaConsultasRepository } from '../repositories/consultas.repository'
import { CancelarConsultaUseCase } from '../usecases/cancelarConsulta.usecase'
import { ConfirmarConsultaUseCase } from '../usecases/confirmarConsulta.usecase'
import { CriarConsultaUseCase } from '../usecases/criarConsulta.usecase'
import { ListarMinhasConsultasUseCase } from '../usecases/listarMinhasConsultas.usecase'
import { RegistrarFaltaConsultaUseCase } from '../usecases/registrarFaltaConsulta.usecase'
import { RemarcarConsultaUseCase } from '../usecases/remarcarConsulta.usecase'
import { criarConsultaSchema, remarcarSchema } from '../validations/consultas.validation'

export class ConsultasController {
  private readonly repository: PrismaConsultasRepository
  private readonly criarUseCase: CriarConsultaUseCase
  private readonly listarMinhasUseCase: ListarMinhasConsultasUseCase
  private readonly cancelarUseCase: CancelarConsultaUseCase
  private readonly confirmarUseCase: ConfirmarConsultaUseCase
  private readonly remarcarUseCase: RemarcarConsultaUseCase
  private readonly registrarFaltaUseCase: RegistrarFaltaConsultaUseCase

  constructor(repository = new PrismaConsultasRepository()) {
    this.repository = repository
    this.criarUseCase = new CriarConsultaUseCase(repository)
    this.listarMinhasUseCase = new ListarMinhasConsultasUseCase(repository)
    this.cancelarUseCase = new CancelarConsultaUseCase(repository)
    this.confirmarUseCase = new ConfirmarConsultaUseCase(repository)
    this.remarcarUseCase = new RemarcarConsultaUseCase(repository)
    this.registrarFaltaUseCase = new RegistrarFaltaConsultaUseCase(repository)
  }

  cancelarConsultasExpiradasNaoConfirmadas = async (pacienteId?: string): Promise<void> => {
    return this.repository.cancelarConsultasExpiradasNaoConfirmadas(pacienteId)
  }

  listarMinhas = async (req: Request, res: Response): Promise<void> => {
    const historico = req.query.historico === 'true'
    const consultas = await this.listarMinhasUseCase.executar(req.usuario.id, historico)
    res.json(consultas)
  }

  criar = async (req: Request, res: Response): Promise<void> => {
    const pacienteId =
      req.usuario.perfil === 'paciente' ? req.usuario.id : req.body?.pacienteId

    const validacao = criarConsultaSchema.safeParse({
      profissionalId: req.body?.profissionalId,
      pacienteId,
      data: req.body?.data,
      hora: req.body?.hora,
      tipo: req.body?.tipo,
    })

    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0].message })
      return
    }

    try {
      const consulta = await this.criarUseCase.executar({
        profissionalId: validacao.data.profissionalId,
        pacienteId: validacao.data.pacienteId,
        data: validacao.data.data,
        hora: validacao.data.hora,
        tipo: validacao.data.tipo,
      })

      res.status(201).json(consulta)
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Paciente ou profissional não encontrado') {
          res.status(400).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Esse horário já está ocupado' ||
          erro.message === 'O profissional está de folga nesse dia'
        ) {
          res.status(409).json({ erro: erro.message })
          return
        }
      }
      throw erro
    }
  }

  cancelar = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id)
    try {
      const resultado = await this.cancelarUseCase.executar(
        id,
        req.usuario.perfil,
        req.usuario.id
      )
      res.json({
        ...resultado.consulta,
        pacienteNotificadoListaEspera: resultado.pacienteNotificadoListaEspera,
      })
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Consulta não encontrada') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Só é possível cancelar uma consulta agendada') {
          res.status(409).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Você só pode cancelar suas próprias consultas') {
          res.status(403).json({ erro: erro.message })
          return
        }
      }
      throw erro
    }
  }

  confirmar = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id)
    try {
      const consulta = await this.confirmarUseCase.executar(
        id,
        req.usuario.perfil,
        req.usuario.id
      )
      res.json(consulta)
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Consulta não encontrada') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Só é possível confirmar uma consulta agendada') {
          res.status(409).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Você só pode confirmar suas próprias consultas') {
          res.status(403).json({ erro: erro.message })
          return
        }
      }
      throw erro
    }
  }

  remarcar = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id)
    const validacao = remarcarSchema.safeParse(req.body)
    if (!validacao.success) {
      res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Dados inválidos' })
      return
    }

    try {
      const resultado = await this.remarcarUseCase.executar(
        id,
        validacao.data,
        req.usuario.perfil,
        req.usuario.id
      )
      res.json({
        ...resultado.consulta,
        pacienteNotificadoListaEspera: resultado.pacienteNotificadoListaEspera,
      })
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Consulta não encontrada') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Só é possível remarcar uma consulta com status agendada' ||
          erro.message === 'Esse horário já está ocupado' ||
          erro.message === 'O profissional está de folga nesse dia' ||
          erro.message === 'Você já possui outra consulta agendada nesse horário'
        ) {
          res.status(409).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Você só pode remarcar suas próprias consultas') {
          res.status(403).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Não é permitido remarcar para uma data no passado' ||
          erro.message === 'A clínica só atende em dias úteis (segunda a sexta)' ||
          erro.message === 'Horário fora do expediente ou ultrapassa o limite de atendimento' ||
          erro.message === 'Não é permitido remarcar para um horário que já passou'
        ) {
          res.status(400).json({ erro: erro.message })
          return
        }
      }
      throw erro
    }
  }

  registrarFalta = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id)
    try {
      const atualizada = await this.registrarFaltaUseCase.executar(id)
      res.json(atualizada)
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Consulta não encontrada') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Só é possível registrar falta em uma consulta agendada' ||
          erro.message === 'A falta só pode ser registrada depois do horário da consulta'
        ) {
          res.status(409).json({ erro: erro.message })
          return
        }
      }
      throw erro
    }
  }
}

export const consultasController = new ConsultasController()

export async function cancelarConsultasExpiradasNaoConfirmadas(pacienteId?: string) {
  return consultasController.cancelarConsultasExpiradasNaoConfirmadas(pacienteId)
}

export async function listarMinhasConsultas(req: Request, res: Response) {
  return consultasController.listarMinhas(req, res)
}

export async function criarConsulta(req: Request, res: Response) {
  return consultasController.criar(req, res)
}

export async function cancelarConsulta(req: Request, res: Response) {
  return consultasController.cancelar(req, res)
}

export async function registrarFaltaConsulta(req: Request, res: Response) {
  return consultasController.registrarFalta(req, res)
}

export async function remarcarConsulta(req: Request, res: Response) {
  return consultasController.remarcar(req, res)
}

export async function confirmarConsulta(req: Request, res: Response) {
  return consultasController.confirmar(req, res)
}
