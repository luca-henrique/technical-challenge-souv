export interface SegmentedOption<T extends string = string> {
  valor: T
  rotulo: string
}

export interface SegmentedControlProps<T extends string = string> {
  opcoes: readonly SegmentedOption<T>[]
  valor: T
  onChange: (valor: T) => void
  label?: string
  erro?: string
  disabled?: boolean
  className?: string
  gridColsClass?: string
  varianteCor?: 'teal' | 'amber'
}
