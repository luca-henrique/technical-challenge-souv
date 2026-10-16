import type { AlertProps } from './types'

export default function Alert({ variante = 'erro', children }: AlertProps) {
  if (variante === 'aviso') {
    return <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{children}</p>
  }
  if (variante === 'sucesso') {
    return <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{children}</p>
  }
  return (
    <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
      {children}
    </p>
  )
}
