import raw from './countries.json'

export interface Country {
  id: string // ISO 3166-1 numeric, zero-padded; matches world-atlas feature ids
  alpha3: string
  name: string
}

export const COUNTRIES: Country[] = raw
export const COUNTRY_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]))
