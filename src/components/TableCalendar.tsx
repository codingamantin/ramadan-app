import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import type { RamadanCalendarResult } from '@/api/country'

type TableCalendarProps = {
  hijriYear: number
  todayString: string
  data?: RamadanCalendarResult
  isLoading: boolean
  isError: boolean
}

export default function TableCalendar({
  hijriYear,
  todayString,
  data,
  isLoading,
  isError,
}: TableCalendarProps) {
  return (
    <Card className="mt-8">
        <CardHeader>
          <CardTitle>
          
            <p className="text-base ">Ramadan {hijriYear}</p>
          </CardTitle>
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
                          isTodayRow && 'bg-background  font-medium',
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
  )
}
