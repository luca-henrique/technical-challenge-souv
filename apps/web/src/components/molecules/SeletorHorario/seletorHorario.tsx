import Button from '@/components/atoms/Button/button'
import type { SeletorHorarioProps } from './types'

export default function SeletorHorario({ horarios, selecionado, onSelecionar }: SeletorHorarioProps) {
  if (horarios.length === 0) {
    return (
      <p role="status" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Nenhum horário disponível nesse dia.
      </p>
    )
  }

  return (
    <div
      role="group"
      aria-label="Horários disponíveis"
      className="mt-1 grid grid-cols-4 gap-2"
    >
      {horarios.map((hora) => (
        <Button
          key={hora}
          variante={selecionado === hora ? 'primario' : 'secundario'}
          tamanho="estreito"
          aria-pressed={selecionado === hora}
          onClick={() => onSelecionar(hora)}
          className="min-h-11"
        >
          {hora}
        </Button>
      ))}
    </div>
  )
}
