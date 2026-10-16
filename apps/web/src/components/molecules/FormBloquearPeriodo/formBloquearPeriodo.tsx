'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import SeletorIntervaloDatas from '@/components/molecules/SeletorIntervaloDatas/seletorIntervaloDatas'
import { bloquearPeriodoSchema, type DadosBloquearPeriodo } from './schema'
import type { FormBloquearPeriodoProps } from './types'

export default function FormBloquearPeriodo({
  onConfirmar,
  onCancelar,
  bloqueando = false,
}: FormBloquearPeriodoProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosBloquearPeriodo>({
    resolver: zodResolver(bloquearPeriodoSchema),
    defaultValues: {
      dataInicio: '',
      dataFim: '',
    },
  })

  return (
    <Card className="space-y-4 border-teal-200 bg-teal-50/50 dark:border-teal-900 dark:bg-teal-950/20">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Bloquear período de folga (férias/recesso)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Nenhum paciente conseguirá agendar consultas nos dias selecionados (finais de semana são desconsiderados do bloqueio; limite de 90 dias).
        </p>
      </div>

      <form onSubmit={handleSubmit(onConfirmar)} className="space-y-4">
        <Controller
          name="dataInicio"
          control={control}
          render={({ field: fieldInicio }) => (
            <Controller
              name="dataFim"
              control={control}
              render={({ field: fieldFim }) => (
                <SeletorIntervaloDatas
                  dataInicio={fieldInicio.value}
                  dataFim={fieldFim.value}
                  onChangeInicio={fieldInicio.onChange}
                  onChangeFim={fieldFim.onChange}
                  erroInicio={errors.dataInicio?.message}
                  erroFim={errors.dataFim?.message}
                />
              )}
            />
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" tamanho="compacto" onClick={onCancelar} disabled={bloqueando}>
            Cancelar
          </Button>
          <Button type="submit" tamanho="compacto" disabled={bloqueando} aria-busy={bloqueando}>
            {bloqueando ? 'Bloqueando...' : 'Confirmar bloqueio'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
