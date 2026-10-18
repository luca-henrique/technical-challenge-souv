import { formatarData } from '@/lib/formato'
import { Button } from '@/shared/ui/button/button'

export interface ScheduleDateNavProps {
  selectedDate: string
  onDateChange: (newDate: string) => void
  onPreviousDay: () => void
  onNextDay: () => void
  onToday: () => void
  disabled?: boolean
  className?: string
}

export function ScheduleDateNav({
  selectedDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  disabled = false,
  className = '',
}: ScheduleDateNavProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor="schedule-date-input" className="sr-only">
          Selecionar data da agenda
        </label>
        <input
          id="schedule-date-input"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
          className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 cursor-pointer"
        />
        <Button
          variant="secondary"
          size="compact"
          onClick={onPreviousDay}
          disabled={disabled}
          aria-label="Dia anterior"
          className="min-h-11 min-w-11 px-3"
        >
          &larr;
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={onToday}
          disabled={disabled}
          className="min-h-11 px-3 text-xs font-medium"
        >
          Hoje
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={onNextDay}
          disabled={disabled}
          aria-label="Próximo dia"
          className="min-h-11 min-w-11 px-3"
        >
          &rarr;
        </Button>
      </div>

      <div className="text-right">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 first-letter:uppercase">
          {formatarData(selectedDate)}
        </h2>
      </div>
    </div>
  )
}
