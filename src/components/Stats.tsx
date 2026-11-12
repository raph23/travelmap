import { COUNTRIES } from '../data/countries'

export default function Stats({ visited }: { visited: Set<string> }) {
  const count = COUNTRIES.filter((c) => visited.has(c.id)).length
  const pct = (count / COUNTRIES.length) * 100
  return (
    <section className="stats">
      <div className="big">{pct.toFixed(1)}%</div>
      <div>
        <strong>{count}</strong> of {COUNTRIES.length} countries visited
      </div>
      <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <small>Counts the 193 UN member states plus Vatican City and Palestine.</small>
    </section>
  )
}
