import { Router } from 'express'
import { permitir } from '../auth'
import {
  cancelarConsulta,
  criarConsulta,
  listarMinhasConsultas,
  registrarFaltaConsulta,
  remarcarConsulta,
} from '../controllers/consultasController'

export const rotasConsultas = Router()

rotasConsultas.get('/minhas', permitir('paciente'), listarMinhasConsultas)
rotasConsultas.post('/', permitir('paciente', 'recepcao'), criarConsulta)
rotasConsultas.post('/:id/cancelar', permitir('paciente', 'recepcao'), cancelarConsulta)
rotasConsultas.patch('/:id/remarcar', permitir('paciente', 'recepcao'), remarcarConsulta)
rotasConsultas.post('/:id/remarcar', permitir('paciente', 'recepcao'), remarcarConsulta)
rotasConsultas.post('/:id/falta', permitir('recepcao'), registrarFaltaConsulta)
