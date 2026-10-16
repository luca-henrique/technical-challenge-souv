import { Router } from 'express'
import { authController } from './controllers/auth.controller'

export const rotasAuth = Router()

rotasAuth.post('/login', authController.login)
