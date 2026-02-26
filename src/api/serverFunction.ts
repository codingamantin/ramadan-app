import { queryOptions, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { AxiosInstance } from 'axios'
import { client } from './client'

// --------------------
// TYPES
// --------------------

export type PrayerName =
  | 'Fajr'
  | 'Sunrise'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Isha'

export type PrayerTimings = Record<PrayerName, string>

export type RamadanDay = {
  readable: string
  timestamp: string
  gregorianDate: string
  hijriDate: string
  hijriDay: number
  timings: PrayerTimings
}

export type RamadanCalendarResult = {
  location: {
    city: string
    country: string
    timezone: string
  }
  hijriYear: number
  shiftDays: number
  days: RamadanDay[]
}

// --------------------
// INPUT (only what you want)
// --------------------

const RamadanInputSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().optional().default('CET'),
})

export type RamadanInput = z.infer<typeof RamadanInputSchema>

// --------------------
// SERVER FN HELPERS
// --------------------

const PRAYERS: PrayerName[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

function normalizeTiming(value: unknown): string {
  if (typeof value !== 'string') return ''
  const match = value.match(/^(\d{1,2}:\d{2})/)
  return match ? match[1] : value
}

async function fetchHijriMonthByCity(opts: {
  client: AxiosInstance
  hijriYear: number
  hijriMonth: number
  city: string
  country: string
  method: string
  tune: number[]
}) {
  const { hijriYear, hijriMonth, city, country, method, tune } = opts
  const path = `/hijriCalendarByCity/${hijriYear}/${hijriMonth}`

  const res = await client.get(path, {
    params: { city, country, method, tune: tune.join(',') },
    headers: { Accept: 'application/json' },
  })

  const json = res.data
  if (json?.code !== 200 || !Array.isArray(json?.data)) {
    throw new Error(`Aladhan error: ${json?.status ?? 'Unknown error'}`)
  }

  return json.data as any[]
}

// --------------------
// SERVER FUNCTION
// --------------------

export const getRamadanCalendarByCity = createServerFn({ method: 'GET' })
  .inputValidator(RamadanInputSchema)
  .handler(async ({ data }): Promise<RamadanCalendarResult> => {
    const hijriYear = Number(process.env.HIJRI_YEAR)
    if (!hijriYear || Number.isNaN(hijriYear)) {
      throw new Error('HIJRI_YEAR env var is missing or invalid.')
    }

    const isVienna = data.city.toLowerCase() === 'vienna'
    const currentTune = isVienna
      ? [0, 0, -7, 6, 5, 6, 0, -6, 0]
      : [0, 0, 0, 0, 0, 0, 0, 0, 0]

    const shiftDays = 1

    // 1) Ramadan (Hijri month 9)
    let ramadanRaw = await fetchHijriMonthByCity({
      client,
      hijriYear,
      hijriMonth: 9,
      city: data.city,
      country: data.country,
      method: '2',
      tune: currentTune,
    })

    if (ramadanRaw.length === 0) throw new Error('No Ramadan data returned.')

    // 2) Always shift: drop first day(s) and append from Shawwal (month 10)
    ramadanRaw = ramadanRaw.slice(shiftDays)

    const shawwalRaw = await fetchHijriMonthByCity({
      client,
      hijriYear,
      hijriMonth: 10,
      city: data.city,
      country: data.country,
      method: '2',
      tune: currentTune,
    })

    if (shawwalRaw.length < shiftDays) {
      throw new Error(
        'Not enough days in next Hijri month to append after shifting.',
      )
    }

    ramadanRaw = ramadanRaw.concat(shawwalRaw.slice(0, shiftDays))

    const days: RamadanDay[] = ramadanRaw.map((d: any) => {
      const rawTimings = d?.timings ?? {}
      const timings: Partial<PrayerTimings> = {}

      for (const p of PRAYERS) {
        timings[p] = normalizeTiming(rawTimings[p])
      }

      return {
        readable: String(d?.date?.readable ?? ''),
        timestamp: String(d?.date?.timestamp ?? ''),
        gregorianDate: String(d?.date?.gregorian?.date ?? ''),
        hijriDate: String(d?.date?.hijri?.date ?? ''),
        hijriDay: Number(d?.date?.hijri?.day ?? 0),
        timings: timings as PrayerTimings,
      }
    })

    return {
      location: {
        city: data.city,
        country: data.country,
        timezone: data.timezone,
      },
      hijriYear,
      shiftDays,
      days,
    }
  })

// --------------------
// API CALL (client wrapper)
// --------------------

export const fetchRamadanCalendar = (input: RamadanInput) => {
  return getRamadanCalendarByCity({ data: input })
}

// --------------------
// QUERY OPTIONS
// --------------------

export const fetchRamadanCalendarQueryOptions = (input?: RamadanInput) =>
  queryOptions({
    queryKey: [
      'prayer-times',
      'ramadan',
      input?.city,
      input?.country,
      input?.timezone ?? 'CET',
    ],
    queryFn: () => fetchRamadanCalendar(input!),
    enabled: Boolean(input?.city && input.country),
    staleTime: 3_600_000, // 1 hour
  })

// --------------------
// QUERY HOOK
// --------------------

export const useRamadanCalendar = (input?: RamadanInput) => {
  return useQuery(fetchRamadanCalendarQueryOptions(input))
  console.log('useRamadanCalendar called with input:', input)
}
