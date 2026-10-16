import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { hojeEmRecife } from '@bemviver/shared'
import { app } from '../../src/app'
import { criarConsulta, criarUsuario, proximaSegunda, somarDias } from '../ajuda'

const CHAVE = process.env.CHAVE_INTEGRACAO ?? 'chave-local-do-n8n'

describe('FEAT-01: Lembrete Automático de Consultas com n8n', () => {
  it('rejeita chamadas sem a chave de integração ou com chave incorreta', async () => {
    const semChave = await request(app).get('/integracoes/lembretes')
    expect(semChave.status).toBe(401)
    expect(semChave.body).toEqual({ erro: 'Chave de integração inválida' })

    const chaveInvalida = await request(app)
      .get('/integracoes/lembretes')
      .set('x-chave-integracao', 'chave-falsa-123')
    expect(chaveInvalida.status).toBe(401)
  })

  it('valida formato da data quando passado parâmetro de busca', async () => {
    const resposta = await request(app)
      .get('/integracoes/lembretes')
      .query({ data: 'data-invalida' })
      .set('x-chave-integracao', CHAVE)

    expect(resposta.status).toBe(400)
    expect(resposta.body).toEqual({ erro: 'Informe a data no formato AAAA-MM-DD' })
  })

  it('retorna os campos completos da consulta e do paciente para o n8n', async () => {
    const paciente = await criarUsuario('paciente', 'Carlos Eduardo')
    const profissional = await criarUsuario('profissional', 'Dra. Beatriz Santos')
    const segunda = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: segunda,
      hora: '14:30',
      tipo: 'primeira',
      status: 'agendada',
    })

    // Consulta cancelada no mesmo dia (não deve aparecer no lembrete)
    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: segunda,
      hora: '15:30',
      tipo: 'retorno',
      status: 'cancelada',
    })

    const resposta = await request(app)
      .get('/integracoes/lembretes')
      .query({ data: segunda })
      .set('x-chave-integracao', CHAVE)

    expect(resposta.status).toBe(200)
    expect(resposta.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: consulta.id,
          consultaId: consulta.id,
          data: segunda,
          hora: '14:30',
          tipo: 'primeira',
          pacienteNome: 'Carlos Eduardo',
          pacienteEmail: paciente.email,
          profissionalNome: 'Dra. Beatriz Santos',
          especialidade: 'Clínica geral',
        }),
      ]),
    )

    // Garante que a consulta cancelada não foi retornada
    const cancelada = resposta.body.find((item: { hora: string }) => item.hora === '15:30')
    expect(cancelada).toBeUndefined()
  })

  it('usa o dia seguinte como data padrão para lembretes de 24 horas', async () => {
    const paciente = await criarUsuario('paciente', 'Juliana Lima')
    const profissional = await criarUsuario('profissional', 'Dr. Marcos Dias')
    const amanha = somarDias(hojeEmRecife(), 1)

    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: amanha,
      hora: '10:00',
      status: 'agendada',
    })

    const resposta = await request(app)
      .get('/integracoes/lembretes')
      .set('x-chave-integracao', CHAVE)

    expect(resposta.status).toBe(200)
    const lembreteAmanha = resposta.body.find((item: { pacienteEmail: string }) => item.pacienteEmail === paciente.email)
    expect(lembreteAmanha).toBeDefined()
    expect(lembreteAmanha?.data).toBe(amanha)
    expect(lembreteAmanha?.hora).toBe('10:00')
  })

  it('valida integridade e estrutura do fluxo n8n exportado em n8n/lembrete.json', () => {
    const caminhoFluxo = path.resolve(process.cwd(), '../../n8n/lembrete.json')
    expect(fs.existsSync(caminhoFluxo)).toBe(true)

    const conteudo = fs.readFileSync(caminhoFluxo, 'utf-8')
    const fluxo = JSON.parse(conteudo)

    expect(fluxo.name).toContain('Lembrete')
    expect(Array.isArray(fluxo.nodes)).toBe(true)
    expect(fluxo.nodes.length).toBeGreaterThanOrEqual(4)

    // Validar nós essenciais do fluxo
    const tipos = fluxo.nodes.map((n: { type: string }) => n.type)
    expect(tipos).toContain('n8n-nodes-base.scheduleTrigger')
    expect(tipos).toContain('n8n-nodes-base.httpRequest')
    expect(tipos).toContain('n8n-nodes-base.code')
    expect(tipos).toContain('n8n-nodes-base.emailSend')

    // Validar configuração do nó HTTP
    const httpNode = fluxo.nodes.find((n: { type: string }) => n.type === 'n8n-nodes-base.httpRequest')
    expect(httpNode.parameters.url).toContain('/integracoes/lembretes')

    // Validar configuração do nó de envio de email
    const emailNode = fluxo.nodes.find((n: { type: string }) => n.type === 'n8n-nodes-base.emailSend')
    expect(emailNode.parameters.fromEmail).toBe('atendimento@clinicabemviver.com.br')
  })
})
