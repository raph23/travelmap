import { useState, type FormEvent } from 'react'
import type { NeonClient } from '../lib/neon'

export default function AuthButton({ auth, signedInEmail }: {
  auth: NeonClient['auth']
  signedInEmail?: string
}) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const signOut = async () => {
    setPending(true)
    setMsg(null)
    try {
      const { error } = await auth.signOut()
      if (error) setMsg(error.message ?? 'Could not sign out.')
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not sign out.')
    } finally {
      setPending(false)
    }
  }

  if (signedInEmail) {
    return (
      <div className="auth">
        {signedInEmail} <button disabled={pending} onClick={signOut}>Sign out</button>
        {msg && <small role="status">{msg}</small>}
      </div>
    )
  }

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setMsg(null)
    try {
      // The SDK ships the Magic Link endpoint but does not expose it in its React adapter types.
      const { error } = await auth.$fetch('/sign-in/magic-link', {
        method: 'POST',
        body: {
          email: email.trim(),
          callbackURL: new URL('/edit', window.location.origin).href,
        },
      })
      setMsg(error ? error.message ?? 'Could not send the sign-in link.' : 'Check your email for the sign-in link.')
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not send the sign-in link.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="auth" onSubmit={send}>
      <input type="email" required aria-label="Email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" disabled={pending}>Sign in to edit</button>
      {msg && <small role="status">{msg}</small>}
    </form>
  )
}
