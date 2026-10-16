import { Router } from 'express'
import { permitir } from '../../middlewares/authMiddleware'
import { listaEsperaController } from './controllers/listaEspera.controller'

export const rotasListaEspera = Router()

rotasListaEspera.post('/', permitir('paciente', 'recepcao'), listaEsperaController.inscrever)
rotasListaEspera.get('/', permitir('recepcao'), listaEsperaController.listar)
rotasListaEspera.get('/minhas', permitir('paciente'), listaEsperaController.listarMinhas)
rotasListaEspera.delete('/:id', permitir('paciente', 'recepcao'), listaEsperaController.remover)
