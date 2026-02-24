import { useState } from 'react'
import { useRamadanCalendar } from '@/api/country'
import { CountryCitySelector } from '@/components/CountryCitySelector'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const DEFAULT_LOCATION = {
  city: 'Tetovo',
  country: 'NMK',
}

export const RamadanTest = () => {
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
  const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
  const hijriDateReadable = today
    ? `${today.hijriDay} ${today.hijriDate.split('-')[1]} ${today.hijriDate.split('-')[2]}`
    : null

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Always render selector */}
      <div className="mb-6">
        <CountryCitySelector value={location} onChange={setLocation} />
      </div>

      {/* Global error (optional): show once, page still renders */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load Ramadan data</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* TODAY CARD */}
      <Card className="w-full mx-auto text-center">
        

        <CardContent className="space-y-6 flex flex-col items-center">
          {isLoading && (
            <>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-40" />
              <div className="flex flex-wrap justify-center gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-36 rounded-md" />
                ))}
              </div>
            </>
          )}

          {!isLoading && !isError && !today && (
            <div className="text-sm text-muted-foreground">
              No “today” entry found for {todayString}.
            </div>
          )}

          {!isLoading && !isError && today && (
            <>
              <div className="space-y-1">
                <div className="text-xl font-semibold">{today.readable} - {hijriDateReadable}</div>
                
              </div>

              <div className="text-sm text-muted-foreground">
                Today&apos;s Prayer Timings
              </div>

              {timings && (
                <div className="flex flex-wrap justify-center gap-3">
                  {order.map((prayer) => (
                    <Button
                      key={prayer}
                      variant="outline"
                      className="justify-center"
                    >
                      <span className="font-medium">{prayer}</span>
                      <span className="ml-2 text-muted-foreground">
                        {timings[prayer]}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* TABLE CARD */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ramadan</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Hijri Day</TableHead>
                  <TableHead>Gregorian</TableHead>
                  <TableHead>Fajr</TableHead>
                  <TableHead>Dhuhr</TableHead>
                  <TableHead>Asr</TableHead>
                  <TableHead>Maghrib</TableHead>
                  <TableHead>Isha</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading &&
                  !isError &&
                  (!data?.days || data.days.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No data to display.
                      </TableCell>
                    </TableRow>
                  )}

                {!isLoading &&
                  !isError &&
                  data?.days.map((day) => {
                    const isTodayRow = day.gregorianDate === todayString

                    return (
                      <TableRow
                        key={day.timestamp}
                        className={cn(
                          'transition-colors',
                          isTodayRow &&
                            'bg-blue-50 dark:bg-blue-950/40 font-medium',
                        )}
                      >
                        <TableCell>{day.hijriDay}</TableCell>
                        <TableCell>{day.gregorianDate}</TableCell>
                        <TableCell>{day.timings.Fajr}</TableCell>
                        <TableCell>{day.timings.Dhuhr}</TableCell>
                        <TableCell>{day.timings.Asr}</TableCell>
                        <TableCell>{day.timings.Maghrib}</TableCell>
                        <TableCell>{day.timings.Isha}</TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
