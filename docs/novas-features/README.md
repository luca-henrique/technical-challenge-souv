# Planejamento e Priorização das Novas Funcionalidades

Este documento estabelece o ranking estratégico e técnico de todas as 10 funcionalidades solicitadas para a **Clínica Bem Viver** ([Seção 6 do README.md](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/README.md#L149-L162)), acompanhado da justificativa detalhada para cada posição e da especificação técnica completa de cada proposta.

---

## 1. Metodologia de Priorização: Matriz RICE

Para definir a ordem das funcionalidades de forma objetiva e orientada ao valor do negócio, utilizamos o framework **RICE**:
- **Reach (Alcance)**: Quantos pacientes, médicos ou recepcionistas são impactados diretamente por período (escala 1 a 10).
- **Impact (Impacto)**: O quanto a funcionalidade resolve dores críticas (receita, redução de no-show, experiência do usuário) (3 = massivo, 2 = alto, 1 = médio, 0.5 = baixo).
- **Confidence (Confiança)**: Certeza técnica sobre a eficácia da solução e clareza dos requisitos (100% = alta, 80% = média, 50% = baixa).
- **Effort (Esforço)**: Quantidade estimada de tempo e complexidade de engenharia (em semanas/dias-pessoa) (escala 1 a 5, onde 1 é muito rápido e 5 é muito complexo).

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

---

## 2. Matriz Consolidada de Priorização

| Posição | Funcionalidade | R (Alcance) | I (Impacto) | C (Confiança) | E (Esforço) | RICE Score | Status / Recomendação | Especificação Técnica |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1º** | **Lembrete automático da consulta (24h antes com n8n)** | 10 | 3.0 | 100% | 1.5 | **20.0** | **Selecionada para Implementação (Bônus)** | [FEAT-01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-01-lembrete-automatico-consultas-n8n.md) |
| **2º** | **Confirmação de presença pelo paciente** | 10 | 3.0 | 90% | 1.8 | **15.0** | **Selecionada para Implementação** | [FEAT-02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-02-confirmacao-presenca-paciente.md) |
| **3º** | **Remarcação pelo próprio paciente** | 8 | 2.5 | 90% | 2.0 | **9.0** | Próxima fase (Alta Prioridade) | [FEAT-03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-03-remarcacao-pelo-paciente.md) |
| **4º** | **Lista de espera para horários liberados** | 7 | 2.5 | 80% | 2.5 | **5.6** | Próxima fase (Alta Prioridade) | [FEAT-04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-04-lista-de-espera-horarios-liberados.md) |
| **5º** | **Bloqueio de agenda por período (férias)** | 6 | 2.0 | 95% | 1.5 | **7.6** | Próxima fase (Média Prioridade) | [FEAT-05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-05-bloqueio-agenda-por-periodo.md) |
| **6º** | **Relatório de faltas** | 5 | 2.0 | 100% | 1.5 | **6.7** | Próxima fase (Média Prioridade) | [FEAT-06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-06-relatorio-de-faltas.md) |
| **7º** | **Histórico de consultas do paciente** | 8 | 1.5 | 100% | 1.2 | **10.0** | Próxima fase (Média Prioridade) | [FEAT-07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-07-historico-consultas-paciente.md) |
| **8º** | **Busca de profissionais por especialidade** | 7 | 1.5 | 100% | 1.0 | **10.5** | Melhoria contínua | [FEAT-08](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-08-busca-profissionais-especialidade.md) |
| **9º** | **Exportação da agenda do dia em PDF** | 4 | 1.0 | 100% | 1.5 | **2.7** | Utilitário operacional | [FEAT-09](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-09-exportacao-agenda-pdf.md) |
| **10º** | **Tema escuro na área do paciente** | 6 | 0.5 | 90% | 2.0 | **1.4** | Baixa prioridade clínica | [FEAT-10](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-10-tema-escuro-area-paciente.md) |

---

## 3. Justificativa Estratégica Posição por Posição

### 1º Lugar — Lembrete automático da consulta (24h antes com n8n)
- **Por que é o 1º**: Ataca a maior dor financeira e operacional da clínica: o absenteísmo (*no-show*). Um paciente que esquece a consulta causa tempo ocioso irrecuperável do médico e perda direta de faturamento.
- **Sinergia técnica**: A rota segura `GET /integracoes/lembretes` já existe na API, o Docker Compose já provê o Mailpit (`localhost:8025`) e o n8n (`localhost:5678`), tornando o esforço de entrega extremamente enxuto e de altíssimo valor (bônus oficial).

### 2º Lugar — Confirmação de presença pelo paciente
- **Por que é o 2º**: Forma o par perfeito com o lembrete de 24 horas. Ao receber a notificação, o paciente confirma ativamente com um clique se comparecerá ou se precisa desmarcar.
- **Impacto no negócio**: Permite à recepção antecipar ausências com 24h de margem, liberando a vaga para outro paciente ou encaixando a fila de espera antes que o horário seja perdido.

### 3º Lugar — Remarcação pelo próprio paciente
- **Por que é o 3º**: Hoje, para trocar de horário, o paciente precisa cancelar a consulta existente e agendar outra do zero (ou ligar para a recepção).
- **Impacto no negócio**: O autoatendimento de remarcação reduz drasticamente o cancelamento definitivo e o custo de atendimento telefônico no balcão da clínica.

### 4º Lugar — Lista de espera para horários liberados
- **Por que é o 4º**: Conecta-se diretamente ao [BUG-03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-03-slot-bloqueado-apos-cancelamento.md) e à [RN05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md). Quando um paciente desiste em cima da hora, a clínica precisa reocupar o horário em minutos, antes do início do atendimento.
- **Impacto no negócio**: Maximiza a taxa de ocupação da grade médica sem sobrecarregar recepcionistas ligando manualmente para listas de papel.

### 5º Lugar — Bloqueio de agenda por período (férias, congressos)
- **Por que é o 5º**: Evolução natural da [RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md). Médicos frequentemente se ausentam por semanas consecutivas (férias, recessos). Bloquear dia a dia manualmente é propenso a erros e gera fadiga operacional.
- **Impacto no negócio**: Previne novos agendamentos em períodos inteiros e protege a agenda com validação prévia de conflitos.

### 6º Lugar — Relatório de faltas
- **Por que é o 6º**: Fornece inteligência de gestão sobre a [RN08](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md). Responde à dor da clínica (*“Tem paciente que falta toda semana. Queremos fazer alguma coisa”*).
- **Impacto no negócio**: Identifica reincidentes, especialidades com maior índice de falta e embasa decisões de confirmação prioritária sem aplicar penalidades cegas.

### 7º Lugar — Histórico de consultas do paciente
- **Por que é o 7º**: Atualmente, a tela `/paciente` exibe apenas consultas de hoje em diante (`data >= hojeEmRecife()`). Pacientes e médicos não conseguem ver histórico passado de retornos ou faltas.
- **Impacto no negócio**: Fortalece a continuidade do tratamento médico e dá transparência ao paciente.

### 8º Lugar — Busca de profissionais por especialidade
- **Por que é o 8º**: Conforme a clínica expande seu corpo clínico com múltiplos cardiologistas, dermatologistas e pediatras, a seleção simples por nome no dropdown torna-se lenta.
- **Impacto no negócio**: Melhora a usabilidade de agendamento online e filtros da recepção.

### 9º Lugar — Exportação da agenda do dia em PDF
- **Por que é o 9º**: Utilitário operacional para o balcão da recepção e consultórios imprimirem a lista de chamada do dia ou manterem backup físico em caso de contingência de rede.
- **Impacto no negócio**: Redundância operacional, embora a operação primária já seja 100% digital e reativa.

### 10º Lugar — Tema escuro na área do paciente
- **Por que é o 10º**: Trata-se de um recurso de conveniência visual e preferência estética.
- **Impacto no negócio**: Não afeta a receita da clínica, não reduz no-shows, não otimiza a agenda médica nem resolve gargalos da recepção. Deve ser tratado como polimento após a consolidação das ferramentas de negócio.

---

## 4. As Duas Funcionalidades Selecionadas para Entrega

Em total conformidade com o desafio (*"implemente duas delas, com bônus de n8n"*), selecionamos:
1. **Lembrete automático com n8n (Bônus de Engenharia)** ([FEAT-01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-01-lembrete-automatico-consultas-n8n.md)): fluxo n8n automatizado consumindo `GET /integracoes/lembretes` e disparando e-mails via SMTP do Mailpit.
2. **Confirmação de presença pelo paciente** ([FEAT-02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-02-confirmacao-presenca-paciente.md)): rota segura na API para registrar confirmação de presença (`POST /consultas/:id/confirmar`) e feedback visual em tempo real na tela do paciente e na agenda da recepção.
