import { COUNTRIES } from '../data/countries'
import { VISIT_GROUPS, type VisitGroup, type Visits } from '../data/visits'

interface Props {
  visits: ReadonlyMap<string, Visits>
  activeGroup?: VisitGroup
  onSelect?: (group: VisitGroup) => void
}

export default function Stats({ visits, activeGroup, onSelect }: Props) {
  return (
    <div className="stats-grid" role="group" aria-label={onSelect ? 'Choose which visits to show on the map' : 'Travel progress'}>
      {VISIT_GROUPS.map(({ id, label }) => {
        const count = COUNTRIES.filter((country) => visits.get(country.id)?.[id]).length
        const pct = (count / COUNTRIES.length) * 100
        const summary = (
          <>
            <span className="stats-label">{label}</span>
            <strong className="big">{pct.toFixed(1)}%</strong>
            <span className="stats-count"><strong>{count}</strong> of {COUNTRIES.length} countries</span>
            <span className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          </>
        )

        return onSelect ? (
          <button key={id} type="button" className="stats" data-group={id} aria-pressed={activeGroup === id} onClick={() => onSelect(id)}>
            {summary}
          </button>
        ) : (
          <div key={id} className="stats" data-group={id}>{summary}</div>
        )
      })}
    </div>
  )
}
