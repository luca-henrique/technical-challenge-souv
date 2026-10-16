# FEAT-02: Confirmação de Presença pelo Paciente

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 2º Lugar (RICE Score: 15.0)
- **Status**: Selecionada para Implementação
- **Objetivo**: Permitir que o paciente confirme ativamente sua presença na consulta com até 24h a 48h de antecedência através do painel online ou de link enviado no lembrete.

Enquanto o lembrete (FEAT-01) notifica passivamente o paciente, a confirmação de presença fecha o ciclo de engajamento. Ela fornece à clínica a certeza operacional de que o paciente comparecerá. Caso o paciente indique que não poderá comparecer, o horário pode ser imediatamente liberado para a fila de espera ou para outros agendamentos.

---

## 2. Requisitos Funcionais

1. **Confirmação pelo Paciente**:
   - Na lista "Minhas consultas", cada consulta com status `'agendada'` exibe o badge de confirmação e um botão `"Confirmar presença"`.
   - Uma vez confirmada, a consulta exibe o estado `"Presença confirmada"` com ícone verde.
2. **Visibilidade para a Recepção**:
   - Na tabela de consultas da recepção (`AgendaDoDia`), uma coluna `"Confirmada"` ou badge identifica visualmente os pacientes que já confirmaram e os que ainda estão pendentes.
3. **Idempotência e Segurança**:
   - Apenas o próprio paciente dono da consulta ou a recepção podem registrar a confirmação.
   - Não é permitido confirmar consultas já canceladas, faltadas ou realizadas.

---

## 3. Especificação Técnica

### 3.1. Modelo de Dados (Prisma)
Adição do campo `confirmadaEm` no modelo `Consulta`:

```prisma
model Consulta {
  // ... campos existentes
  confirmadaEm  DateTime?
}
```

### 3.2. Endpoints da API
- `POST /consultas/:id/confirmar`:
  - **Permissão**: `permitir('paciente', 'recepcao')`
  - **Regra**: Valida se o paciente logado é o titular da consulta (ou se é perfil `recepcao`).
  - **Ação**: Atualiza `confirmadaEm: new Date()`.
  - **Resposta**: Retorna a consulta atualizada (`200 OK`).

### 3.3. Interface Front-end
- No [`CartaoConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx), adição do botão de ação com mutate do TanStack Query.
- Na [`TabelaConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx), inclusão da indicação de presença confirmada.
