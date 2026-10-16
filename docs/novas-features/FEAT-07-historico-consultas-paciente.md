# FEAT-07: Histórico de Consultas do Paciente

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 7º Lugar (RICE Score: 10.0)
- **Status**: Média Prioridade
- **Objetivo**: Permitir que o paciente e os profissionais visualizem todo o histórico cronológico de consultas passadas (realizadas, faltadas ou canceladas) com filtros e paginação.

Atualmente, o endpoint `GET /consultas/minhas` filtra exclusivamente `data: { gte: hojeEmRecife() }`. O paciente só enxerga consultas futuras. Consultas concluídas desaparecem da tela, impedindo que o paciente consulte o nome do médico que o atendeu no mês anterior ou saiba quando fez seu último retorno.

---

## 2. Requisitos Funcionais

1. **Abas de Navegação no Painel do Paciente**:
   - Aba **"Próximas consultas"**: Consultas futuras agendadas (`data >= hojeEmRecife()`).
   - Aba **"Histórico"**: Consultas passadas (`data < hojeEmRecife()` ou com status `'realizada'`, `'faltou'`, `'cancelada'`).
2. **Visualização Detalhada do Registro**:
   - Cada card do histórico exibe: profissional, especialidade, data, horário, tipo (`primeira` ou `retorno`) e o desfecho (`Realizada`, `Faltou`, `Cancelada`).
3. **Visão pelo Profissional**:
   - Ao atender um paciente, o médico pode visualizar seu histórico completo na clínica, melhorando o acompanhamento clínico.

---

## 3. Especificação Técnica

### 3.1. Endpoint da API
- `GET /consultas/minhas?historico=true`:
  - Se `historico=true`, altera a cláusula do Prisma para:
    ```ts
    where: {
      pacienteId: req.usuario.id,
      OR: [
        { data: { lt: hojeEmRecife() } },
        { status: { in: ['realizada', 'faltou', 'cancelada'] } }
      ]
    }
    ```
  - Ordenação decrescente: `orderBy: { inicio: 'desc' }`.

### 3.2. Front-end
- Componente de Tabs (`Abas`) no topo da página `/paciente`.
