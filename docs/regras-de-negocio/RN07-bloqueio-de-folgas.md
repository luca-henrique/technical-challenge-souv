# RN07: Bloqueio de Folgas do Profissional

## 1. Descrição da Regra

> **Regra Oficial**: *"O profissional vê a própria agenda e bloqueia dias de folga. Bloquear uma folga não mexe nas consultas já marcadas naquele dia."*

- **Autonomia do Médico**: Apenas o próprio profissional pode solicitar o bloqueio de folga em uma data para si.
- **Preservação de Consultas Preexistentes**: Quando um dia é marcado como folga, consultas previamente agendadas **não são canceladas nem apagadas**. Elas continuam existindo e visíveis.
- **Bloqueio de Novos Agendamentos**: Nenhum novo agendamento pode ser realizado para aquele profissional na data bloqueada.

---

## 2. Impacto e Casos de Borda

1. **Tentativa de agendamento em dia de folga**:
   - Tanto o paciente quanto a recepção devem ser impedidos de marcar novas consultas naquela data, recebendo `409 Conflict` com a mensagem `"O profissional está de folga nesse dia"`.
2. **Exibição na Agenda**:
   - A agenda do dia deve conter um aviso/alerta proeminente indicando que o profissional está de folga naquele dia, sem ocultar a lista de consultas que porventura já haviam sido marcadas anteriormente.
3. **Indicador de Folga no Seletor**:
   - O seletor de profissionais da recepção e do paciente deve sinalizar visualmente que o profissional está de folga na data pesquisada (`(Folga)`).

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Tabela `Folga` no Prisma ([`schema.prisma`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/prisma/schema.prisma))**:
  - Chave única composta: `@@unique([profissionalId, data])`.
- **Endpoint `POST /profissionais/:id/folgas`**:
  - Protegido com `permitir('profissional')`.
  - Garante que `req.usuario.id === profissionalId`.
  - Executa `prisma.folga.create({ data: { profissionalId, data } })` (sem alterar tabela `Consulta`).
- **Validação ao Agendar (`POST /consultas`)**:
  ```ts
  const folga = await prisma.folga.findUnique({
    where: { profissionalId_data: { profissionalId, data } }
  })
  if (folga) {
    res.status(409).json({ erro: 'O profissional está de folga nesse dia' })
    return
  }
  ```
- **Identificação no `GET /profissionais?data=YYYY-MM-DD`**:
  - Realiza `include: { folgas: { where: { data } } }`.
  - Retorna `folga: true/false` em cada profissional da lista.

### Front-end (`apps/web`)
- **Agenda do Dia ([`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx))**:
  - Exibe alerta contextual caso `agenda.folga` seja verdadeiro:
    ```tsx
    {agenda.folga && (
      <Alert variante="aviso">Dia bloqueado como folga do profissional.</Alert>
    )}
    ```
- **Seletor de Profissionais ([`SeletorProfissional`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorProfissional/seletorProfissional.tsx))**:
  - Exibe label com sufixo `(Folga)` nas opções do select.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoint `POST /profissionais/:id/folgas` restrito ao próprio profissional.
- [x] Tentativa de registrar folga duplicada tratada com retorno amigável (`409 Conflict`).
- [x] Consultas existentes mantidas inalteradas no banco após o bloqueio de folga.
- [x] Tentativa de novo agendamento em dia de folga rejeitada com `409 Conflict`.
- [x] Rota `/profissionais` com query param `data` retornando flag `folga: true`.
- [x] Rota `/profissionais/:id/horarios` retornando lista vazia de horários em dias de folga.

### Front-end
- [x] Sinalização de folga no dropdown de seleção de profissionais.
- [x] Alerta em destaque no topo da agenda do dia quando `agenda.folga === true`.
- [x] Lista de consultas já marcadas renderizada normalmente mesmo em dias bloqueados.
- [x] Bloqueio ou feedback de erro ao tentar marcar consulta em dia de folga.
