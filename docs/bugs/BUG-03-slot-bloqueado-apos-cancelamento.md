# BUG-03: Slot Bloqueado Após Cancelamento de Consulta

## 1. Relato da Clínica

> *“Quando alguém cancela, ninguém mais consegue marcar naquele horário.”*

- **Severidade**: Média / Alta
- **Impacto no Negócio**: Perda de receita para a clínica, horários ociosos de médicos que poderiam ser reaproveitados por outros pacientes e frustração de pacientes que veem horários indisponíveis mesmo quando vagos.
- **Regras de Negócio Associadas**:
  - [RN05 - Cancelamento de Consultas e Liberação de Horário](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md)
  - [RN04 - Exclusividade de Atendimento e Prevenção de Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)

---

## 2. Causa Raiz Técnica

No modelo de dados da clínica, o cancelamento é realizado via **soft delete**:
O registro da consulta nunca é apagado fisicamente da tabela `consultas`; em vez disso, o campo `status` é atualizado para `'cancelada'` e o timestamp `canceladaEm` é preenchido.

### A Falha na Query do Banco de Dados
Ao calcular os horários disponíveis em `GET /profissionais/:id/horarios` e ao validar novos agendamentos em `POST /consultas`, a query original buscava todas as consultas do profissional naquela data:

```ts
// Código com bug: buscava inclusive consultas canceladas
const marcadas = await prisma.consulta.findMany({
  where: { profissionalId, data } // Faltava filtrar pelo status!
})
```

Como o registro da consulta cancelada ainda existia no banco, o algoritmo de disponibilidade considerava o horário ocupado e o removia da lista de horários livres (`horarios: []`).

---

## 3. Solução Implementada

### 3.1. Filtro Estrito de Status Ativo no Prisma
Todas as queries de busca de horários ocupados foram atualizadas para filtrar exclusivamente consultas ativas:

```ts
const marcadas = await prisma.consulta.findMany({
  where: { profissionalId, data, status: 'agendada' },
})
```

### 3.2. Defesa em Profundidade na Função `temConflito`
Em [`apps/api/src/agenda.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts#L31-L33), foi adicionada uma checagem defensiva para que qualquer consulta com status `cancelada` seja sumariamente ignorada pelo verificador de conflitos:

```ts
if (marcada.status === 'cancelada') {
  return false
}
```

### 3.3. Invalidação Reativa no Front-end
Nos hooks de cancelamento ([`useMinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useMinhasConsultas.ts#L18-L22) e [`useAgenda`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgenda.ts#L21-L25)), o sucesso do cancelamento invalida automaticamente as chaves `['horarios']` e `['agenda']` no TanStack Query, refletindo o slot liberado imediatamente sem necessidade de recarregar a tela.

---

## 4. Testes Automatizados de Validação

- **Back-end**: [`apps/api/test/rn05-cancelamento-de-consultas.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn05-cancelamento-de-consultas.test.ts)
  - `libera imediatamente o horário cancelado para nova consulta na rota de horários e no agendamento`: cancela consulta às 16:00 e valida que o slot reaparece em `/horarios` e permite agendamento por outro paciente com status 201.
- **Front-end**: [`apps/web/test/rn05-cancelamento-de-consultas.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn05-cancelamento-de-consultas.test.tsx)
  - Valida fluxo de cancelamento e invalidação automática da agenda da recepção e lista do paciente.
