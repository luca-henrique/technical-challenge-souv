# BUG-05: Carregamento Infinito para Pacientes Novos sem Consultas

## 1. Relato da Clínica

> *“Um paciente novo disse que a tela de consultas dele fica só carregando.”*

- **Severidade**: Alta
- **Impacto no Negócio**: Primeiros pacientes cadastrados ou pacientes sem consultas ativas acreditando que o sistema travou, abandono do autoatendimento online e sobrecarga de ligações telefônicas para a recepção.
- **Regras de Negócio Associadas**:
  - [RN06 - Perfis de Usuário e Controle de Acesso (RBAC)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md)

---

## 2. Causa Raiz Técnica

Na versão inicial da tela de consultas do paciente, a lógica de renderização continha um conflito entre o estado de carregamento assíncrono e o estado vazio (*empty state*):

```tsx
// Código com bug: tratava lista vazia como carregamento em andamento
if (!consultas || consultas.length === 0) {
  return <p>Carregando consultas...</p>
}
```

### O Comportamento Anômalo
1. Um paciente recém-cadastrado na clínica acessava a rota `/paciente`.
2. A API respondia rapidamente com `200 OK` e um array vazio `[]` (pois ele ainda não possuía consultas agendadas).
3. A condição `consultas.length === 0` avaliava como verdadeira.
4. O componente renderizava `<p>Carregando consultas...</p>` indefinidamente, sem nunca sair desse estado, pois nenhuma nova consulta chegaria para alterar o tamanho da lista.

---

## 3. Solução Implementada

### 3.1. Segregação Entre Flag `carregando` e Estado Vazio
No componente [`MinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx#L32-L56), a condição de carregamento foi vinculada estritamente ao status `isLoading` retornado pelo TanStack Query:

```tsx
export default function MinhasConsultas() {
  const { consultas, carregando, erro } = useMinhasConsultas()

  // 1. Estado de carregamento: exibe skeleton enquanto a requisição HTTP está em voo
  if (carregando) {
    return <MinhasConsultasSkeleton />
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Minhas consultas</h1>
        <LinkButton href="/paciente/agendar">Marcar consulta</LinkButton>
      </div>

      {/* 2. Estado vazio: exibição contextual com orientação para agendamento */}
      {consultas.length === 0 ? (
        <p className="text-sm text-gray-500">
          Você não possui consultas agendadas no momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {consultas.map((consulta) => (
            <li key={consulta.id}>
              <CartaoConsulta consulta={consulta} onCancelar={cancelar} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 3.2. Benefícios da Experiência do Usuário
- Pacientes sem consultas veem uma mensagem amigável e acolhedora orientando-os a marcar a primeira consulta.
- Usuários em redes lentas visualizam o [`MinhasConsultasSkeleton`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultasSkeleton/minhasConsultasSkeleton.tsx), melhorando a métrica de Largest Contentful Paint (LCP) e a percepção de performance.

---

## 4. Testes Automatizados de Validação

- **Front-end**: [`apps/web/test/minhasConsultas.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/minhasConsultas.test.tsx)
  - `exibe aviso amigável quando o paciente não tem consultas agendadas`: valida que quando a API devolve `[]`, a tela exibe imediatamente `"Você não possui consultas agendadas no momento."` e o botão `"Marcar consulta"`.
