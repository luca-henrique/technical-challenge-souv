'use client'

import Button from '@/components/atoms/Button/button'
import type { BotaoExportarPdfProps } from './types'

export default function BotaoExportarPdf({
  className = '',
  rotulo = 'Exportar PDF',
  onExportar,
}: BotaoExportarPdfProps) {
  function handleExportar() {
    if (onExportar) {
      onExportar()
    } else if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Button
      variante="secundario"
      tamanho="compacto"
      onClick={handleExportar}
      className={`print:hidden inline-flex items-center gap-1.5 ${className}`}
      aria-label={rotulo}
      title="Exportar ou imprimir a agenda em PDF"
    >
      <svg
        className="h-4 w-4 text-gray-600 dark:text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>{rotulo}</span>
    </Button>
  )
}
