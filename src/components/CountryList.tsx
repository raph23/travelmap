import { useState } from 'react'
import { COUNTRIES } from '../data/countries'

interface Props {
  visited: Set<string>
  canEdit: boolean
  onToggle: (id: string) => void
}

export default function CountryList({ visited, canEdit, onToggle }: Props) {
  const [q, setQ] = useState('')
  const matches = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="list">
      <input placeholder="Search countries…" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul>
        {matches.map((c) => (
          <li key={c.id}>
            <label>
              <input
                type="checkbox"
                checked={visited.has(c.id)}
                disabled={!canEdit}
                onChange={() => onToggle(c.id)}
              />
              {c.name}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
