# BUG-06: Condição de Corrida em Agendamentos Simultâneos (Race Condition)

## 1. Relato da Clínica

> *“Aconteceu uma vez de duas pessoas marcarem o mesmo horário. Não conseguimos reproduzir.”*

- **Severidade**: Crítica / Intermitente (Heisenbug)
- **Impacto no Negócio**: Duplo agendamento fantasma impossível de reproduzir em testes manuais convencionais, constrangimento de pacientes e médicos, e desconfiança na confiabilidade do banco de dados.
- **Regras de Negócio Associadas**:
  - [RN04 - Exclusividade de Atendimento e Prevenção de Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)
  - [RN03 - Duração de Consultas e Tipos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md)

---

## 2. Causa Raiz Técnica

O problema era originado por uma **condição de corrida (*race condition*)** entre requisições HTTP paralelas no Node.js/Express.

### A Janela de Concorrência
O fluxo anterior de criação de consulta em `POST /consultas` operava sem transação atômica serializada:

```ts
// 1. Thread A lê consultas marcadas
const marcadasA = await prisma.consulta.findMany({ where: { profissionalId, data, status: 'agendada' } })
// 2. Thread B lê consultas marcadas simultaneamente (antes de A gravar!)
const marcadasB = await prisma.consulta.findMany({ where: { profissionalId, data, status: 'agendada' } })

// 3. Ambas avaliam temConflito como FALSE
if (temConflito(marcadasA, nova)) { ... } // False!
if (temConflito(marcadasB, nova)) { ... } // False!

// 4. Ambas criam a consulta no banco
await prisma.consulta.create(...) // Consulta A criada!
await prisma.consulta.create(...) // Consulta B criada no mesmo slot!
```

Como cada consulta pode durar 30 min ou 60 min (ocupando múltiplos blocos contíguos), um simples índice único `UNIQUE(profissionalId, data, hora)` não era suficiente para impedir colisões parciais (ex.: consulta de 60 min às 09:00 colidindo com consulta de 30 min às 09:30).

---

## 3. Solução Implementada

### 3.1. Transação Interativa com Advisory Lock no PostgreSQL
Em [`apps/api/src/controllers/consultasController.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/controllers/consultasController.ts#L55-L81), a validação e a inserção foram encapsuladas em uma transação interativa com **PostgreSQL Transaction-level Advisory Lock**:

```ts
const consulta = await prisma.$transaction(async (tx) => {
  // Lock atômico por profissional + data no PostgreSQL
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${data}))`

  // 1. Verifica folga
  const folga = await tx.folga.findUnique({
    where: { profissionalId_data: { profissionalId, data } },
  })
  if (folga) {
    throw new Error('O profissional está de folga nesse dia')
  }

  // 2. Busca consultas já gravadas (incluindo as recém-gravadas por transações concorrentes)
  const marcadas = await tx.consulta.findMany({
    where: { profissionalId, data, status: 'agendada' },
  })
  if (temConflito(marcadas, { hora, tipo })) {
    throw new Error('Esse horário já está ocupado')
  }

  const inicio = instante(data, hora)
  const fim = new Date(inicio.getTime() + DURACAO_MINUTOS[tipo] * 60_000)

  return tx.consulta.create({
    data: { profissionalId, pacienteId: idPacienteFinal, data, hora, tipo, inicio, fim },
  })
})
```

### 3.2. Mecanismo de Funcionamento
1. A função nativa `pg_advisory_xact_lock` bloqueia apenas a chave hash do par `profissionalId + data`.
2. Outros médicos ou outras datas continuam sendo processados em paralelo com máxima performance.
3. Se duas requisições simultâneas chegarem para o mesmo médico na mesma data, a primeira adquire o lock e conclui o agendamento; a segunda aguarda na fila e, ao adquirir o lock, encontra o slot já ocupado, recebendo `409 Conflict` com `{ erro: 'Esse horário já está ocupado' }`.

---

## 4. Testes Automatizados de Validação

- **Back-end**: [`apps/api/test/rn04-exclusividade-e-conflitos.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn04-exclusividade-e-conflitos.test.ts)
  - `garante que duas requisições simultâneas para o mesmo horário criem apenas uma consulta`: dispara simultaneamente via `Promise.all` duas requisições de agendamento HTTP para o mesmo médico no mesmo slot e comprova que:
    1. Uma requisição responde `201 Created` e a outra `409 Conflict`.
    2. No banco de dados, o número total de consultas criadas é rigorosamente igual a **1**.
