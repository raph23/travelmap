import AuthButton from '../components/AuthButton'
import CountryList from '../components/CountryList'
import Stats from '../components/Stats'
import { navigate } from '../App'
import { useVisited } from '../hooks/useVisited'
import { editorId, neon, type NeonClient } from '../lib/neon'

export default function EditPage() {
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
      {neon ? <Editor client={neon} /> : <p className="notice">Configure Neon to edit countries. See the README.</p>}
    </main>
  )
}

function Editor({ client }: { client: NeonClient }) {
  const { data: session, isPending, error: sessionError } = client.auth.useSession()
  const canEdit = Boolean(editorId && session?.user.id === editorId)
  const { visited, loading, error, canToggle, toggle } = useVisited(canEdit)

  return (
    <>
      {isPending ? <p role="status">Checking sign-in…</p> : <AuthButton auth={client.auth} signedInEmail={session?.user.email} />}
      {sessionError && <p className="notice error">{sessionError.message ?? 'Could not check sign-in.'}</p>}
      {!isPending && !session && <p className="notice">Sign in to add or remove countries.</p>}
      {session && !canEdit && <p className="notice">This account has read-only access.</p>}
      {error && <p className="notice error">{error}</p>}
      {loading && <p role="status">Loading…</p>}
      <Stats visited={visited} />
      <CountryList visited={visited} canEdit={canToggle} onToggle={toggle} />
    </>
  )
}
