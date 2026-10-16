import type { ButtonProps } from '@/components/atoms/Button/types'

export interface InlineConfirmButtonProps {
  labelTrigger: string
  labelConfirmar?: string
  labelCancelar?: string
  onConfirmar: () => void
  onCancelar?: () => void
  onTrigger?: () => void
  confirmando?: boolean
  onConfirmandoChange?: (confirmando: boolean) => void
  varianteTrigger?: ButtonProps['variante']
  varianteConfirmar?: ButtonProps['variante']
  varianteCancelar?: ButtonProps['variante']
  tamanho?: ButtonProps['tamanho']
  ariaLabelTrigger?: string
  ariaLabelConfirmar?: string
  ariaLabelCancelar?: string
  classNameTrigger?: string
  classNameConfirmar?: string
  classNameCancelar?: string
  classNameContainer?: string
  disabled?: boolean
  desabilitado?: boolean
}
