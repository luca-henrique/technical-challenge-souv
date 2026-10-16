import type { Request, Response } from 'express'
import { PrismaAuthRepository } from '../repositories/auth.repository'
import { LoginUseCase } from '../usecases/login.usecase'
import { loginSchema } from '../validations/auth.validation'

export class AuthController {
  private readonly loginUseCase: LoginUseCase

  constructor(loginUseCase?: LoginUseCase) {
    this.loginUseCase = loginUseCase ?? new LoginUseCase(new PrismaAuthRepository())
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const validacao = loginSchema.safeParse(req.body)
    if (!validacao.success) {
      res.status(401).json({ erro: 'E-mail ou senha incorretos' })
      return
    }

    try {
      const resultado = await this.loginUseCase.executar(validacao.data)
      res.json(resultado)
    } catch (erro) {
      if (erro instanceof Error && erro.message === 'E-mail ou senha incorretos') {
        res.status(401).json({ erro: erro.message })
        return
      }
      res.status(500).json({ erro: 'Erro interno no servidor' })
    }
  }
}

export const authController = new AuthController()
