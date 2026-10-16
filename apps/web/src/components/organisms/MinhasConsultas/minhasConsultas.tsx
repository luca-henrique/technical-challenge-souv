'use client'

import { useState } from 'react'
import Alert from '@/components/atoms/Alert/alert'
import LinkButton from '@/components/atoms/LinkButton/linkButton'
import CartaoConsulta from '@/components/molecules/CartaoConsulta/cartaoConsulta'
import MinhasInscricoesEspera from '@/components/organisms/MinhasInscricoesEspera/minhasInscricoesEspera'
import MinhasConsultasSkeleton from '@/components/organisms/MinhasConsultasSkeleton/minhasConsultasSkeleton'
import { useMinhasConsultas } from '@/hooks/useMinhasConsultas'

export default function MinhasConsultas() {
  const {
    consultas,
    carregando,
    erro,
    cancelarConsulta,
    erroCancelar,
  } = useMinhasConsultas()

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

  if (carregando) {
    return <MinhasConsultasSkeleton />
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Minhas consultas</h1>
        <LinkButton href="/paciente/agendar">Marcar consulta</LinkButton>
      </div>

      {erroExibicao && <Alert>{erroExibicao}</Alert>}

      {consultas.length === 0 ? (
        <p className="text-sm text-gray-500">Você não possui consultas agendadas no momento.</p>
      ) : (
        <ul className="space-y-3">
          {consultas.map((consulta) => (
            <li key={consulta.id}>
              <CartaoConsulta consulta={consulta} onCancelar={cancelar} />
            </li>
          ))}
        </ul>
      )}

      <MinhasInscricoesEspera />
    </div>
  )
}
