import { useContext, useMemo, useSyncExternalStore } from 'react'
import { CHAVE_SESSAO, lerSessao } from '@/lib/sessao'
import { SessaoContext } from '@/providers/provedorSessao'

// Quando envolto pelo ProvedorSessao, consome o contexto reativo.
// Caso contrário (ex: testes legados sem provider), faz fallback seguro ao storage.
export function useSessao() {
  const context = useContext(SessaoContext)
  const salva = useSyncExternalStore(
    () => () => {},
    () => (typeof window === 'undefined' ? null : localStorage.getItem(CHAVE_SESSAO)),
    () => undefined,
  )

  return useMemo(() => {
    if (context !== null) {
      return context.sessao === undefined ? undefined : context.sessao
    }
    return salva === undefined ? undefined : lerSessao()
  }, [context, salva])
}
