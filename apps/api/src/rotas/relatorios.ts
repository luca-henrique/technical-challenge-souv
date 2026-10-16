import { Router } from 'express'
import { permitir } from '../auth'
import { relatoriosController } from '../controllers/relatoriosController'

export const rotasRelatorios = Router()

rotasRelatorios.get('/faltas', permitir('recepcao'), relatoriosController.gerarRelatorioFaltas)
