import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

export type LocationValue = {
  country: string
  city: string
}

type CityOption = {
  id: string
  label: string
}

type CountryOption = {
  code: string
  label: string
  cities: CityOption[]
}

const DEFAULT_OPTIONS: CountryOption[] = [
  {
    code: 'NMK',
    label: 'North Macedonia',
    cities: [
      { id: 'Tetovo', label: 'Tetovo' },
      { id: 'Skopje', label: 'Skopje' },
    ],
  },
  {
    code: 'AT',
    label: 'Austria',
    cities: [{ id: 'Vienna', label: 'Vienna' }],
  },
]

export type CountryCitySelectorProps = {
  value: LocationValue
  onChange: (value: LocationValue) => void
  options?: CountryOption[]
}

export function CountryCitySelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: CountryCitySelectorProps) {
  const countries = options

  const selectedCountry = countries.find((c) => c.code === value.country)
  const citiesForSelectedCountry = selectedCountry?.cities ?? []
  const selectedCity = citiesForSelectedCountry.find((c) => c.id === value.city)

  return (
    <div className="p-8 bg-white rounded-md justify-center flex flex-col gap-4 md:flex-row md:items-end">
      {/* Country combobox */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground ">Country</label>

        <Combobox<CountryOption>
          items={countries}
          itemToStringValue={(country) => country.label}
          value={selectedCountry}
          onValueChange={(country) => {
            const nextCountry = country?.code ?? ''

            const nextCity = country?.cities[0]?.id ?? ''

            onChange({
              country: nextCountry,

              city: nextCity,
            })
          }}
        >
          <ComboboxInput placeholder="Select a country" />

          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>

            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.code} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      {/* City combobox */}

      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">City</label>

        <Combobox<CityOption>
          items={citiesForSelectedCountry}
          itemToStringValue={(city) => city.label}
          value={selectedCity}
          onValueChange={(city) => {
            const nextCity = city?.id ?? ''

            onChange({
              country: selectedCountry?.code ?? '',

              city: nextCity,
            })
          }}
        >
          <ComboboxInput
            placeholder={
              selectedCountry ? 'Select a city' : 'Select a country first'
            }
            disabled={!selectedCountry || citiesForSelectedCountry.length === 0}
          />

          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>

            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}
