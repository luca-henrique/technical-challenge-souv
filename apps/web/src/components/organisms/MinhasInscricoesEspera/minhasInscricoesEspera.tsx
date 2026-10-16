'use client'

import Badge from '@/components/atoms/Badge/badge'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import Skeleton from '@/components/atoms/Skeleton/skeleton'
import { useCancelarEspera, useMinhasEspera } from '@/hooks/useListaEspera'
import { formatarData } from '@/lib/formato'

export default function MinhasInscricoesEspera() {
  const { data: inscricoes = [], isLoading } = useMinhasEspera()
  const { mutate: cancelar, isPending: cancelando } = useCancelarEspera()

  const ativas = Array.isArray(inscricoes)
    ? inscricoes.filter((i) => i && (i.status === 'aguardando' || i.status === 'notificado'))
    : []

  if (isLoading) {
    return (
      <Card className="space-y-3">
        <h2 className="text-base font-semibold">Minhas Listas de Espera</h2>
        <Skeleton className="h-12 w-full" />
      </Card>
    )
  }

  if (ativas.length === 0) {
    return null
  }

  return (
    <Card aria-live="polite" className="space-y-3 border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-amber-950 dark:text-amber-200">
          Suas Inscrições na Lista de Espera ({ativas.length})
        </h2>
      </div>

      <div className="divide-y divide-amber-200/60 dark:divide-amber-900/40">
        {ativas.map((item) => (
          <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {item.profissionalNome ?? 'Profissional'} — <span className="text-xs text-gray-500">{item.especialidade}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Data: <strong>{formatarData(item.data)}</strong> | Turno: {item.turno === 'manha' ? 'Manhã' : item.turno === 'tarde' ? 'Tarde' : 'Qualquer'}
              </p>
              {item.status === 'notificado' ? (
                <Badge variante="sucesso" tamanho="md" className="mt-1">
                  🎉 Vaga liberada! Agende agora ou aguarde contato.
                </Badge>
              ) : (
                <Badge variante="aviso" tamanho="sm" className="mt-1">
                  Aguardando desistência
                </Badge>
              )}
            </div>

            <Button
              variante="secundario"
              tamanho="compacto"
              disabled={cancelando}
              onClick={() => cancelar(item.id)}
              aria-label={`Sair da lista de espera para ${item.profissionalNome ?? 'profissional'} no dia ${formatarData(item.data)}`}
            >
              Sair da fila
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
