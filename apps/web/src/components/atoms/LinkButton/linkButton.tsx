import Link from 'next/link'
import { classesDoBotao } from '@/components/atoms/Button/button'
import type { LinkButtonProps } from './types'

export default function LinkButton({ variante, tamanho, className = '', ...props }: LinkButtonProps) {
  return <Link className={`${classesDoBotao(variante, tamanho)} ${className}`} {...props} />
}

