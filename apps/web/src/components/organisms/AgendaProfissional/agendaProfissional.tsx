'use client'

import { useEffect, useState } from 'react'
import { hojeEmRecife, type Agenda } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import FormBloquearPeriodo from '@/components/molecules/FormBloquearPeriodo/formBloquearPeriodo'
import InlineConfirmButton from '@/components/molecules/InlineConfirmButton/inlineConfirmButton'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import CardAgendaDia from '@/components/organisms/CardAgendaDia/cardAgendaDia'
import { useSessao } from '@/hooks/useSessao'
import { api } from '@/lib/api'

export default function AgendaProfissional() {
  const profissionalId = useSessao()?.usuario.id
  const [data, setData] = useState(() => hojeEmRecife())
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [erro, setErro] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [exibindoPeriodo, setExibindoPeriodo] = useState(false)
  const [bloqueandoPeriodo, setBloqueandoPeriodo] = useState(false)
  const [atualizacao, setAtualizacao] = useState(0)

  useEffect(() => {
    if (!profissionalId) return
    api<Agenda>(`/profissionais/${profissionalId}/agenda?data=${data}`)
      .then((resposta) => {
        setAgenda(resposta)
        setErro('')
      })
      .catch((e: Error) => setErro(e.message))
  }, [profissionalId, data, atualizacao])

  async function bloquearDia() {
    try {
      await api(`/profissionais/${profissionalId}/folgas`, { metodo: 'POST', corpo: { data } })
      setConfirmando(false)
      setAtualizacao((n) => n + 1)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function bloquearPeriodo(dados: { dataInicio: string; dataFim: string }) {
    if (!profissionalId) return
    setBloqueandoPeriodo(true)
    try {
      await api(`/profissionais/${profissionalId}/folgas/periodo`, {
        metodo: 'POST',
        corpo: dados,
      })
      setExibindoPeriodo(false)
      setErro('')
      setAtualizacao((n) => n + 1)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setBloqueandoPeriodo(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SeletorData
          valor={data}
          onChange={(novaData) => {
            setData(novaData)
            setConfirmando(false)
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          {agenda && !agenda.folga && !exibindoPeriodo && (
            <InlineConfirmButton
              labelTrigger="Bloquear este dia como folga"
              labelConfirmar="Confirmar folga"
              labelCancelar="Voltar"
              confirmando={confirmando}
              onConfirmandoChange={setConfirmando}
              onConfirmar={bloquearDia}
              varianteTrigger="secundario"
              varianteConfirmar="primario"
              varianteCancelar="secundario"
              tamanho="normal"
            />
          )}
          {!exibindoPeriodo && !confirmando && (
            <Button variante="secundario" onClick={() => setExibindoPeriodo(true)}>
              Bloquear período (férias)
            </Button>
          )}
        </div>
      </div>

      {exibindoPeriodo && (
        <FormBloquearPeriodo
          onConfirmar={bloquearPeriodo}
          onCancelar={() => setExibindoPeriodo(false)}
          bloqueando={bloqueandoPeriodo}
        />
      )}

      {erro && <Alert>{erro}</Alert>}

      {agenda && (
        <CardAgendaDia
          agenda={agenda}
          profissionalId={profissionalId}
          data={data}
          mensagemFolga="Este dia está bloqueado como folga."
        />
      )}
    </div>
  )
}
