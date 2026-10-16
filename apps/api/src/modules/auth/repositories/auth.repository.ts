import { prisma } from '../../../infra/database'
import type { UsuarioComSenha } from '../entities/auth.entity'

export interface IAuthRepository {
  buscarPorEmail(email: string): Promise<UsuarioComSenha | null>
}

export class PrismaAuthRepository implements IAuthRepository {
  async buscarPorEmail(email: string): Promise<UsuarioComSenha | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) return null

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      senhaHash: usuario.senhaHash,
    }
  }
}
