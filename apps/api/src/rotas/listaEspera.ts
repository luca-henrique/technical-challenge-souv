import { Router } from 'express'
import { permitir } from '../auth'
import {
  inscreverListaEspera,
  listarListaEspera,
  listarMinhasEspera,
  removerListaEspera,
} from '../controllers/listaEsperaController'

export const rotasListaEspera = Router()

rotasListaEspera.post('/', permitir('paciente', 'recepcao'), inscreverListaEspera)
rotasListaEspera.get('/', permitir('recepcao'), listarListaEspera)
rotasListaEspera.get('/minhas', permitir('paciente'), listarMinhasEspera)
rotasListaEspera.delete('/:id', permitir('paciente', 'recepcao'), removerListaEspera)
