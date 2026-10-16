# BUG-02: Sobreposição de Consultas com Durações Diferentes (60 min x 30 min)

## 1. Relato da Clínica

> *“Na semana passada o doutor ficou com dois pacientes no mesmo horário.”*

- **Severidade**: Crítica
- **Impacto no Negócio**: Médicos atendendo dois pacientes simultaneamente no mesmo consultório, estresse na recepção, atrasos em cascata na agenda do dia e violação da regra de exclusividade médica.
- **Regras de Negócio Associadas**:
  - [RN03 - Duração de Consultas e Tipos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md)
  - [RN04 - Exclusividade de Atendimento e Prevenção de Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)

---

## 2. Causa Raiz Técnica

O sistema possui dois tipos canônicos de consulta com durações distintas:
1. `'primeira'`: **60 minutos** (ocupa 2 slots consecutivos de 30 minutos).
2. `'retorno'`: **30 minutos** (ocupa 1 slot de 30 minutos).

### A Falha na Verificação de Conflitos
O código original verificava apenas se o horário de início da nova consulta era idêntico ao de uma consulta já agendada:

```ts
// Código com bug: verificava apenas igualdade exata de string
const ocupado = marcadas.some((m) => m.hora === novaHora)
```

### O Cenário do Erro
1. O paciente A marcou uma primeira consulta (`tipo: 'primeira'`) às **10:00**. Essa consulta ocupa o intervalo das **10:00 às 11:00** (slots `10:00` e `10:30`).
2. O paciente B solicitava um agendamento às **10:30**.
3. Como `"10:30" !== "10:00"`, o algoritmo considerava o slot livre e criava o agendamento no banco.
4. Às 10:30, ambos os pacientes chegavam ao consultório do médico.

---

## 3. Solução Implementada

### 3.1. Algoritmo de Interseção de Intervalos de Tempo
Na função [`temConflito`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts#L27-L40), os horários são convertidos em minutos a partir da meia-noite e as durações oficiais (`DURACAO_MINUTOS[tipo]`) são somadas para calcular os limites de início e fim:

```ts
export function temConflito(marcadas: Horario[], nova: Horario) {
  const iniNova = paraMinutos(nova.hora)
  const fimNova = iniNova + (DURACAO_MINUTOS[nova.tipo] ?? 30)

  return marcadas.some((marcada) => {
    if (marcada.status === 'cancelada') return false
    const iniMarcada = paraMinutos(marcada.hora)
    const fimMarcada = iniMarcada + (DURACAO_MINUTOS[marcada.tipo] ?? 30)

    // Condição matemática de sobreposição de intervalos abertos:
    return iniNova < fimMarcada && fimNova > iniMarcada
  })
}
```

### 3.2. Casos Cobertos Pela Regra
- Consulta de 60 min às 09:00 bloqueia início às `09:00` e às `09:30`.
- Consulta existente às 10:00 bloqueia tentativa de primeira consulta (60 min) às `09:30` (terminaria às 10:30), mas permite retorno (30 min) às `09:30` (termina às 10:00).
- Primeira consulta (60 min) é bloqueada às `11:30` (invadiria o almoço 12h-13h) e às `17:30` (invadiria após o fechamento da clínica às 18h).

---

## 4. Testes Automatizados de Validação

- **Back-end (Regressão Dedicada)**: [`apps/api/test/bugs/bug-02-sobreposicao-duracoes.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/bugs/bug-02-sobreposicao-duracoes.test.ts)
  - `relato da clínica: doutor não pode ficar com dois pacientes no mesmo horário quando um deles tem consulta de 60 min`
  - Valida bloqueio de slot subsequente (`10:30`), bloqueio de invasão antecedente (`09:30` primeira), liberação de retorno limítrofe (`09:30` retorno) e grade de horários da rota.
- **Back-end**: [`apps/api/test/rn03-duracao-consultas-e-tipos.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn03-duracao-consultas-e-tipos.test.ts)
  - `Caso 3: Primeira consulta às 09:00 bloqueia início às 09:00 e às 09:30`
  - `Caso 4: Consulta existente às 10:00 impede primeira consulta (60min) às 09:30`
- **Back-end**: [`apps/api/test/rn04-exclusividade-e-conflitos.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn04-exclusividade-e-conflitos.test.ts)
  - `detecta colisão quando uma consulta de 60 minutos bloqueia o slot seguinte`
  - `detecta colisão quando uma nova consulta de 60 minutos invade consulta existente posterior`

---

## 5. Status da Resolução: Concluído e Validado ✅

- **Diagnóstico confirmado**: Verificação ingênua por igualdade de string (`hora === novaHora`) permitia invasões em consultas de 60 minutos.
- **Correção aplicada**: Algoritmo de interseção contínua de intervalos em [`temConflito`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts) e [`consultasController`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/controllers/consultasController.ts).
- **Cobertura de testes**: 100% dos cenários de sobreposição de durações validados ponta a ponta no banco de dados.
