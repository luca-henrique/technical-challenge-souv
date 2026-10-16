'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { hojeEmRecife } from '@bemviver/shared'
import { filtroRecepcaoSchema, type FiltroRecepcao } from '@/app/recepcao/schema'
import { useProfissionais } from '@/hooks/useProfissionais'

export function useFiltroRecepcao() {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FiltroRecepcao>({
    resolver: zodResolver(filtroRecepcaoSchema),
    defaultValues: {
      profissionalId: '',
      data: hojeEmRecife(),
    },
  })

  const formProfissionalId = useWatch({ control, name: 'profissionalId' })
  const formData = useWatch({ control, name: 'data' })

  // Consulta à rota /profissionais enviando o parâmetro de data para ver disponibilidade
  const {
    data: profissionais = [],
    isLoading: carregando,
    error: erroProfissionais,
  } = useProfissionais(formData ? { data: formData } : undefined)

  const inicializado = useRef(false)
  useEffect(() => {
    if (!inicializado.current && profissionais.length > 0 && !formProfissionalId) {
      inicializado.current = true
      setValue('profissionalId', profissionais[0].id)
    }
  }, [profissionais, formProfissionalId, setValue])

  return {
    control,
    handleSubmit,
    profissionais,
    profissionalId: formProfissionalId ?? '',
    data: formData ?? hojeEmRecife(),
    carregando,
    erro: erroProfissionais?.message ?? '',
    errors,
  }
}
