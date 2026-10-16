import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { relatoriosController } from './controllers/relatorios.controller'

export const rotasRelatorios = Router()

rotasRelatorios.get('/faltas', permitir('recepcao'), relatoriosController.gerarRelatorioFaltas)
