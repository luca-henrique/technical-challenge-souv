import { z } from 'zod'

export const entrarListaEsperaSchema = z.object({
  turno: z.enum(['manha', 'tarde', 'qualquer'], {
    message: 'Selecione uma preferência de turno',
  }),
})

export type DadosEntrarListaEspera = z.infer<typeof entrarListaEsperaSchema>
