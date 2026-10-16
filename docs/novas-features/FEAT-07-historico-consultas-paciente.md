# FEAT-07: Histórico de Consultas do Paciente

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 7º Lugar (RICE Score: 10.0)
- **Status**: Média Prioridade
- **Objetivo**: Permitir que o paciente e os profissionais visualizem todo o histórico cronológico de consultas passadas (realizadas, faltadas ou canceladas) com filtros e paginação.

Atualmente, o endpoint `GET /consultas/minhas` filtra exclusivamente `data: { gte: hojeEmRecife() }`. O paciente só enxerga consultas futuras. Consultas concluídas desaparecem da tela, impedindo que o paciente consulte o nome do médico que o atendeu no mês anterior ou saiba quando fez seu último retorno.

---

## 2. Requisitos Funcionais

1. **Abas de Navegação no Painel do Paciente**:
   - Aba **"Próximas consultas"**: Consultas futuras agendadas (`data >= hojeEmRecife()`).
   - Aba **"Histórico"**: Consultas passadas (`data < hojeEmRecife()` ou com status `'realizada'`, `'faltou'`, `'cancelada'`).
2. **Transição Temporal e Cancelamento por Falta de Confirmação (Edge Case)**:
   - Se o horário de início da consulta já passou (`inicio <= agora`):
     - Caso o paciente **não tenha confirmado presença** até o horário (`confirmadaEm === null`), a consulta é automaticamente cancelada (`status: 'cancelada'`, com `canceladaEm: agora`).
     - A consulta deixa imediatamente a aba **"Próximas consultas"** e migra para o **"Histórico"**, mesmo que ocorra no dia de hoje (ex.: consulta hoje às 13:30, mas o horário atual já é 14:00).
3. **Visualização Detalhada do Registro**:
   - Cada card do histórico exibe: profissional, especialidade, data, horário, tipo (`primeira` ou `retorno`) e o desfecho (`Realizada`, `Faltou`, `Cancelada`).
4. **Visão pelo Profissional**:
   - Ao atender um paciente, o médico pode visualizar seu histórico completo na clínica, melhorando o acompanhamento clínico.

---

## 3. Especificação Técnica

### 3.1. Endpoints da API

- `GET /consultas/minhas`:
  - Executa rotina de cancelamento automático das consultas do paciente com `status = 'agendada'`, `confirmadaEm = null` e `inicio <= agora`.
  - Se `historico=false` (padrão): filtra consultas futuras estritamente posteriores ao instante atual:
    ```ts
    where: {
      pacienteId: req.usuario.id,
      inicio: { gt: agora },
      status: 'agendada',
    }
    ```
  - Se `historico=true`: retorna todas as consultas cujo horário de início já passou ou com status concluído/cancelado:
    ```ts
    where: {
      pacienteId: req.usuario.id,
      OR: [
        { inicio: { lte: agora } },
        { status: { in: ['realizada', 'faltou', 'cancelada'] } },
      ],
    }
    ```
  - Ordenação: `orderBy: { inicio: historico ? 'desc' : 'asc' }`.

- `GET /pacientes/:id/consultas`:
  - Executa a mesma rotina de cancelamento de consultas expiradas sem confirmação e retorna todo o histórico ordenado decrescente por `inicio`.

### 3.2. Front-end
- Componente de Tabs (`Abas`) no topo da página `/paciente` alternando entre "Próximas consultas" e "Histórico".
- As consultas expiradas ou canceladas por falta de confirmação aparecem com o badge e status de cancelamento, sem ações de remarcação ou novo cancelamento.

