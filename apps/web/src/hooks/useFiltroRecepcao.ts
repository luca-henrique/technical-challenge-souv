'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { hojeEmRecife } from '@bemviver/shared'
import { filtroRecepcaoSchema, type FiltroRecepcao } from '@/app/recepcao/schema'
import { useProfissionais } from '@/hooks/useProfissionais'

export function useFiltroRecepcao() {
  const {
    control,
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
