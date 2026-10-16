import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { profissionaisController } from './controllers/profissionais.controller'

export const rotasProfissionais = Router()

rotasProfissionais.get('/especialidades', profissionaisController.listarEspecialidades)
rotasProfissionais.get('/', profissionaisController.listarProfissionais)
rotasProfissionais.get('/:id/agenda', permitir('recepcao', 'profissional'), profissionaisController.obterAgenda)
rotasProfissionais.get('/:id/horarios', profissionaisController.listarHorarios)
rotasProfissionais.post('/:id/folgas', permitir('profissional'), profissionaisController.bloquearFolga)
rotasProfissionais.post(
  '/:id/folgas/periodo',
  permitir('profissional', 'recepcao'),
  profissionaisController.bloquearPeriodo
)
