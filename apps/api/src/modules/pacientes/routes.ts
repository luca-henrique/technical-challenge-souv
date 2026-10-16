import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { pacientesController } from './controllers/pacientes.controller'

export const rotasPacientes = Router()

rotasPacientes.get('/', permitir('recepcao'), pacientesController.listar)
rotasPacientes.get('/:id/consultas', permitir('recepcao', 'profissional'), pacientesController.listarConsultas)
