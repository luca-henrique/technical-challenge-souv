# RN18: Concorrência Atômica e Prevenção de Condições de Corrida

## 1. Descrição da Regra

> **Regra Oficial**: *"Quando duas ou mais requisições simultâneas tentarem agendar consultas concorrentes para o mesmo profissional e horário sobreposto, o sistema deve processar a gravação de forma atômica e serializada. A primeira requisição confirmada obtém a reserva do horário, enquanto a segunda requisição é obrigatoriamente rejeitada com HTTP 409 Conflict."*

- **Garantia de Isolamento Transacional**: A leitura da disponibilidade e a persistência da consulta devem operar dentro de um escopo transacional atômico, impedindo que requisições paralelas leiam um mesmo estado falso de "horário vago" antes da primeira gravar.
- **Resposta Padrão de Conflito**: Em caso de colisão concorrente detectada, o sistema responde com **HTTP 409 Conflict** e payload descritivo:
  ```json
  { "erro": "Esse horário já está ocupado" }
  ```
- **Integridade da Base de Dados**: Nunca deve existir mais de uma consulta ativa (`status = 'agendada'`) ocupando o mesmo intervalo de tempo de um mesmo médico.

---

## 2. Impacto e Casos de Borda (Resolução do [BUG-06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-06-condicao-de-corrida-agendamento-simultaneo.md))

> *“Aconteceu uma vez de duas pessoas marcarem o mesmo horário. Não conseguimos reproduzir.”*

1. **A Janela de Concorrência**:
   - Paciente A e Paciente B clicam em "Agendar" no exato mesmo milissegundo para as 14:00 com o Dr. Rafael.
   - Em arquiteturas sem bloqueio atômico, as threads leem o banco simultaneamente, ambas concluem que o horário está livre e ambas executam `INSERT`.
2. **Eliminação do Heisenbug**:
   - Com validação serializada, o banco bloqueia a segunda inserção conflitante, mantendo a credibilidade do sistema junto à clínica e pacientes.
3. **Tratamento no Cliente**:
   - Ao receber o 409, o frontend captura o erro, não trava a tela e invalida o cache, exibindo visualmente que o horário acabou de ser preenchido por outro usuário.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Transação e Checagem Atômica ([`apps/api/src/modules/consultas/casosDeUso/criarConsulta.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/consultas/casosDeUso/criarConsulta.ts))**:
  - Utilização de transação interativa Prisma (`prisma.$transaction`) ou lock serializado de verificação:
  ```ts
  await prisma.$transaction(async (tx) => {
    const marcadas = await tx.consulta.findMany({
      where: { profissionalId, data, status: 'agendada' },
    })

    if (temConflito(marcadas, { hora, tipo })) {
      throw new ConflitoHorarioError('Esse horário já está ocupado')
    }

    return tx.consulta.create({
      data: { profissionalId, pacienteId, data, hora, inicio, fim, tipo, status: 'agendada' },
    })
  })
  ```
- **Mapeamento de Erro HTTP**:
  - O controller captura `ConflitoHorarioError` e devolve status `409` imediato.

### Front-end (`apps/web`)
- **Tratamento de Mutação TanStack Query**:
  - Ao identificar erro com status `409`, exibe `<Alert variant="danger">Esse horário já está ocupado. Por favor, selecione outro horário.</Alert>`.
  - Dispara `queryClient.invalidateQueries({ queryKey: ['agenda', profissionalId, data] })` para atualizar instantaneamente os horários disponíveis.

---

## 4. Checklist de Verificação

### Back-end
- [x] Operação de reserva de horário encapsulada em transação atômica.
- [x] Detecção de conflitos executada dentro do isolamento transacional.
- [x] Retorno estrito de `HTTP 409 Conflict` na ocorrência de colisão.
- [x] Testes de concorrência com requisições paralelas simultâneas (`Promise.all`) garantindo apenas 1 sucesso e os demais com 409.
- [x] Testes de performance sob carga em [`apps/api/test/performance.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/performance.test.ts).

### Front-end
- [x] Interceptação limpa de respostas HTTP 409 sem falhas não tratadas no console.
- [x] Exibição de alerta acessível com sugestão de escolha de outro slot.
- [x] Invalidação automática dos dados de agenda para desabilitar o horário recém-ocupado.
