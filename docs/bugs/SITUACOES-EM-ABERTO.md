# Situações e Pedidos em Aberto da Clínica

Este documento analisa os pedidos operacionais e dilemas levantados pela equipe da clínica médica Bem Viver no [README.md](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/README.md#L137-L143), correlacionando-os com as regras de negócio canônicas e apresentando a fundamentação técnica e de produto para cada caso.

---

## 1. Pedido: *"Estamos perdendo dinheiro com cancelamentos no mesmo dia da consulta."*

### Contexto Relatado
A administração da clínica expressou preocupação com perdas financeiras causadas por pacientes que cancelam suas consultas poucas horas antes do atendimento agendado.

### Regra Canônica Vigente
- **[RN05 - Cancelamento de Consultas e Liberação de Horário](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md)**:
  > *"O paciente pode cancelar a qualquer momento. Cancelar muda o status e nunca apaga o registro. Não existe política de cancelamento tardio."*

### Fundamentação e Decisão de Produto
1. **Sem Penalidades**: A clínica optou por priorizar a satisfação, fidelidade e acolhimento do paciente, evitando atritos com multas ou políticas restritivas de no-show.
2. **Mitigação Técnica**:
   - A liberação imediata do slot (`status = 'cancelada'`) associada à invalidação reativa de cache faz com que o horário cancelado reapareça instantaneamente disponível na grade de agendamentos.
   - Outros pacientes que consultam a agenda no mesmo dia conseguem ocupar o horário vago imediatamente.
3. **Evolução Futura**: Caso a diretoria decida instituir cobrança de taxa de cancelamento tardio, será necessário parametrizar uma janela de tolerância (ex.: 24 horas antes) e integração com gateway de pagamento.

---

## 2. Pedido: *"A recepção precisa conseguir encaixar urgências, mesmo quando o horário já está ocupado."*

### Contexto Relatado
A recepção solicitou a funcionalidade de "encaixe", permitindo colocar dois pacientes no mesmo horário quando houver urgência.

### Regra Canônica Vigente
- **[RN04 - Exclusividade de Atendimento e Prevenção de Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)**:
  > *"Um profissional atende um paciente por vez. Não existe encaixe."*

### Fundamentação e Decisão de Produto
1. **Vedação Técnica Estrita**: O sistema bloqueia matematicamente qualquer sobreposição de horários e responde com `409 Conflict`.
2. **Qualidade do Atendimento**: Permitir encaixes degrada a experiência dos pacientes pontuais, gera atrasos generalizados no expediente e sobrecarrega os médicos.
3. **Procedimento Recomendado**: Casos de urgência devem ser alocados em horários livres do dia (inclusive slots liberados por cancelamentos) ou encaminhados para serviços hospitalares de pronto-socorro.

---

## 3. Situação: *"Um profissional vai tirar folga na sexta e já tem pacientes marcados. Não sabemos o que acontece com essas consultas."*

### Contexto Relatado
Dúvida recorrente da recepção sobre o destino de consultas agendadas antes do médico solicitar o bloqueio do dia.

### Regra Canônica Vigente
- **[RN07 - Bloqueio de Folgas do Profissional](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md)**:
  > *"O profissional vê a própria agenda e bloqueia dias de folga. Bloquear uma folga não mexe nas consultas já marcadas naquele dia."*

### Fundamentação e Decisão de Produto
1. **Preservação de Dados**: Ao registrar uma folga (`POST /profissionais/:id/folgas`), nenhuma consulta é cancelada ou apagada automaticamente.
2. **Visibilidade Operacional**: A agenda da recepção e a do médico continuam listando todas as consultas preexistentes, acompanhadas do aviso de destaque: `"Dia bloqueado como folga do profissional."`.
3. **Ação da Recepção**: Com a lista preservada, a recepcionista possui total clareza de quem são os pacientes afetados e pode entrar em contato ativo para reagendá-los para outras datas, com consentimento de cada um.

---

## 4. Pedido: *"Tem paciente que falta toda semana. Queremos fazer alguma coisa."*

### Contexto Relatado
Preocupação com pacientes reincidentes em faltas sem aviso prévio.

### Regra Canônica Vigente
- **[RN08 - Registro de Faltas e Restrições Operacionais](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md)**:
  > *"A recepção registra faltas. Não existe encaixe, política de cancelamento tardio nem tratamento de faltas recorrentes."*

### Fundamentação e Decisão de Produto
1. **Registro Histórico sem Punição**: A recepção registra a falta (`status = 'faltou'`) após o horário da consulta ter passado. Isso gera histórico audível no prontuário/relatório.
2. **Sem Bloqueio Automático**: O sistema não suspende cadastros nem impede novas marcações automaticamente.
3. **Tratamento Humanizado**: A equipe de atendimento pode utilizar os registros de falta para contato direto de acolhimento e confirmação prévia mais ativa para pacientes reincidentes.
