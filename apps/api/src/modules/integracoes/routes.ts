import { Router } from 'express'
import {
  autenticarIntegracao,
  integracoesController,
} from './controllers/integracoes.controller'

export const rotasIntegracoes = Router()

rotasIntegracoes.use(autenticarIntegracao)
rotasIntegracoes.get('/lembretes', integracoesController.listarLembretes)
