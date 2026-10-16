import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { relatoriosController } from './controllers/relatorios.controller'

export const rotasRelatorios = Router()

rotasRelatorios.get('/faltas', permitir('recepcao'), relatoriosController.gerarRelatorioFaltas)
rotasRelatorios.post('/pdf', permitir('recepcao', 'profissional'), relatoriosController.solicitarGeracaoPdf)
rotasRelatorios.get('/pdf/status/:jobId', permitir('recepcao', 'profissional'), relatoriosController.consultarStatusPdf)
rotasRelatorios.get('/pdf/download/:jobId', permitir('recepcao', 'profissional'), relatoriosController.baixarPdf)
