# Mapeamento e Diagnóstico de Bugs da Clínica

Este diretório contém a documentação técnica aprofundada de todos os problemas relatados pela equipe da Clínica Bem Viver (conforme descrito no [README.md principal](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/README.md#L127-L143)).

---

## 1. Matriz Consolidada de Problemas e Soluções

| ID | Relato Oficial da Clínica | Causa Raiz Identificada | Regra Relacionada | Teste de Regressão Dedicado | Status | Análise |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **BUG-01** | *“Uma paciente disse que na tela dela a consulta aparece na quarta. Na agenda da recepção, a mesma consulta aparece na terça.”* | Conversão de data em fuso horário local retrocedendo 3 horas (bug D-1 em fusos UTC-3). | [RN02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md) | [`bug-01-discrepancia-fuso.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/bugs/bug-01-discrepancia-fuso.test.ts) | Resolvido ✅ | [BUG-01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-01-discrepancia-data-fuso-horario.md) |
| **BUG-02** | *“Na semana passada o doutor ficou com dois pacientes no mesmo horário.”* | Verificação ingênua de igualdade de hora desconsiderando que primeira consulta dura 60min e ocupa 2 blocos de 30min. | [RN03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md) / [RN04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md) | [`bug-02-sobreposicao-duracoes.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/bugs/bug-02-sobreposicao-duracoes.test.ts) | Resolvido ✅ | [BUG-02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-02-sobreposicao-consultas-duracoes-diferentes.md) |
| **BUG-03** | *“Quando alguém cancela, ninguém mais consegue marcar naquele horário.”* | Query de busca de consultas ocupadas considerava registros com `status = 'cancelada'`, bloqueando o slot indevidamente. | [RN05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md) | [`bug-03-slot-cancelamento.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/bugs/bug-03-slot-cancelamento.test.ts) | Resolvido ✅ | [BUG-03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-03-slot-bloqueado-apos-cancelamento.md) |
| **BUG-04** | *“Às vezes troco de profissional na agenda e continua aparecendo a agenda do anterior.”* | Estado compartilhado em `useEffect`/`useState` sem invalidação ou chaveamento composto por profissional e data. | [RN06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md) | [`bug-04-cache-troca-profissional.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/bugs/bug-04-cache-troca-profissional.test.tsx) | Resolvido ✅ | [BUG-04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-04-cache-troca-profissional-agenda.md) |
| **BUG-05** | *“Um paciente novo disse que a tela de consultas dele fica só carregando.”* | Verificação `consultas.length === 0` confundia lista vazia de consultas com o estado de carregamento em voo. | [RN06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md) | [`bug-05-carregamento-infinito.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/bugs/bug-05-carregamento-infinito.test.tsx) | Resolvido ✅ | [BUG-05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-05-carregamento-infinito-paciente-sem-consultas.md) |
| **BUG-06** | *“Aconteceu uma vez de duas pessoas marcarem o mesmo horário. Não conseguimos reproduzir.”* | Condição de corrida (*race condition*) entre requisições paralelas concorrentes lendo e gravando antes do commit. | [RN04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md) | [`bug-06-condicao-de-corrida.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/bugs/bug-06-condicao-de-corrida.test.ts) | Resolvido ✅ | [BUG-06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-06-condicao-de-corrida-agendamento-simultaneo.md) |

---

## 2. Pedidos Operacionais e Situações em Aberto

Além dos 6 bugs técnicos corrigidos, a clínica levantou 4 situações operacionais e pedidos em aberto. O posicionamento oficial de arquitetura, fundamentação técnica e conformidade com as regras de negócio estão detalhados em:

📄 **[SITUACOES-EM-ABERTO.md](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/SITUACOES-EM-ABERTO.md)**

1. **Cancelamentos de última hora sem penalidade** ([RN05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md))
2. **Vedação absoluta a encaixes de urgência** ([RN04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md))
3. **Preservação de consultas preexistentes em dias de folga** ([RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md))
4. **Registro histórico de faltas sem punições automáticas** ([RN08](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md))

---

## 3. Cobertura de Testes Automatizados

Cada bug documentado possui testes unitários e de integração correspondentes nos pacotes [`apps/api`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api) e [`apps/web`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web), assegurando prevenção contínua contra regressões no pipeline de testes.
