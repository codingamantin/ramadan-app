import { Moon } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Skeleton } from './ui/skeleton'

type TodayCardProps = {
  today?: {
    readable: string
    timings: Record<string, string>
  }
  timings?: Record<string, string>
  todayString?: string
  order?: string[]
  isLoading: boolean
  isError?: boolean
}
const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export default function TodayCard({
  today,
  todayString,
  timings,
  isLoading,
  isError,
}: TodayCardProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl shadow-md relative overflow-hidden">
      <CardContent className="space-y-4  relative text-center">
        {isLoading && (
          <>
            <Skeleton className="h-8 w-56 mx-auto" />
            <Skeleton className="h-5 w-44 mx-auto" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl p-5 text-center space-y-3">
                  <Skeleton className="h-3 w-14 mx-auto" />
                  <Skeleton className="h-7 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && isError && (
          <div className="text-sm text-amber-200/90">
            Failed to load prayer times. Please try again.
          </div>
        )}

        {!isLoading && !isError && !today && (
          <div className="text-sm text-amber-200/90">
            No “today” entry found for {todayString}.
          </div>
        )}

        {!isLoading && !isError && today && (
          <>
            {/* Title block (same vibe as your design) */}
            <div className="space-y-2">
              <p className="text-sm font-semibold  uppercase tracking-widest">
                Today
              </p>
              <p className="text-2xl font-bold ">{today.readable}</p>
              <Moon className="mx-auto  text-amber-400 " size={32} />
            </div>

            <div className=" text-slate-400 ">Today&apos;s Prayer Timings</div>

            {/* Prayer tiles */}
            {timings && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {order.map((prayer) => {
                  return (
                    <div
                      key={prayer}
                      className="rounded-xl p-5 text-center space-y-3  border "
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider t">
                        {prayer}
                      </p>
                      <p className=" font-bold ">{timings[prayer]}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
