import type { ReactNode } from 'react'

export type TamanhoModal = 'sm' | 'md' | 'lg'

export interface ModalProps {
  aberto: boolean
  onFechar: () => void
  tamanho?: TamanhoModal
  tituloId?: string
  children: ReactNode
  className?: string
}

export interface ModalHeaderProps {
  titulo: string
  subtitulo?: string
  onFechar?: () => void
  id?: string
}

export interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}
