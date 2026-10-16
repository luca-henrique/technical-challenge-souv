import { describe, expect, it } from 'vitest'
import { gerarHashSenha } from '../../../middlewares/authMiddleware'
import type { IAuthRepository } from '../repositories/auth.repository'
import { LoginUseCase } from './login.usecase'

class InMemoryAuthRepository implements IAuthRepository {
  async buscarPorEmail(email: string) {
    if (email === 'teste@exemplo.com') {
      return {
        id: '123',
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        perfil: 'paciente' as const,
        senhaHash: gerarHashSenha('senha123'),
      }
    }
    return null
  }
}

describe('LoginUseCase', () => {
  it('autentica com sucesso com credenciais válidas', async () => {
    const useCase = new LoginUseCase(new InMemoryAuthRepository())
    const resposta = await useCase.executar({ email: 'teste@exemplo.com', senha: 'senha123' })

    expect(resposta.token).toBeDefined()
    expect(resposta.usuario).toEqual({
      id: '123',
      nome: 'Usuario Teste',
      perfil: 'paciente',
    })
  })

  it('falha ao autenticar com senha incorreta', async () => {
    const useCase = new LoginUseCase(new InMemoryAuthRepository())
    await expect(
      useCase.executar({ email: 'teste@exemplo.com', senha: 'senhaErrada' })
    ).rejects.toThrow('E-mail ou senha incorretos')
  })

  it('falha ao autenticar com e-mail inexistente', async () => {
    const useCase = new LoginUseCase(new InMemoryAuthRepository())
    await expect(
      useCase.executar({ email: 'inexistente@exemplo.com', senha: 'senha' })
    ).rejects.toThrow('E-mail ou senha incorretos')
  })
})
