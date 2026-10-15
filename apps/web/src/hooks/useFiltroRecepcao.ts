'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { hojeEmRecife } from '@bemviver/shared'
import { filtroRecepcaoSchema, type FiltroRecepcao } from '@/app/recepcao/schema'
import { useProfissionais } from '@/hooks/useProfissionais'

export function useFiltroRecepcao() {
  const { data: profissionais = [], isLoading: carregando, error: erroProfissionais } = useProfissionais()

  const {
    control,
    setValue,
    formState: { errors },
  } = useForm<FiltroRecepcao>({
    resolver: zodResolver(filtroRecepcaoSchema),
    defaultValues: {
      profissionalId: '',
      data: hojeEmRecife(),
    },
  })

  const profissionalId = useWatch({ control, name: 'profissionalId' })
  const data = useWatch({ control, name: 'data' })

  useEffect(() => {
    if (profissionais.length > 0 && !profissionalId) {
      setValue('profissionalId', profissionais[0].id)
    }
  }, [profissionais, profissionalId, setValue])

  return {
    control,
    profissionais,
    profissionalId: profissionalId ?? '',
    data: data ?? hojeEmRecife(),
    carregando,
    erro: erroProfissionais?.message ?? '',
    errors,
  }
}
