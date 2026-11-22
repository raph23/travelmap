import { useState } from 'react'
import { COUNTRIES } from '../data/countries'
import { VISIT_GROUPS, type VisitGroup, type Visits } from '../data/visits'

interface Props {
  visits: ReadonlyMap<string, Visits>
  canEdit: boolean
  pending: ReadonlySet<string>
  onChange: (id: string, group: VisitGroup, checked: boolean) => void
}

export default function CountryList({ visits, canEdit, pending, onChange }: Props) {
  const [q, setQ] = useState('')
  const matches = COUNTRIES.filter((country) => country.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <section className="list" aria-label="Countries">
      {canEdit && <p>A trip together counts for both of you. Clearing Together keeps both individual visits.</p>}
      <input type="search" aria-label="Search countries" placeholder="Search countries…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="country-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Country</th>
              {VISIT_GROUPS.map(({ id, label }) => <th key={id} scope="col" data-group={id}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {matches.map(({ id, name }) => (
              <tr key={id} aria-busy={pending.has(id)}>
                <th scope="row">{name}</th>
                {VISIT_GROUPS.map(({ id: group, label }) => (
                  <td key={group} data-group={group}>
                    <input
                      type="checkbox"
                      aria-label={group === 'together' ? `Visited ${name} together` : `${label} visited ${name}`}
                      checked={visits.get(id)?.[group] ?? false}
                      disabled={!canEdit || pending.has(id)}
                      onChange={(e) => onChange(id, group, e.currentTarget.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {matches.length === 0 && <p>No countries match your search.</p>}
      </div>
    </section>
  )
}
