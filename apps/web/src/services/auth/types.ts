import type { Usuario } from '@bemviver/shared'

export interface CredenciaisLogin {
  email: string
  senha: string
}

export interface RespostaLogin {
  token: string
  usuario: Usuario
}
