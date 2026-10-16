# BUG-01: Discrepância de Data Entre Paciente e Recepção (Bug D-1)

## 1. Relato da Clínica

> *“Uma paciente disse que na tela dela a consulta aparece na quarta. Na agenda da recepção, a mesma consulta aparece na terça.”*

- **Severidade**: Alta
- **Impacto no Negócio**: Pacientes comparecendo em dias errados à clínica, desencontro com médicos, salas de espera ociosas ou superlotadas e desgaste no atendimento ao cliente.
- **Regra de Negócio Associada**: [RN02 - Fuso Horário de Referência e Grade de 30 Minutos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md)

---

## 2. Causa Raiz Técnica

O sistema armazena a data como string simples no formato `YYYY-MM-DD` (exemplo: `"2026-10-14"`).

No front-end, a função anterior de formatação realizava:
```ts
// Código com bug
new Date(`${data}T00:00:00`) // ou new Date(data)
```

### O Problema do Offset Local
1. `new Date("2026-10-14")` ou `new Date("2026-10-14T00:00:00Z")` cria um instante em UTC correspondente à meia-noite (`00:00:00 UTC`).
2. Quando o navegador do usuário está em fusos com offset negativo (como Brasília/Recife que é UTC-3), o horário local calculado passa a ser:
   $$\text{2026-10-14 00:00 UTC} - \text{3 horas} = \text{2026-10-13 21:00 (Terça-feira)}$$
3. A tela do paciente renderizava **terça-feira, 13/10**, enquanto a recepção ou o banco registravam **quarta-feira, 14/10**. Esse retrocesso sistemático de 1 dia é o clássico bug de data **D-1**.

---

## 3. Solução Implementada

### 3.1. Normalização com `Date.UTC` e `timeZone: "UTC"`
A função [`formatarData`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/formato.ts#L6-L16) foi reescrita para decompor as partes da data (`ano`, `mês`, `dia`) e instanciar um `Date` com UTC puro, garantindo renderização idêntica em qualquer navegador:

```ts
export function formatarData(data: string) {
  const parteData = data.slice(0, 10)
  const [ano, mes, dia] = parteData.split('-').map(Number)
  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia))

  return dataUtc.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}
```

### 3.2. Padronização nos Componentes
Componentes como [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx) e [`CartaoConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx) foram unificados para consumir [`formatarData`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/formato.ts), garantindo consistência universal.

---

## 4. Testes Automatizados de Validação

- **Front-end (Regressão Dedicada)**: [`apps/web/test/bugs/bug-01-discrepancia-fuso.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/bugs/bug-01-discrepancia-fuso.test.ts)
  - `relato da clínica: consulta na quarta nunca deve retroceder para terça na recepção ou no paciente`
  - `mantém consistência para viradas de mês e início de ano em qualquer fuso horário UTC negativo`
  - `lida com timestamps ISO completos sem aplicar deslocamento de fuso local que cause D-1`
- **Front-end**: [`apps/web/test/rn02-formato-data-fuso.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn02-formato-data-fuso.test.ts)
  - `formata data mantendo exatamente o dia da semana e o dia do mês sem retrocesso (bug D-1)`: valida que `"2026-10-15"` gera `"quinta-feira, 15/10"`, `"2026-10-14"` gera `"quarta-feira, 14/10"`, e `"2026-10-16"` gera `"sexta-feira, 16/10"`.
- **Back-end**: [`apps/api/test/rn02-fuso-horario-e-grade.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn02-fuso-horario-e-grade.test.ts)
  - `gera timestamps com offset de Recife (-03:00) consistentes`: valida que `instante("2026-10-26", "09:00")` grava `2026-10-26T12:00:00.000Z` sem distorção.

---

## 5. Status da Resolução: Concluído e Validado ✅

- **Diagnóstico confirmado**: Causa raiz identificada no offset do construtor local `Date`.
- **Correção aplicada**: [`formatarData`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/formato.ts) com decomposição pura e `Date.UTC`.
- **Cobertura de testes**: 100% dos testes de regressão passando sem falhas.
