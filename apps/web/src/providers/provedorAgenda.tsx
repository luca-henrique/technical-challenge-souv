'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Agenda } from '@bemviver/shared'
import { useAgenda } from '@/hooks/useAgenda'
import type { CriarConsultaParams } from '@/services/consultas/types'

export interface AgendaContextValue {
  profissionalId: string
  data: string
  agenda: Agenda | null
  carregando: boolean
  erro: string
  erroAcao: string
  cancelarConsulta: (consultaId: string) => Promise<unknown>
  cancelando: boolean
  registrarFalta: (consultaId: string) => Promise<unknown>
  registrandoFalta: boolean
  agendarConsulta: (dados: CriarConsultaParams) => Promise<unknown>
  agendando: boolean
  executarAcao: (acao: 'cancelar' | 'falta', consultaId: string) => Promise<void>
  limparErroAcao: () => void
}

export const AgendaContext = createContext<AgendaContextValue | null>(null)

export interface ProvedorAgendaProps {
  profissionalId: string
  data: string
  children: ReactNode
}

export function ProvedorAgenda({
  profissionalId,
  data,
  children,
}: ProvedorAgendaProps) {
  const {
    agenda,
    carregando,
    erro,
    cancelarConsulta,
    cancelando,
    registrarFalta,
    registrandoFalta,
    agendarConsulta,
    agendando,
  } = useAgenda(profissionalId, data)

  const [erroAcao, setErroAcao] = useState('')

  const limparErroAcao = useCallback(() => {
    setErroAcao('')
  }, [])

  const executarAcao = useCallback(
    async (acao: 'cancelar' | 'falta', consultaId: string) => {
      setErroAcao('')
      try {
        if (acao === 'cancelar') {
          await cancelarConsulta(consultaId)
        } else {
          await registrarFalta(consultaId)
        }
      } catch (e) {
        setErroAcao((e as Error).message)
      }
    },
    [cancelarConsulta, registrarFalta],
  )

  const value = useMemo<AgendaContextValue>(() => {
    return {
      profissionalId,
      data,
      agenda,
      carregando,
      erro,
      erroAcao,
      cancelarConsulta,
      cancelando,
      registrarFalta,
      registrandoFalta,
      agendarConsulta,
      agendando,
      executarAcao,
      limparErroAcao,
    }
  }, [
    profissionalId,
    data,
    agenda,
    carregando,
    erro,
    erroAcao,
    cancelarConsulta,
    cancelando,
    registrarFalta,
    registrandoFalta,
    agendarConsulta,
    agendando,
    executarAcao,
    limparErroAcao,
  ])

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>
}

export function useAgendaContext() {
  return useContext(AgendaContext)
}
