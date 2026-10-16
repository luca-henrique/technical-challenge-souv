import { Router } from 'express'
import { permitir } from '../auth'
import { prisma } from '../prisma'

export const rotasPacientes = Router()

rotasPacientes.get('/', permitir('recepcao'), async (_req, res) => {
  const pacientes = await prisma.usuario.findMany({
    where: { perfil: 'paciente' },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: 'asc' },
  })
  res.json(pacientes)
})

rotasPacientes.get('/:id/consultas', permitir('recepcao', 'profissional'), async (req, res) => {
  const pacienteId = String(req.params.id)
  const consultas = await prisma.consulta.findMany({
    where: { pacienteId },
    include: { profissional: { include: { usuario: { select: { nome: true } } } } },
    orderBy: { inicio: 'desc' },
  })

  res.json(
    consultas.map(({ profissional, ...consulta }) => ({
      ...consulta,
      profissionalNome: profissional.usuario.nome,
      especialidade: profissional.especialidade,
    })),
  )
})
