'use client'

import { useEffect } from 'react'
import Card from '@/components/atoms/Card/card'
import Heading from '@/components/atoms/Heading/heading'
import IconButton from '@/components/atoms/IconButton/iconButton'
import Text from '@/components/atoms/Text/text'
import type { ModalBodyProps, ModalFooterProps, ModalHeaderProps, ModalProps, TamanhoModal } from './types'

const TAMANHOS: Record<TamanhoModal, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
}

export function Modal({
  aberto,
  onFechar,
  tamanho = 'md',
  tituloId = 'modal-titulo',
  children,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!aberto) return
    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoPressionarTecla)
    return () => window.removeEventListener('keydown', aoPressionarTecla)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity"
    >
      <Card className={`w-full ${TAMANHOS[tamanho]} space-y-4 shadow-xl ${className}`}>
        {children}
      </Card>
    </div>
  )
}

export function ModalHeader({ titulo, subtitulo, onFechar, id = 'modal-titulo' }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
      <div>
        <Heading id={id} as="h2" variante="modal">
          {titulo}
        </Heading>
        {subtitulo && (
          <Text variante="suporte" cor="secundario">
            {subtitulo}
          </Text>
        )}
      </div>
      {onFechar && (
        <IconButton onClick={onFechar} aria-label="Fechar janela">
          ✕
        </IconButton>
      )}
    </div>
  )
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex justify-end gap-2 pt-2 border-t dark:border-gray-800 ${className}`}>
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
