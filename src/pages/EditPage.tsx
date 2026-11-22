import { useEffect, useState } from 'react'
import AuthButton from '../components/AuthButton'
import CountryList from '../components/CountryList'
import Stats from '../components/Stats'
import { navigate } from '../App'
import type { EditorScope } from '../data/visits'
import { useVisited } from '../hooks/useVisited'
import { neon, type NeonClient } from '../lib/neon'

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
  const userId = session?.user.id
  const [access, setAccess] = useState<{ userId: string; scope: EditorScope | null; error?: string } | null>(null)

  useEffect(() => {
    if (!userId) {
      setAccess(null)
      return
    }

    const id = userId
    let active = true
    async function loadAccess() {
      try {
        const { data, error } = await client.rpc('get_visit_editor_scope')
        if (error) throw new Error(error.message)
        const scope = data === 'owner' || data === 'elena' ? data : null
        if (active) setAccess({ userId: id, scope })
      } catch (error) {
        if (active) setAccess({ userId: id, scope: null, error: error instanceof Error ? error.message : 'Could not check edit access.' })
      }
    }

    void loadAccess()
    return () => { active = false }
  }, [client, userId])

  const currentAccess = access?.userId === userId ? access : null
  const { visits, loading, loaded, error, editableScope, pending, setVisit } = useVisited(currentAccess?.scope ?? null)

  return (
    <>
      {isPending ? <p role="status">Checking sign-in…</p> : <AuthButton auth={client.auth} signedInEmail={session?.user.email} />}
      {sessionError && <p className="notice error">{sessionError.message ?? 'Could not check sign-in.'}</p>}
      {!isPending && !session && <p className="notice">Sign in to add or remove countries.</p>}
      {userId && !currentAccess && <p role="status">Checking edit access…</p>}
      {currentAccess?.error && <p className="notice error">{currentAccess.error}</p>}
      {currentAccess && !currentAccess.scope && !currentAccess.error && <p className="notice">This account has read-only access.</p>}
      {error && <p className="notice error">{error}</p>}
      {loading && <p role="status">Loading…</p>}
      {loaded && <Stats visits={visits} />}
      <CountryList visits={visits} scope={editableScope} pending={pending} onChange={setVisit} />
    </>
  )
}
