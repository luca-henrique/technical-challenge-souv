import Button from '@/components/atoms/Button/button'
import type { SegmentedControlProps } from './types'

export default function SegmentedControl<T extends string = string>({
  opcoes,
  valor,
  onChange,
  label,
  erro,
  disabled = false,
  className = '',
  gridColsClass,
  varianteCor = 'teal',
}: SegmentedControlProps<T>) {
  const defaultCols =
    gridColsClass ??
    (opcoes.length === 1
      ? 'grid-cols-1'
      : opcoes.length === 2
        ? 'grid-cols-2'
        : opcoes.length === 3
          ? 'grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4')

  return (
    <fieldset className={className}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </legend>
      )}
      <div className={`mt-1 grid gap-2 ${defaultCols}`} aria-label={label}>
        {opcoes.map((opcao) => {
          const ativo = valor === opcao.valor
          return (
            <Button
              key={opcao.valor}
              type="button"
              aria-pressed={ativo}
              disabled={disabled}
              onClick={() => onChange(opcao.valor)}
              variante={
                ativo
                  ? varianteCor === 'amber'
                    ? 'secundario'
                    : 'primario'
                  : 'secundario'
              }
              className={`w-full min-h-11 ${
                ativo && varianteCor === 'amber'
                  ? 'border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-500 dark:bg-amber-500'
                  : ''
              }`}
            >
              {opcao.rotulo}
            </Button>
          )
        })}
      </div>
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </fieldset>
  )
}
