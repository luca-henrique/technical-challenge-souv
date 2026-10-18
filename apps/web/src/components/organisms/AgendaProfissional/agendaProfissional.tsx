'use client'

import { useContext, useState } from 'react'
import { QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query'
import { DoctorScheduleBoard } from '@/features/doctor-schedule/ui/organisms/doctor-schedule-board'

export default function AgendaProfissional() {
  const existingClient = useContext(QueryClientContext)
  const [fallbackClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  )

  if (!existingClient) {
    return (
      <QueryClientProvider client={fallbackClient}>
        <DoctorScheduleBoard />
      </QueryClientProvider>
    )
  }

  return <DoctorScheduleBoard />
}
