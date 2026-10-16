import type { Request, Response } from 'express'
import { PrismaPacientesRepository } from '../repositories/pacientes.repository'
import { ListarConsultasPacienteUseCase } from '../usecases/listarConsultasPaciente.usecase'
import { ListarPacientesUseCase } from '../usecases/listarPacientes.usecase'
import { pacienteIdParamSchema } from '../validations/pacientes.validation'

export class PacientesController {
  private readonly listarPacientesUseCase: ListarPacientesUseCase
  private readonly listarConsultasPacienteUseCase: ListarConsultasPacienteUseCase

  constructor(repository = new PrismaPacientesRepository()) {
    this.listarPacientesUseCase = new ListarPacientesUseCase(repository)
    this.listarConsultasPacienteUseCase = new ListarConsultasPacienteUseCase(repository)
  }

  listar = async (_req: Request, res: Response): Promise<void> => {
    const pacientes = await this.listarPacientesUseCase.executar()
    res.json(pacientes)
  }

  listarConsultas = async (req: Request, res: Response): Promise<void> => {
    const validacao = pacienteIdParamSchema.safeParse(req.params)
    if (!validacao.success) {
      res.status(400).json({ erro: 'ID do paciente inválido' })
      return
    }

    const consultas = await this.listarConsultasPacienteUseCase.executar(validacao.data.id)
    res.json(consultas)
  }
}

export const pacientesController = new PacientesController()
