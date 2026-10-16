# FEAT-03: Remarcação de Consulta pelo Próprio Paciente

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 3º Lugar (RICE Score: 9.0)
- **Status**: Alta Prioridade (Planejada para Próxima Fase)
- **Objetivo**: Permitir que o paciente altere a data ou o horário de uma consulta já agendada em uma única operação atômica e intuitiva no portal online.

No fluxo atual, se o paciente tiver um imprevisto de horário, ele precisa:
1. Cancelar a consulta existente (o que pode deixá-lo sem vaga).
2. Tentar agendar uma nova consulta do zero.
3. Ou ligar para a recepção, gerando fila de espera no telefone.

A remarcação direta preserva o vínculo da consulta, mantém o histórico clínico e libera o horário antigo automaticamente ao ocupar o novo.

---

## 2. Requisitos de Negócio e Validações

1. **Atomicidade da Troca**:
   - O horário antigo só pode ser liberado se o novo horário for reservado com sucesso absoluto.
   - Ambas as operações devem ocorrer dentro de uma única transação no banco de dados com advisory lock contra race condition.
2. **Manutenção do Tipo e Duração**:
   - Uma consulta do tipo `'primeira'` (60 min) deve continuar ocupando 60 min no novo horário escolhido.
   - Uma consulta do tipo `'retorno'` (30 min) mantém 30 min.
3. **Regras de Expediente e Conflitos**:
   - A nova data e hora devem respeitar dia útil, intervalo 08h-18h, almoço 12h-13h ([RN01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN01-horario-expediente-e-almoco.md)) e ausência de folga do médico ([RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md)).

---

## 3. Especificação Técnica

### 3.1. Endpoint da API
- `PATCH /consultas/:id/remarcar`:
  - **Permissão**: `permitir('paciente', 'recepcao')`
  - **Body**: `{ "novaData": "2026-10-20", "novaHora": "15:00" }`
  - **Comportamento**:
    1. Bloqueia advisory lock no PostgreSQL para o médico e nova data.
    2. Valida disponibilidade do novo slot.
    3. Atualiza `data`, `hora`, `inicio`, `fim` e incrementa contador `remarcacoesCount`.
    4. Retorna status `200 OK`.

### 3.2. Interface do Usuário
- Botão `"Remarcar"` no `CartaoConsulta`.
- Modal ou tela com seleção de nova data e horários disponíveis em tempo real.
