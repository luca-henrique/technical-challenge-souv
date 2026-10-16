'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import { useInscreverEspera } from '@/hooks/useListaEspera'
import { entrarListaEsperaSchema, type DadosEntrarListaEspera } from './schema'
import type { CardEntrarListaEsperaProps } from './types'

export default function CardEntrarListaEspera({
  profissionalId,
  data,
  tipo,
  onSucesso,
  className = '',
}: CardEntrarListaEsperaProps) {
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')

  const { control, handleSubmit } = useForm<DadosEntrarListaEspera>({
    resolver: zodResolver(entrarListaEsperaSchema),
    defaultValues: {
      turno: 'qualquer',
    },
  })

  const { mutateAsync: inscrever, isPending: enviando } = useInscreverEspera()

  const onSubmit = handleSubmit(async (valores) => {
    setMensagemSucesso('')
    setMensagemErro('')
    try {
      await inscrever({
        profissionalId,
        data,
        tipo,
        turno: valores.turno,
      })
      setMensagemSucesso('Inscrição na lista de espera confirmada! Você será avisado assim que surgir uma vaga.')
      if (onSucesso) onSucesso()
    } catch (e) {
      setMensagemErro((e as Error).message)
    }
  })

  return (
    <Card className={`border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Nenhum horário disponível para esta data?
        </h3>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
          Entre na lista de espera. Se outro paciente cancelar a consulta, nós notificamos você imediatamente.
        </p>
      </div>

      {mensagemSucesso ? (
        <Alert variante="sucesso">{mensagemSucesso}</Alert>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferência de turno
            </label>
            <Controller
              name="turno"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { valor: 'manha', rotulo: 'Manhã (08h-12h)' },
                    { valor: 'tarde', rotulo: 'Tarde (13h-18h)' },
                    { valor: 'qualquer', rotulo: 'Qualquer turno' },
                  ].map((opcao) => (
                    <label
                      key={opcao.valor}
                      className={`flex cursor-pointer items-center justify-center rounded-md border p-2 text-xs font-medium transition-colors text-center ${
                        field.value === opcao.valor
                          ? 'border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={opcao.valor}
                        checked={field.value === opcao.valor}
                        onChange={() => field.onChange(opcao.valor)}
                      />
                      {opcao.rotulo}
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {mensagemErro && <Alert>{mensagemErro}</Alert>}

          <Button
            type="button"
            tamanho="compacto"
            disabled={enviando}
            onClick={onSubmit}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white"
          >
            {enviando ? 'Inscrevendo...' : 'Entrar na lista de espera deste dia'}
          </Button>
        </div>
      )}
    </Card>
  )
}
