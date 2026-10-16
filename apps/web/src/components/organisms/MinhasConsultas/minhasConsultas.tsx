'use client'

import { useState } from 'react'
import Alert from '@/components/atoms/Alert/alert'
import Heading from '@/components/atoms/Heading/heading'
import LinkButton from '@/components/atoms/LinkButton/linkButton'
import Text from '@/components/atoms/Text/text'
import { TabContent, Tabs, TabsList, TabTrigger } from '@/components/molecules/Tabs/tabs'
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
        <Heading as="h1" variante="pagina">
          Minhas consultas
        </Heading>
        <LinkButton href="/paciente/agendar">Marcar consulta</LinkButton>
      </div>

      <Tabs valor={abaAtiva} onChange={(v) => setAbaAtiva(v as 'proximas' | 'historico')}>
        <TabsList aria-label="Tipo de consultas">
          <TabTrigger valor="proximas">Próximas consultas</TabTrigger>
          <TabTrigger valor="historico">Histórico</TabTrigger>
        </TabsList>

        {erroExibicao && <Alert>{erroExibicao}</Alert>}

        <TabContent valor={abaAtiva}>
          {carregando ? (
            <MinhasConsultasSkeleton />
          ) : consultas.length === 0 ? (
            <Text variante="corpo" cor="secundario">
              {abaAtiva === 'proximas'
                ? 'Você não possui consultas agendadas no momento.'
                : 'Nenhuma consulta encontrada no seu histórico.'}
            </Text>
          ) : (
            <ul className="space-y-3">
              {consultas.map((consulta) => (
                <li key={consulta.id}>
                  <CartaoConsulta consulta={consulta} onCancelar={cancelar} />
                </li>
              ))}
            </ul>
          )}
        </TabContent>
      </Tabs>

      {abaAtiva === 'proximas' && <MinhasInscricoesEspera />}
    </div>
  )
}
