# Melhorias na Agenda do Dia: TanStack Query + React Hook Form + Zod e Correção de Fuso Horário

Este documento descreve as melhorias arquiteturais e correções implementadas no componente [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx), detalhando a resolução do bug de fuso horário (`timeZone: "UTC"`), a integração com a camada tipada de serviços e a modernização com **TanStack Query**, **React Hook Form** e **Zod**.

---

## 1. Contexto e Motivação

Anteriormente, o componente [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx) e seu formulário de agendamento embutido apresentavam diversos problemas estruturais e de experiência do usuário:

- **Controle manual de re-fetch (`setAtualizacao`)**: A atualização da lista de consultas dependia de um contador numérico (`atualizacao`), incrementado manualmente por callbacks passados entre componentes (`onMarcada`), gerando acoplamento excessivo e código propenso a falhas de sincronia.
- **Chamadas diretas à API espalhadas no componente**: Uso de chamadas diretas com a função utilitária `api()`, sem centralização de contratos, tipagem ou reutilização.
- **Formulário com múltiplos `useState` e sem validação client-side**: Campos do formulário manipulados manualmente com `useState` e `Select` sem validação rica de regras de negócio antes do envio para a API.
- **Bug de Fuso Horário no Título da Agenda**: A data da agenda (`YYYY-MM-DD`) era formatada sem especificação de timezone, causando exibição de um dia a menos para usuários no fuso horário brasileiro (UTC-3).

---

## 2. Correção do Bug de Fuso Horário (`timeZone: "UTC"`)

### O Problema
A propriedade `agenda.data` é retornada pelo backend como uma string de data sem horário, no formato ISO padrão: `"2026-10-15"`.

Na especificação do ECMAScript, strings de data no formato `"YYYY-MM-DD"` quando passadas para `new Date("2026-10-15")` são interpretadas estritamente como **UTC meia-noite** (`2026-10-15T00:00:00.000Z`).

Quando o navegador executava:
```tsx
// ANTES (com bug de fuso)
new Date(agenda.data).toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
})
```
No Brasil (fuso `America/Recife` ou `America/Sao_Paulo`, com deslocamento UTC-3), o objeto de data UTC `2026-10-15T00:00:00.000Z` era convertido para o fuso local:
`2026-10-14 21:00:00 GMT-0300` (9 horas da noite do dia anterior).

**Resultado**:
O usuário selecionava dia **15/10 (quinta-feira)** no seletor de data, mas o título da agenda exibia **"quarta-feira, 14/10"**, induzindo o recepcionista a erros críticos de agendamento.

### A Solução
Adicionou-se explicitamente `timeZone: "UTC"` nas opções de formatação do `toLocaleDateString`:

```tsx
// DEPOIS (corrigido)
new Date(agenda.data).toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
})
```

Com essa diretiva, a formatação preserva o dia civil original (`15/10, quinta-feira`) independente do fuso horário da máquina do cliente.

---

## 3. Principais Melhorias Implementadas

### 3.1 Camada de Serviços Centralizada (`apps/web/src/services`)
Todas as chamadas HTTP foram migradas para módulos dedicados e fortemente tipados:

- **`profissionaisService.buscarAgenda(profissionalId, data)`**: Busca a agenda completa do profissional no dia informado.
- **`consultasService.cancelarConsulta(consultaId)`**: Cancela uma consulta agendada.
- **`consultasService.registrarFalta(consultaId)`**: Registra falta do paciente para consultas cujo horário já passou.
- **`consultasService.agendarConsulta(dados)`**: Realiza o agendamento de uma nova consulta.
- **`pacientesService.listarPacientes()`**: Obtém a lista de pacientes cadastrados.

### 3.2 Gerenciamento de Estado com TanStack Query
Criou-se o hook especializado [`useAgenda`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgenda.ts):

