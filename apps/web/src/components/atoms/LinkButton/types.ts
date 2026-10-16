import type { ComponentProps } from 'react'
import type Link from 'next/link'
import type { TamanhoBotao, VarianteBotao } from '@/components/atoms/Button/types'

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
}

