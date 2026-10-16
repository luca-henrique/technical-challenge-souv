# BUG-04: Cache Desatualizado ao Alternar Profissionais na Agenda

## 1. Relato da Clínica

> *“Às vezes troco de profissional na agenda e continua aparecendo a agenda do anterior.”*

- **Severidade**: Média
- **Impacto no Negócio**: Recepcionistas visualizando consultas do médico errado, risco de agendamentos em horários incorretos, confusão operacional no balcão e perda de confiabilidade no sistema.
- **Regras de Negócio Associadas**:
  - [RN06 - Perfis de Usuário e Controle de Acesso (RBAC)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md)
  - [RN04 - Exclusividade de Atendimento e Prevenção de Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)

---

## 2. Causa Raiz Técnica

No gerenciamento inicial de estado da recepção:
1. Os dados da agenda eram buscados via `fetch` solto dentro de um `useEffect` armazenado em um único `useState(agenda)`.
2. Se a requisição do profissional B demorasse mais tempo para responder (latência de rede), ou se houvesse race condition entre requisições assíncronas concorrentes de troca rápida no dropdown, a tela continuava exibindo o estado antigo do profissional A.
3. Não havia segregação de cache em memória nem chaveamento por identificador de profissional e data.

---

## 3. Solução Implementada

### 3.1. Chaves Compostas no TanStack Query
No hook [`useAgenda`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgenda.ts#L9-L17), a consulta foi migrada para o TanStack Query utilizando query key composta imutável `['agenda', profissionalId, data]`:

```ts
export function useAgenda(profissionalId: string, data: string) {
  const chaveAgenda = ['agenda', profissionalId, data]

  const query = useQuery<Agenda, Error>({
    queryKey: chaveAgenda,
    queryFn: () => profissionaisService.buscarAgenda(profissionalId, data),
    enabled: Boolean(profissionalId && data),
  })
  // ...
}
```

### 3.2. Benefícios Arquiteturais da Mudança
- **Isolamento de Cache**: A agenda do Dr. Roberto fica isolada em `['agenda', 'prof-1', '2026-10-26']`, enquanto a da Dra. Ana fica em `['agenda', 'prof-2', '2026-10-26']`.
- **Cancelamento de Race Conditions**: O TanStack Query descarta automaticamente respostas desatualizadas de requisições que perderam relevância quando a chave muda.
- **Feedback Visual de Transição**: Quando um novo profissional é selecionado, a tela indica o carregamento e não renderiza dados de outro médico.

---

## 4. Testes Automatizados de Validação

- **Front-end**: [`apps/web/test/recepcao.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/recepcao.test.tsx)
  - `carrega a lista de profissionais e exibe a agenda do primeiro profissional`
- **Front-end**: [`apps/web/test/agendaDoDia.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendaDoDia.test.tsx)
  - Valida o isolamento das consultas e reactividade da agenda por profissional e data.
