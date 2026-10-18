import { Skeleton } from '@/shared/ui/skeleton/skeleton'

export interface TimeSlotGridProps {
  slots: string[]
  selectedTime: string
  onSelect: (time: string) => void
  isLoading?: boolean
  error?: string
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelect,
  isLoading = false,
  error,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Carregando horários...
        </span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Horário disponível <span className="text-red-500">*</span>
      </label>
      <div
        role="group"
        aria-label="Horários disponíveis"
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
      >
        {slots.map((slot) => {
          const isSelected = selectedTime === slot
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(slot)}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isSelected
                  ? 'border-teal-700 bg-teal-700 text-white shadow-sm dark:border-teal-500 dark:bg-teal-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:bg-teal-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-teal-700'
              }`}
            >
              {slot}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
