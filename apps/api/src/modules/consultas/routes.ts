import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { consultasController } from './controllers/consultas.controller'

export const rotasConsultas = Router()

rotasConsultas.get('/minhas', permitir('paciente'), consultasController.listarMinhas)
rotasConsultas.post('/', permitir('paciente', 'recepcao'), consultasController.criar)
rotasConsultas.post('/:id/cancelar', permitir('paciente', 'recepcao'), consultasController.cancelar)
rotasConsultas.post('/:id/confirmar', permitir('paciente', 'recepcao'), consultasController.confirmar)
rotasConsultas.patch('/:id/remarcar', permitir('paciente', 'recepcao'), consultasController.remarcar)
rotasConsultas.post('/:id/remarcar', permitir('paciente', 'recepcao'), consultasController.remarcar)
rotasConsultas.post('/:id/falta', permitir('recepcao'), consultasController.registrarFalta)
