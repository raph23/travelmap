import AuthButton from './components/AuthButton'
import CountryList from './components/CountryList'
import Stats from './components/Stats'
import WorldMap from './components/WorldMap'
import { useSession, useVisited } from './hooks/useVisited'
import { supabaseConfigured } from './lib/supabase'

export default function App() {
  const session = useSession()
  const canEdit = Boolean(session)
  const { visited, loading, error, toggle } = useVisited(canEdit)

  return (
    <main>
      <header>
        <h1>Our Travel Map</h1>
        <AuthButton session={session} />
      </header>
      {!supabaseConfigured && (
        <p className="notice">
          Supabase isn’t configured. Copy <code>.env.example</code> to <code>.env.local</code> and fill it in (see README).
        </p>
      )}
      {error && <p className="notice error">{error}</p>}
      <Stats visited={visited} />
      <WorldMap visited={visited} canEdit={canEdit} onToggle={toggle} />
      {loading && <p>Loading…</p>}
      <CountryList visited={visited} canEdit={canEdit} onToggle={toggle} />
    </main>
  )
}
