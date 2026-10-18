# RN13: Relatório de Faltas e Métricas de Absenteísmo

## 1. Descrição da Regra

> **Regra Oficial**: *"A recepção tem acesso a um relatório analítico consolidado de faltas e absenteísmo, permitindo filtrar por intervalo de datas e profissional. O relatório lista indicadores gerais, taxas de evasão por especialidade e ranking paginado de pacientes reincidentes, sem nunca aplicar punições automáticas."*

- **Perfil de Acesso**: Exclusivo para o perfil `recepcao`. Pacientes e profissionais médicos não têm acesso aos relatórios consolidados (HTTP 403 Forbidden).
- **Parâmetros de Consulta**:
  - `dataInicio` e `dataFim` (`AAAA-MM-DD`): Período analisado.
  - `profissionalId` (opcional): Filtro opcional por médico específico.
  - `pagina` e `limite`: Parâmetros de paginação para a lista de pacientes reincidentes.
- **Métricas e Agregações Calculadas**:
  1. `totalConsultas`: Volume total de agendamentos no período.
  2. `totalFaltas`: Volume de consultas com `status = 'faltou'`.
  3. `taxaAbsenteismo`: Percentual consolidado $(\frac{\text{totalFaltas}}{\text{totalConsultas}} \times 100)$.
  4. `porEspecialidade`: Distribuição do absenteísmo discriminada por especialidade médica.
  5. `reincidentes`: Pacientes com 2 ou mais faltas registradas, ordenados por volume decrescente de faltas.
- **Diretriz de Não Punição (Alinhada à [RN08](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md))**: O sistema **não** impõe bloqueio de novas consultas, suspensão de cadastro ou multas financeiras para pacientes reincidentes. O objetivo é puramente gerencial e preventivo.
- **Performance e Cache**: Queries agregadas utilizam cache no Redis com TTL de 60 segundos chaveado pelos parâmetros de busca.

---

## 2. Impacto e Casos de Borda

1. **Gestão Preventiva**: Dá clareza à diretoria sobre quais especialidades sofrem maior taxa de no-show, permitindo ajustar a estratégia de confirmações ativas.
2. **Período sem Faltas**: Caso não haja nenhuma falta no período, a taxa é computada com segurança como 0% sem divisão por zero.
3. **Alto Volume de Pacientes**: A lista de pacientes reincidentes é estritamente paginada para evitar estouro de memória e latência excessiva de rede.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rota HTTP ([`apps/api/src/modules/relatorios/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/relatorios/routes.ts))**:
  - `GET /relatorios/faltas` protegido por `permitir('recepcao')`.
- **Validação de Query com Zod**:
  ```ts
  export const schemaFiltroFaltas = z.object({
    dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    profissionalId: z.string().uuid().optional(),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().positive().max(100).default(10),
  })
  ```
- **Caso de Uso (`gerarRelatorioFaltas`)**:
  - Verifica cache Redis `cache:relatorios:faltas:${chave}`.
  - Executa agregações no Prisma e monta a resposta com metadados de paginação:
    ```json
    {
      "metricas": {
        "totalConsultas": 120,
        "totalFaltas": 18,
        "taxaAbsenteismo": 15.0
      },
      "porEspecialidade": [...],
      "reincidentes": [...],
      "paginacao": { "pagina": 1, "limite": 10, "totalItens": 5, "totalPaginas": 1 }
    }
    ```

### Front-end (`apps/web`)
- **Arquitetura FSD e Componentes**:
  - Molécula [`ReportFilterBar`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/absence-report/ui/report-filter-bar.tsx): Filtros de data e médico com validação Zod.
  - Molécula [`ReportMetricsGrid`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/absence-report/ui/report-metrics-grid.tsx): Cards de indicadores com badge de severidade da taxa.
  - Molécula [`RepeatOffendersTable`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/absence-report/ui/repeat-offenders-table.tsx): Tabela acessível com controles de paginação.
  - Organismo [`AbsenceReportBoard`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/absence-report/ui/absence-report-board.tsx).

---

## 4. Checklist de Verificação

### Back-end
- [x] Rota restrita ao perfil `recepcao` com bloqueio para `paciente` e `profissional`.
- [x] Filtros flexíveis por período e profissional com validação Zod.
- [x] Cálculo preciso de métricas e proteção contra divisão por zero.
- [x] Paginação obrigatória de reincidentes com metadados (`pagina`, `limite`, `totalPaginas`).
- [x] Cache no Redis com TTL de 60 segundos e cabeçalho `X-Cache`.
- [x] Ausência de qualquer mecanismo automático de punição ou bloqueio do paciente.
- [x] Testes automatizados em [`apps/api/test/features/feat-06-relatorio-faltas.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-06-relatorio-faltas.test.ts).

### Front-end
- [x] Tela de relatórios em `app/recepcao/relatorios/page.tsx` com acessibilidade total.
- [x] Componente de paginação acessível com navegação por teclado.
- [x] Estados de loading esqueleto e empty state para períodos sem dados.
- [x] Testes unitários com React Testing Library em [`apps/web/test/reception-features.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/reception-features.test.tsx).
