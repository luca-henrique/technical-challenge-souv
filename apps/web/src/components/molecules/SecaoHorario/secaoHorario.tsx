import Skeleton from '@/components/atoms/Skeleton/skeleton'
import SeletorHorario from '@/components/molecules/SeletorHorario/seletorHorario'
import type { SecaoHorarioProps } from './types'

export default function SecaoHorario({
  label = 'Horário',
  horarios,
  selecionado,
  onSelecionar,
  carregando = false,
  erro,
  slotVazio,
  className = '',
}: SecaoHorarioProps) {
  return (
    <fieldset className={className}>
      <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </legend>
      {carregando ? (
        <div className="mt-2 space-y-2" role="status" aria-label="Carregando horários">
          <Skeleton className="h-9 w-full" />
          <span className="sr-only">Carregando horários disponíveis...</span>
        </div>
      ) : (
        <>
          <SeletorHorario
            horarios={horarios}
            selecionado={selecionado}
            onSelecionar={onSelecionar}
          />
          {horarios.length === 0 && slotVazio && (
            <div className="mt-3">{slotVazio}</div>
          )}
        </>
      )}
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </fieldset>
  )
}
