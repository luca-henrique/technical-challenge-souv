'use client'

import { useState } from 'react'
import Alert from '@/components/atoms/Alert/alert'
import LinkButton from '@/components/atoms/LinkButton/linkButton'
import CartaoConsulta from '@/components/molecules/CartaoConsulta/cartaoConsulta'
import MinhasInscricoesEspera from '@/components/organisms/MinhasInscricoesEspera/minhasInscricoesEspera'
import MinhasConsultasSkeleton from '@/components/organisms/MinhasConsultasSkeleton/minhasConsultasSkeleton'
import { useMinhasConsultas } from '@/hooks/useMinhasConsultas'

export default function MinhasConsultas() {
  const [abaAtiva, setAbaAtiva] = useState<'proximas' | 'historico'>('proximas')

  const {
    consultas,
    carregando,
    erro,
    cancelarConsulta,
    erroCancelar,
  } = useMinhasConsultas({ historico: abaAtiva === 'historico' })

  const [erroAcao, setErroAcao] = useState('')

  async function cancelar(id: string) {
    setErroAcao('')
    try {
      await cancelarConsulta(id)
    } catch (e) {
      setErroAcao((e as Error).message)
    }
  }

  const erroExibicao = erro || erroCancelar || erroAcao

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Minhas consultas</h1>
        <LinkButton href="/paciente/agendar">Marcar consulta</LinkButton>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setAbaAtiva('proximas')}
          className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === 'proximas'
              ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Próximas consultas
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('historico')}
          className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === 'historico'
              ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Histórico
        </button>
      </div>

      {erroExibicao && <Alert>{erroExibicao}</Alert>}

      {carregando ? (
        <MinhasConsultasSkeleton />
      ) : consultas.length === 0 ? (
        <p className="text-sm text-gray-500">
          {abaAtiva === 'proximas'
            ? 'Você não possui consultas agendadas no momento.'
            : 'Nenhuma consulta encontrada no seu histórico.'}
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

      {abaAtiva === 'proximas' && <MinhasInscricoesEspera />}
    </div>
  )
}
