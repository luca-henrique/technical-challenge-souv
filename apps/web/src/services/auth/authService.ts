import { api } from '@/lib/api'
import type { CredenciaisLogin, RespostaLogin } from './types'

export async function fazerLogin(credenciais: CredenciaisLogin): Promise<RespostaLogin> {
  return api<RespostaLogin>('/auth/login', {
    metodo: 'POST',
    corpo: credenciais,
  })
}

export const authService = {
  fazerLogin,
}
