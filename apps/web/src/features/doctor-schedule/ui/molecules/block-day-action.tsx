import { Button } from '@/shared/ui/button/button'

export interface BlockDayActionProps {
  isConfirming: boolean
  onConfirmingChange: (confirming: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function BlockDayAction({
  isConfirming,
  onConfirmingChange,
  onConfirm,
  isLoading = false,
  disabled = false,
  className = '',
}: BlockDayActionProps) {
  if (isConfirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="primary"
          size="compact"
          onClick={onConfirm}
          disabled={disabled || isLoading}
          className="min-h-11 px-4 bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? 'Confirmando...' : 'Confirmar folga'}
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => onConfirmingChange(false)}
          disabled={disabled || isLoading}
          className="min-h-11 px-4"
        >
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="secondary"
      size="compact"
      onClick={() => onConfirmingChange(true)}
      disabled={disabled || isLoading}
      className={`min-h-11 px-4 ${className}`}
    >
      Bloquear este dia como folga
    </Button>
  )
}
