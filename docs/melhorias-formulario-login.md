# Melhorias no Formulário de Login: TanStack Query + React Hook Form + Zod

Este documento descreve as melhorias implementadas no componente `FormularioLogin`, detalhando as motivações técnicas, os benefícios arquiteturais e as mudanças estruturais introduzidas pela adoção da tríade **TanStack Query**, **React Hook Form** e **Zod**.

---

## 1. Contexto e Motivação

Anteriormente, o componente `FormularioLogin` adotava uma abordagem com múltiplos estados manuais do React (`useState` para cada campo, para loading e para mensagens de erro):

- **Estados dispersos**: `email`, `senha`, `erro`, `enviando`.
- **Re-renderizações a cada tecla**: Cada caractere digitado disparava a renderização de todo o formulário.
- **Validação frágil**: Dependência de atributos HTML (`required`, `type="email"`) sem validação rica de regras de negócio antes do envio.
- **Mistura de responsabilidades**: O componente de UI acumulava a responsabilidade da renderização visual, manipulação do formulário e comunicação assíncrona com a API.

Com a refatoração, desacoplamos a lógica de validação, estado de formulário e ciclo de vida da requisição HTTP.

---

## 2. Por que cada ferramenta foi escolhida?

### 2.1 TanStack Query (`@tanstack/react-query`)
- **Gerenciamento declarativo de requisições**: Elimina variáveis de controle como `setEnviando(true/false)`. O hook `useMutation` provê nativamente `isPending`, `error`, `isSuccess` e `data`.
- **Desacoplamento via Custom Hook (`useLogin`)**: A chamada ao endpoint `/auth/login`, o armazenamento da sessão e o roteamento pós-login ficam isolados em `src/hooks/useLogin.ts`, podendo ser reutilizados em qualquer lugar da aplicação.
- **Infraestrutura preparada para o ecossistema**: A introdução do `ProvedorQuery` em `src/app/layout.tsx` estabelece as bases para chamadas com cache, refetching e paginação nas demais telas do sistema (ex.: agenda e consultas).

### 2.2 React Hook Form (`react-hook-form`)
- **Desempenho otimizado**: Reduz re-renderizações desnecessárias por meio de inputs não-controlados registrados via `register()`.
- **Código mais limpo e conciso**: O tratamento de eventos de submissão, prevenção de default e controle de foco em campos inválidos são tratados de forma declarativa via `handleSubmit`.
- **Acessibilidade nativa**: Facilita a vinculação de atributos como `aria-invalid` diretamente vinculados ao estado de erro do campo (`errors.email`, `errors.senha`).

### 2.3 Zod (`zod` + `@hookform/resolvers/zod`)
- **Fonte única da verdade para dados e tipos**: O schema de validação gera automaticamente a tipagem estática do TypeScript (`DadosLogin`), garantindo total sincronia entre validação em tempo de execução e checagem de tipos estáticos.
- **Feedback instantâneo ao usuário**: Erros de validação (ex.: e-mail malformado ou campos vazios) são informados imediatamente no cliente, sem gastar processamento ou requisições desnecessárias para a API.
- **Mensagens claras e em português**: Centralização das mensagens de erro amigáveis no schema (`Informe um e-mail válido`, `Informe sua senha`).

---

## 3. Estrutura Arquitetural das Alterações

```text
apps/web/
├── src/
│   ├── app/
│   │   └── layout.tsx                              # ProvedorQuery inserido no RootLayout
│   ├── providers/
│   │   └── provedorQuery.tsx                       # Configuração do QueryClient para Next.js
│   ├── hooks/
│   │   └── useLogin.ts                             # Custom hook com useMutation para login
│   ├── middleware.ts                               # Middleware do Next.js (rotas públicas e privadas)
│   └── components/
│       ├── molecules/
│       │   └── Field/
│       │       ├── types.ts                        # Adicionada prop opcional erro?: string
│       │       └── field.tsx                       # Renderização da mensagem de erro abaixo do input
│       └── organisms/
│           └── FormularioLogin/
│               ├── schema.ts                       # Schema de validação Zod e type DadosLogin
│               └── formularioLogin.tsx             # Componente refatorado (sem useEffect de redirecionamento)
└── test/
    ├── login.test.tsx                              # Testes com QueryClient e validação de schema
    └── middleware.test.ts                         # Testes automatizados de proteção e redirecionamento de rotas
```

---

## 4. Comparativo de Código

### Antes (Abordagem Manual)
```tsx
const [email, setEmail] = useState('')
const [senha, setSenha] = useState('')
const [erro, setErro] = useState('')
const [enviando, setEnviando] = useState(false)

async function entrar(evento: FormEvent) {
  evento.preventDefault()
  setEnviando(true)
  try {
    const sessao = await api('/auth/login', { corpo: { email, senha } })
    salvarSessao(sessao)
    router.push(`/${sessao.usuario.perfil}`)
  } catch (e) {
    setErro((e as Error).message)
    setEnviando(false)
  }
}
```

### Depois (Declarativo e Type-safe)
```tsx
const { mutate: realizarLogin, isPending, error } = useLogin()

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<DadosLogin>({
  resolver: zodResolver(loginSchema),
})

const onSubmit = handleSubmit((dados) => {
  realizarLogin(dados)
})
```

---

## 5. Benefícios Alcançados

1. **Robustez**: Validação rigorosa no cliente antes de qualquer disparo de rede.
2. **Manutenibilidade**: Schema de dados desacoplado da camada de apresentação (`schema.ts`).
3. **UX & Acessibilidade**: Mensagens de erro visuais inline associadas a cada campo e suporte a leitores de tela com `aria-invalid`.
4. **Testabilidade**: Fácil isolamento dos testes de validação no cliente e mutação assíncrona, com cobertura garantida no Vitest.
