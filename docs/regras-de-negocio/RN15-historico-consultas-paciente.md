# RN15: Histórico de Consultas e Linha do Tempo

## 1. Descrição da Regra

> **Regra Oficial**: *"O paciente, a recepção e o médico têm acesso ao histórico completo de atendimentos passados do paciente, separando claramente as consultas ativas futuras dos atendimentos concluídos, cancelados ou com falta."*

- **Segregação Temporal**:
  - **Consultas Ativas**: Consultas futuras com `status = 'agendada'`.
  - **Consultas Históricas**: Consultas cujo horário já passou ou cujo status seja `realizada`, `faltou` ou `cancelada`.
- **Controle de Acesso RBAC**:
  - O perfil `paciente` pode visualizar **exclusivamente** o seu próprio histórico (validação `pacienteId === usuario.id`).
  - Os perfis `recepcao` e `profissional` podem consultar o histórico de qualquer paciente para suporte clínico e administrativo.
- **Ordenação dos Dados**: As consultas históricas são listadas em ordem cronológica decrescente (da mais recente para a mais antiga), facilitando a visualização do último atendimento.

---

## 2. Impacto e Casos de Borda

1. **Acompanhamento Terapêutico**: O médico e o paciente conseguem verificar a regularidade de retornos e exames anteriores.
2. **Tentativa de Acesso Indevido**: Paciente tentando acessar histórico de outro ID de paciente é bloqueado com HTTP 403 Forbidden.
3. **Paciente Sem Consultas Anteriores**: Retorno de lista vazia estruturada com código 200 e exibição de empty state amigável na UI, evitando erros de carregamento infinito.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rotas HTTP**:
  - `GET /pacientes/:id/consultas` protegido por `permitir('recepcao', 'profissional')` com checagem de propriedade se acessado por paciente.
  - `GET /consultas/minhas?incluirPassadas=true` para uso do próprio paciente autenticado.
- **Query Prisma**:
  ```ts
  const consultas = await prisma.consulta.findMany({
    where: { pacienteId: id },
    orderBy: [{ data: 'desc' }, { hora: 'desc' }],
    include: {
      profissional: {
        include: { usuario: { select: { nome: true } } },
      },
    },
  })
  ```

### Front-end (`apps/web`)
- **Visualização FSD**:
  - Seção segregada de "Consultas Anteriores" no painel do paciente.
  - Badges semânticos de status do Design System:
    - Verde: `Realizada`
    - Vermelho: `Faltou`
    - Cinza/Neutro: `Cancelada`
  - Empty state contextualizado para novos pacientes.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoints para listagem de histórico com RBAC restrito e validação de titularidade.
- [x] Ordenação cronológica decrescente (`data desc`, `hora desc`).
- [x] Suporte à filtragem entre consultas ativas e histórico pregressado.
- [x] Testes automatizados em [`apps/api/test/features/feat-07-historico-consultas.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-07-historico-consultas.test.ts).

### Front-end
- [x] Interface com distinção clara entre agendamentos futuros e histórico passado.
- [x] Badges visuais indicando status final (`Realizada`, `Cancelada`, `Faltou`).
- [x] Empty state acessível com `role="status"` para pacientes sem histórico prévio.
