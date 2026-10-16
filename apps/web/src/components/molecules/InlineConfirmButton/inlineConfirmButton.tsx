import { useState } from 'react'
import Button from '@/components/atoms/Button/button'
import type { InlineConfirmButtonProps } from './types'

export default function InlineConfirmButton({
  labelTrigger,
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Voltar',
  onConfirmar,
  onCancelar,
  onTrigger,
  confirmando: confirmandoProp,
  onConfirmandoChange,
  varianteTrigger = 'secundario',
  varianteConfirmar = 'perigo',
  varianteCancelar = 'secundario',
  tamanho = 'compacto',
  ariaLabelTrigger,
  ariaLabelConfirmar,
  ariaLabelCancelar,
  classNameTrigger = '',
  classNameConfirmar = 'flex-1',
  classNameCancelar = '',
  classNameContainer = 'flex gap-2',
  disabled = false,
  desabilitado,
}: InlineConfirmButtonProps) {
  const isDisabled = desabilitado ?? disabled
  const [internalConfirmando, setInternalConfirmando] = useState(false)
  const isControlled = confirmandoProp !== undefined
  const isConfirmando = isControlled ? confirmandoProp : internalConfirmando

  const setConfirmando = (val: boolean) => {
    if (!isControlled) {
      setInternalConfirmando(val)
    }
    onConfirmandoChange?.(val)
  }

  const handleTrigger = () => {
    onTrigger?.()
    setConfirmando(true)
  }

  const handleCancelar = () => {
    setConfirmando(false)
    onCancelar?.()
  }

  const handleConfirmar = () => {
    onConfirmar()
  }

  if (isConfirmando) {
    return (
      <div className={classNameContainer}>
        <Button
          variante={varianteConfirmar}
          tamanho={tamanho}
          onClick={handleConfirmar}
          aria-label={ariaLabelConfirmar}
          className={classNameConfirmar}
          disabled={isDisabled}
        >
          {labelConfirmar}
        </Button>
        <Button
          variante={varianteCancelar}
          tamanho={tamanho}
          onClick={handleCancelar}
          aria-label={ariaLabelCancelar}
          className={classNameCancelar}
          disabled={isDisabled}
        >
          {labelCancelar}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variante={varianteTrigger}
      tamanho={tamanho}
      onClick={handleTrigger}
      aria-label={ariaLabelTrigger}
      className={classNameTrigger}
      disabled={isDisabled}
    >
      {labelTrigger}
    </Button>
  )
}
