import type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from './types'

export default function Table({
  caption,
  containerClassName = '',
  className = '',
  children,
  ...props
}: TableProps) {
  return (
    <div className={`overflow-x-auto ${containerClassName}`}>
      <table className={`w-full text-left text-sm ${className}`} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

function TableHeader({ className = '', children, ...props }: TableHeaderProps) {
  return (
    <thead
      className={`border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
}

function TableBody({ className = '', children, ...props }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`} {...props}>
      {children}
    </tbody>
  )
}

function TableRow({ className = '', children, ...props }: TableRowProps) {
  return (
    <tr className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  )
}

function TableHead({ className = '', children, scope = 'col', ...props }: TableHeadProps) {
  return (
    <th scope={scope} className={`py-2 pr-4 font-medium ${className}`} {...props}>
      {children}
    </th>
  )
}

function TableCell({ className = '', children, ...props }: TableCellProps) {
  return (
    <td className={`py-2 pr-4 ${className}`} {...props}>
      {children}
    </td>
  )
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell
