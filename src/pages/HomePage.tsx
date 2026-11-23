import { useState } from 'react'
import Stats from '../components/Stats'
import WorldMap from '../components/WorldMap'
import type { VisitGroup } from '../data/visits'
import { useVisited } from '../hooks/useVisited'
import { neon } from '../lib/neon'

export default function HomePage() {
  const [group, setGroup] = useState<VisitGroup>('together')
  const { visits, loading, loaded, error } = useVisited(null)
  const visibleCountries = new Set<string>()
  for (const [id, flags] of visits) {
    if (flags[group]) visibleCountries.add(id)
  }
  return (
    <main>
      <header>
        <h1>Elena and Raph’s travel map</h1>
      </header>
      {!neon && (
        <p className="notice">
          Configure Neon to load visited countries. See the README.
        </p>
      )}
      {error && <p className="notice error">{error}</p>}
      {loaded && <Stats visits={visits} activeGroup={group} onSelect={setGroup} />}
      <WorldMap visited={visibleCountries} group={group} />
      {loading && <p role="status">Loading…</p>}
    </main>
  )
}
