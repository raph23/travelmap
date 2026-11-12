import Stats from '../components/Stats'
import WorldMap from '../components/WorldMap'
import { useVisited } from '../hooks/useVisited'
import { supabaseConfigured } from '../lib/supabase'

export default function HomePage() {
  const { visited, loading, error } = useVisited(false)
  return (
    <main>
      <header>
        <h1>Lena and Raph’s travel map</h1>
      </header>
      {!supabaseConfigured && (
        <p className="notice">
          Supabase isn’t configured. Copy <code>.env.example</code> to <code>.env.local</code> and fill it in (see README).
        </p>
      )}
      {error && <p className="notice error">{error}</p>}
      <Stats visited={visited} />
      <WorldMap visited={visited} />
      {loading && <p>Loading…</p>}
    </main>
  )
}
