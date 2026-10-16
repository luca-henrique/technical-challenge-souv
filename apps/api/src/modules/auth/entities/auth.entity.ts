import type { Perfil } from '@bemviver/shared'

export interface UsuarioAuth {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

export interface UsuarioComSenha extends UsuarioAuth {
  senhaHash: string
}

export interface RespostaLogin {
  token: string
  usuario: {
    id: string
    nome: string
    perfil: Perfil
  }
}
