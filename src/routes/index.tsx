import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useRamadanCalendar } from '@/api/serverFunction'
import { CountryCitySelector } from '@/components/CountryCitySelector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import TableCalendar from '@/components/TableCalendar'
import TodayCard from '@/components/TodayCard'

const DEFAULT_LOCATION = {
  city: 'Vienna',
  country: 'AT',
}

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [location, setLocation] = useState(DEFAULT_LOCATION)

  const { data, isLoading, isError, error } = useRamadanCalendar({
    city: location.city,
    country: location.country,
    timezone: 'CET',
  })

  // ---- Find today (CET-based) ----
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const todayString = `${dd}-${mm}-${yyyy}`

  const today = data?.days.find((d) => d.gregorianDate === todayString)
  const timings = today?.timings
  const hijriYear = data?.hijriYear

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Failed to load Ramadan data</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <CountryCitySelector value={location} onChange={setLocation} />
        <TodayCard today={today} timings={timings} isLoading={isLoading} />
      </div>

      <TableCalendar
        hijriYear={hijriYear ?? 0}
        todayString={todayString}
        data={data}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  )
}
