import { conferirSenha, gerarToken } from '../../../middlewares/authMiddleware'
import type { RespostaLogin } from '../entities/auth.entity'
import type { IAuthRepository } from '../repositories/auth.repository'

export interface LoginParams {
  email: string
  senha: string
}

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async executar({ email, senha }: LoginParams): Promise<RespostaLogin> {
    const emailLimpo = email.trim().toLowerCase()
    const usuario = await this.authRepository.buscarPorEmail(emailLimpo)

    if (!usuario || !conferirSenha(senha, usuario.senhaHash)) {
      throw new Error('E-mail ou senha incorretos')
    }

    const dados = {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
    }

    return {
      token: gerarToken(dados),
      usuario: dados,
    }
  }
}
