import Stats from '../components/Stats'
import WorldMap from '../components/WorldMap'
import { useVisited } from '../hooks/useVisited'
import { neon } from '../lib/neon'

export default function HomePage() {
  const { visited, loading, error } = useVisited(false)
  return (
    <main>
      <header>
        <h1>Lena and Raph’s travel map</h1>
      </header>
      {!neon && (
        <p className="notice">
          Configure Neon to load visited countries. See the README.
        </p>
      )}
      {error && <p className="notice error">{error}</p>}
      <Stats visited={visited} />
      <WorldMap visited={visited} />
      {loading && <p>Loading…</p>}
    </main>
  )
}
