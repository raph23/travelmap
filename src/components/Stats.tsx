import { COUNTRIES } from '../data/countries'
import { VISIT_GROUPS, type VisitGroup, type Visits } from '../data/visits'

interface Props {
  visits?: ReadonlyMap<string, Visits>
  activeGroup?: VisitGroup
  onSelect?: (group: VisitGroup) => void
}

export default function Stats({ visits, activeGroup, onSelect }: Props) {
  const loading = visits === undefined

  return (
    <div
      className="stats-grid"
      role="group"
      aria-label={onSelect ? 'Choose which visits to show on the map' : 'Travel progress'}
      aria-hidden={loading || undefined}
      data-loading={loading || undefined}
    >
      {VISIT_GROUPS.map(({ id, label }) => {
        const count = visits ? COUNTRIES.filter((country) => visits.get(country.id)?.[id]).length : 0
        const pct = (count / COUNTRIES.length) * 100
        const summary = (
          <>
            <span className="stats-label">{label}</span>
            <strong className="big">{pct.toFixed(1)}%</strong>
            <span className="stats-count"><strong>{count}</strong> of {COUNTRIES.length}{' '}<span>countries</span></span>
            <span className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          </>
        )

        return onSelect && !loading ? (
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
