import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string({ message: 'E-mail é obrigatório' }).min(1, 'E-mail é obrigatório'),
  senha: z.string({ message: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
})

export type LoginInput = z.infer<typeof loginSchema>
