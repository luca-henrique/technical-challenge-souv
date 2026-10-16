import type { Request, Response } from 'express'
import type { TipoConsulta } from '@bemviver/shared'
import type { TurnoListaEspera } from '../entities/listaEspera.entity'
import { PrismaListaEsperaRepository } from '../repositories/listaEspera.repository'
import { InscreverListaEsperaUseCase } from '../usecases/inscreverListaEspera.usecase'
import { ListarListaEsperaUseCase } from '../usecases/listarListaEspera.usecase'
import { ListarMinhasEsperaUseCase } from '../usecases/listarMinhasEspera.usecase'
import { NotificarProximoListaEsperaUseCase } from '../usecases/notificarProximoListaEspera.usecase'
import { RemoverListaEsperaUseCase } from '../usecases/removerListaEspera.usecase'
import { inscreverSchema } from '../validations/listaEspera.validation'

export class ListaEsperaController {
  private readonly inscreverUseCase: InscreverListaEsperaUseCase
  private readonly listarUseCase: ListarListaEsperaUseCase
  private readonly listarMinhasUseCase: ListarMinhasEsperaUseCase
  private readonly removerUseCase: RemoverListaEsperaUseCase
  private readonly notificarProximoUseCase: NotificarProximoListaEsperaUseCase

  constructor(repository = new PrismaListaEsperaRepository()) {
    this.inscreverUseCase = new InscreverListaEsperaUseCase(repository)
    this.listarUseCase = new ListarListaEsperaUseCase(repository)
    this.listarMinhasUseCase = new ListarMinhasEsperaUseCase(repository)
    this.removerUseCase = new RemoverListaEsperaUseCase(repository)
    this.notificarProximoUseCase = new NotificarProximoListaEsperaUseCase(repository)
  }

  inscrever = async (req: Request, res: Response): Promise<void> => {
    const parse = inscreverSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ erro: parse.error.issues[0]?.message ?? 'Dados inválidos' })
      return
    }

    const { profissionalId, data, tipo, turno } = parse.data
    const pacienteId =
      req.usuario.perfil === 'recepcao' && parse.data.pacienteId
        ? parse.data.pacienteId
        : req.usuario.id

    try {
      const item = await this.inscreverUseCase.executar({
        profissionalId,
        pacienteId,
        data,
        tipo: tipo as TipoConsulta,
        turno: turno as TurnoListaEspera,
      })

      res.status(201).json({
        id: item.id,
        profissionalId: item.profissionalId,
        pacienteId: item.pacienteId,
        data: item.data,
        tipo: item.tipo,
        turno: item.turno,
        status: item.status,
        criadaEm: item.criadaEm.toISOString(),
      })
    } catch (erro) {
      if (erro instanceof Error) {
        if (
          erro.message === 'Não é permitido entrar na lista de espera para datas no passado' ||
          erro.message === 'A clínica só atende em dias úteis (segunda a sexta)'
        ) {
          res.status(400).json({ erro: erro.message })
          return
        }
        if (erro.message === 'Profissional não encontrado') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'O profissional está de folga nesta data' ||
          erro.message === 'Você já está na lista de espera deste profissional para esta data'
        ) {
          res.status(409).json({ erro: erro.message })
          return
        }
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }

  listar = async (req: Request, res: Response): Promise<void> => {
    const { profissionalId, data, status } = req.query
    const itens = await this.listarUseCase.executar({
      profissionalId: typeof profissionalId === 'string' ? profissionalId : undefined,
      data: typeof data === 'string' ? data : undefined,
      status: typeof status === 'string' ? status : undefined,
    })

    res.json(
      itens.map((item) => ({
        id: item.id,
        profissionalId: item.profissionalId,
        pacienteId: item.pacienteId,
        data: item.data,
        tipo: item.tipo,
        turno: item.turno,
        status: item.status,
        criadaEm: item.criadaEm.toISOString(),
        notificadoEm: item.notificadoEm?.toISOString() ?? null,
        profissionalNome: item.profissionalNome,
        especialidade: item.especialidade,
        pacienteNome: item.pacienteNome,
        pacienteEmail: item.pacienteEmail,
      }))
    )
  }

  listarMinhas = async (req: Request, res: Response): Promise<void> => {
    const itens = await this.listarMinhasUseCase.executar(req.usuario.id)
    res.json(
      itens.map((item) => ({
        id: item.id,
        profissionalId: item.profissionalId,
        pacienteId: item.pacienteId,
        data: item.data,
        tipo: item.tipo,
        turno: item.turno,
        status: item.status,
        criadaEm: item.criadaEm.toISOString(),
        notificadoEm: item.notificadoEm?.toISOString() ?? null,
        profissionalNome: item.profissionalNome,
        especialidade: item.especialidade,
      }))
    )
  }

  remover = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id)
    try {
      const atualizado = await this.removerUseCase.executar({
        id,
        usuarioPerfil: req.usuario.perfil,
        usuarioId: req.usuario.id,
      })
      res.json({ sucesso: true, id: atualizado.id, status: atualizado.status })
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === 'Registro de lista de espera não encontrado') {
          res.status(404).json({ erro: erro.message })
          return
        }
        if (
          erro.message === 'Você só pode cancelar suas próprias inscrições na lista de espera'
        ) {
          res.status(403).json({ erro: erro.message })
          return
        }
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }

  notificarProximo = async (
    profissionalId: string,
    data: string,
    horaConsulta: string
  ) => {
    return this.notificarProximoUseCase.executar(profissionalId, data, horaConsulta)
  }
}

export const listaEsperaController = new ListaEsperaController()

export async function notificarProximoListaEspera(
  profissionalId: string,
  data: string,
  horaConsulta: string
) {
  return listaEsperaController.notificarProximo(profissionalId, data, horaConsulta)
}