- **Cache Chaveado Declarativo**: Query registrada sob a chave `['agenda', profissionalId, data]`.
- **Invalidação Automática de Cache**: Ao executar com sucesso as mutations de agendamento, cancelamento ou registro de falta, o TanStack Query invalida a chave `['agenda', profissionalId, data]`, disparando a sincronização automática da interface sem necessidade de variáveis de controle como `atualizacao` ou `setAtualizacao(n => n + 1)`.
- **Estados de Carregamento Reativos**: Controle nativo de flags como `agendando`, `cancelando` e `registrandoFalta`, permitindo desabilitar botões e fornecer feedback imediato de loading durante as ações.

### 3.3 Formulário Moderno com React Hook Form + Zod
- **Schema de Validação Declarativo ([schema.ts](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/schema.ts))**:
  ```ts
  export const agendarConsultaSchema = z.object({
    pacienteId: z.string().min(1, 'Selecione um paciente'),
    tipo: z.enum(['primeira', 'retorno']),
    hora: z.string().min(1, 'Selecione um horário'),
  })

  export type DadosAgendarConsulta = z.infer<typeof agendarConsultaSchema>
  ```
- **Inputs Desempenhados**: Utilização de `register()` evitando re-renderizações desnecessárias em cada seleção.
- **Limpeza e Reset**: Chamada a `reset()` com valores padrão após o agendamento concluído com sucesso.
- **Feedback Visual de Acessibilidade**: `aria-invalid` e mensagens de erro integradas ao componente de formulário.

---

## 4. Comparativo Antes vs Depois

| Aspecto | Antes | Depois |
| :--- | :--- | :--- |
| **Formatação de Data** | Sem timezone (exibia D-1 em fusos negativos como UTC-3) | `timeZone: "UTC"` (exibe a data exata do backend) |
| **Busca de Dados** | `useEffect` + `api()` manual | `useAgenda` com TanStack Query (`useQuery`) |
| **Sincronização de Cache** | Contador manual `atualizacao` via `useState` | Invalidação automática (`queryClient.invalidateQueries`) |
| **Ações (Cancelar/Falta)** | `executar()` manual com `try/catch` imperativo | Mutations tipadas com controle `isPending` |
| **Formulário de Agendamento** | `useState` individual por campo | `useForm` + `zodResolver` com validação de schema |
| **Lista de Pacientes** | `useEffect` local com busca manual | Hook `usePacientes` compartilhado com cache |
| **Tratamento de Erros** | Mensagens de texto soltas | Mensagens estruturadas com componentes de `Alert` e campos com `erro` |

---

## 5. Arquitetura de Arquivos Criados e Modificados

```text
apps/web/
├── src/
│   ├── hooks/
│   │   ├── useAgenda.ts                               # Hook de consulta e mutations da agenda
│   │   └── usePacientes.ts                            # Hook de consulta em cache para pacientes
│   ├── services/
│   │   ├── profissionais/profissionaisService.ts      # Endpoint /profissionais/:id/agenda
│   │   ├── consultas/consultasService.ts              # Endpoints de agendar, cancelar e falta
│   │   └── pacientes/pacientesService.ts              # Endpoint /pacientes
│   └── components/organisms/
│       ├── AgendaDoDia/
│       │   ├── schema.ts                              # Schema Zod e tipo DadosAgendarConsulta
│       │   ├── types.ts                               # AgendaDoDiaProps
│       │   └── agendaDoDia.tsx                        # Componente principal refatorado
│       └── MarcarConsulta/
│           ├── schema.ts                              # Re-export do schema de marcação
│           └── marcarConsulta.tsx                     # Organismo de marcação compatível
└── test/
    └── agendaDoDia.test.tsx                           # Teste automatizado de renderização e ações
```

---

## 6. Cobertura de Testes Automatizados

O comportamento do componente é coberto pelo teste de integração [agendaDoDia.test.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendaDoDia.test.tsx), que valida:
1. Renderização correta do estado de carregamento inicial ("Carregando agenda...").
2. Exibição da lista de consultas e pacientes carregados via Query.
3. Execução de mutação de cancelamento com atualização reativa da lista.
4. Presença e integração do formulário de agendamento de consultas.
