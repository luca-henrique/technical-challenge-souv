import express from 'express'
import { autenticar } from './middlewares/authMiddleware'
import { errorHandler } from './middlewares/errorHandler'
import { rotasAuth } from './modules/auth/routes'
import { rotasConsultas } from './modules/consultas/routes'
import { rotasIntegracoes } from './modules/integracoes/routes'
import { rotasListaEspera } from './modules/listaEspera/routes'
import { rotasPacientes } from './modules/pacientes/routes'
import { rotasProfissionais } from './modules/profissionais/routes'
import { rotasRelatorios } from './modules/relatorios/routes'

export const app = express()

app.use(express.json())

app.use('/auth', rotasAuth)
app.use('/integracoes', rotasIntegracoes)
app.use(autenticar)
app.use('/profissionais', rotasProfissionais)
app.use('/especialidades', rotasProfissionais)
app.use('/consultas', rotasConsultas)
app.use('/pacientes', rotasPacientes)
app.use('/relatorios', rotasRelatorios)
app.use('/lista-espera', rotasListaEspera)

app.use(errorHandler)
