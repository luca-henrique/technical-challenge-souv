# RN04: Exclusividade de Atendimento e Prevenção de Conflitos

## 1. Descrição da Regra

> **Regra Oficial**: *"Um profissional atende um paciente por vez. Não existe encaixe."*

- **Exclusividade**: Não é permitido sobrepor consultas de um mesmo profissional no mesmo período de tempo.
- **Vedação a Encaixes**: Toda consulta deve respeitar rigorosamente a grade de horários disponíveis. Não há exceções ou agendamentos simultâneos.
- **Isolamento de Concorrência**: Agendamentos concorrentes para o mesmo horário devem ser prevenidos contra condições de corrida (*race conditions*).

---

## 2. Impacto e Problemas Relatados da Clínica

> *“Na semana passada o doutor ficou com dois pacientes no mesmo horário.”*  
> *“Aconteceu uma vez de duas pessoas marcarem o mesmo horário. Não conseguimos reproduzir.”*

### Causas Raiz
1. **Verificação de Conflitos Desconsiderando Duração**:
   - Se uma consulta é de 60 minutos (ex.: 10:00 às 11:00) e outra pessoa tenta marcar às 10:30, uma validação simples de igualdade de hora (`hora === "10:30"`) falharia em detectar o conflito.
2. **Condição de Corrida (*Race Condition*)**:
   - Duas requisições simultâneas para o mesmo profissional e horário liam o banco ao mesmo tempo, ambas viam o horário livre e ambas executavam `prisma.consulta.create`, gerando duplicidade no mesmo slot.
3. **Consultas Canceladas**:
   - Consultas com status `cancelada` não devem ser consideradas como conflito; no entanto, consultas ativas (`agendada`) bloqueiam integralmente o intervalo.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Algoritmo de Detecção de Conflitos ([`apps/api/src/agenda.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts))**:
  ```ts
  export function temConflito(marcadas: Consulta[], nova: { hora: string; tipo: TipoConsulta }) {
    const inicioNovo = paraMinutos(nova.hora)
    const fimNovo = inicioNovo + DURACAO_MINUTOS[nova.tipo]

    return marcadas.some((m) => {
      // Ignora consultas canceladas
      if (m.status === 'cancelada') return false
      const inicioM = paraMinutos(m.hora)
      const fimM = inicioM + DURACAO_MINUTOS[m.tipo]
      // Condição matemática de sobreposição de intervalos abertos:
      return inicioNovo < fimM && fimNovo > inicioM
    })
  }
  ```
- **Filtro de Status no Banco**:
  ```ts
  const marcadas = await prisma.consulta.findMany({
    where: { profissionalId, data, status: 'agendada' }
  })
  if (temConflito(marcadas, { hora, tipo })) {
    res.status(409).json({ erro: 'Esse horário já está ocupado' })
    return
  }
  ```
- **Tratamento de Erro HTTP**: Retorno estrito de `409 Conflict`.

### Front-end (`apps/web`)
- **Desabilitação / Ocultação de Horários Ocupados**:
  - Componente [`SeletorHorario`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorHorario/seletorHorario.tsx) consome a rota de horários disponíveis.
- **Tratamento Amigável de Erros 409**:
  - Se outro usuário agendou o horário instantes antes, a mutação do TanStack Query captura o erro e exibe `<Alert>{erro}</Alert>` instruindo a escolher outro horário.
  - Invalidação automática dos dados de agenda.

---

## 4. Checklist de Verificação

### Back-end
- [x] Detecção de sobreposição considerando diferentes combinações de duração (60min x 30min, 30min x 60min, 60min x 60min).
- [x] Filtragem estrita de consultas ativas (`status = 'agendada'`) na verificação de conflitos.
- [x] Retorno de status `409 Conflict` com mensagem clara quando houver colisão de agenda.
- [x] Garantia de atomicidade para evitar agendamentos simultâneos duplicados.

### Front-end
- [x] Atualização reativa da lista de consultas via TanStack Query.
- [x] Invalidação automática da chave `['agenda', profissionalId, data]` após agendamento.
- [x] Tratamento visual de erro para alertas de conflito (HTTP 409).
- [x] Desabilitação do botão de submissão enquanto a requisição estiver pendente (`isPending`).
