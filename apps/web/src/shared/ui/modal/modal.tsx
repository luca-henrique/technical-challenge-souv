'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Bloqueia o scroll do body enquanto o modal estiver aberto
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Suporte a fechamento via tecla ESC
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Foco inicial adequado
    modalRef.current?.focus()

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop com clique para fechar */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteúdo do Modal com limite vertical e rolagem interna suave */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto transition-all dark:border-gray-800 dark:bg-gray-900 ${className}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
          {title && (
            <h3
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 min-h-11 min-w-11 flex items-center justify-center"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              &times;
            </span>
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
