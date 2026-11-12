import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function AuthButton({ session }: { session: Session | null }) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  if (!supabase) return null

  if (session) {
    return (
      <div className="auth">
        {session.user.email} <button onClick={() => supabase!.auth.signOut()}>Sign out</button>
      </div>
    )
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setMsg(error ? error.message : 'Check your email for the sign-in link.')
  }

  return (
    <form className="auth" onSubmit={send}>
      <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Sign in to edit</button>
      {msg && <small>{msg}</small>}
    </form>
  )
}
