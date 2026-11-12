import AuthButton from '../components/AuthButton'
import CountryList from '../components/CountryList'
import Stats from '../components/Stats'
import { navigate } from '../App'
import { useSession, useVisited } from '../hooks/useVisited'

export default function EditPage() {
  const session = useSession()
  const canEdit = Boolean(session)
  const { visited, error, toggle } = useVisited(canEdit)
  return (
    <main>
      <header>
        <h1>Edit countries</h1>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigate('/')
          }}
        >
          ← Back to map
        </a>
      </header>
      <AuthButton session={session} />
      {!canEdit && <p className="notice">Sign in to add or remove countries.</p>}
      {error && <p className="notice error">{error}</p>}
      <Stats visited={visited} />
      <CountryList visited={visited} canEdit={canEdit} onToggle={toggle} />
    </main>
  )
}
