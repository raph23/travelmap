// Builds src/data/countries.json: 193 UN members + Vatican City + Palestine = 195.
import { readFileSync, writeFileSync } from 'node:fs'

const all = JSON.parse(readFileSync('node_modules/world-countries/countries.json', 'utf8'))
const EXTRA = new Set(['VAT', 'PSE'])
const list = all
  .filter((c) => c.unMember || EXTRA.has(c.cca3))
  .map((c) => ({ id: c.ccn3, alpha3: c.cca3, name: c.name.common }))
  .sort((a, b) => a.name.localeCompare(b.name))

writeFileSync('src/data/countries.json', JSON.stringify(list, null, 1) + '\n')
console.log(`Wrote ${list.length} countries`)
