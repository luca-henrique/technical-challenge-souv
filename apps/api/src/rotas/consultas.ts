import { Router } from 'express'
import { permitir } from '../auth'
import {
  cancelarConsulta,
  criarConsulta,
  listarMinhasConsultas,
  registrarFaltaConsulta,
} from '../controllers/consultasController'

export const rotasConsultas = Router()

rotasConsultas.get('/minhas', permitir('paciente'), listarMinhasConsultas)
rotasConsultas.post('/', permitir('paciente', 'recepcao'), criarConsulta)
rotasConsultas.post('/:id/cancelar', permitir('paciente', 'recepcao'), cancelarConsulta)
rotasConsultas.post('/:id/falta', permitir('recepcao'), registrarFaltaConsulta)
