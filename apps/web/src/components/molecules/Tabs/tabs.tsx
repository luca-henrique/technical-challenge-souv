'use client'

import { createContext, useContext, useState } from 'react'
import type { TabContentProps, TabTriggerProps, TabsListProps, TabsProps } from './types'

interface TabsContextValue {
  valorAtivo: string
  setValorAtivo: (v: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be rendered inside <Tabs>')
  return ctx
}

export function Tabs({ valorPadrao = '', valor, onChange, children, className = '' }: TabsProps) {
  const [interno, setInterno] = useState(valorPadrao)
  const valorAtivo = valor !== undefined ? valor : interno

  function mudarAba(novoValor: string) {
    if (valor === undefined) {
      setInterno(novoValor)
    }
    if (onChange) {
      onChange(novoValor)
    }
  }

  return (
    <TabsContext.Provider value={{ valorAtivo, setValorAtivo: mudarAba }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, 'aria-label': ariaLabel, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  )
}

export function TabTrigger({ valor, children, className = '' }: TabTriggerProps) {
  const { valorAtivo, setValorAtivo } = useTabsContext()
  const ativo = valorAtivo === valor

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${valor}`}
      aria-selected={ativo}
      aria-controls={`painel-${valor}`}
      tabIndex={ativo ? 0 : -1}
      onClick={() => setValorAtivo(valor)}
      className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
        ativo
          ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function TabContent({ valor, children, className = '' }: TabContentProps) {
  const { valorAtivo } = useTabsContext()
  if (valorAtivo !== valor) return null

  return (
    <div
      id={`painel-${valor}`}
      role="tabpanel"
      aria-labelledby={`tab-${valor}`}
      className={`outline-none ${className}`}
    >
      {children}
    </div>
  )
}
