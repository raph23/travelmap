import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { COUNTRY_BY_ID, type Country } from '../data/countries'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

export function useVisited(canEdit: boolean) {
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('visited_countries')
      .select('iso_numeric')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setVisited(new Set(data.map((r) => r.iso_numeric as string)))
        setLoading(false)
      })
  }, [])

  const toggle = useCallback(
    async (id: string) => {
      const country: Country | undefined = COUNTRY_BY_ID.get(id)
      if (!supabase || !canEdit || !country) return
      const wasVisited = visited.has(id)
      const apply = (on: boolean) =>
        setVisited((prev) => {
          const next = new Set(prev)
          if (on) next.add(id)
          else next.delete(id)
          return next
        })
      apply(!wasVisited) // optimistic
      const { error } = wasVisited
        ? await supabase.from('visited_countries').delete().eq('iso_numeric', id)
        : await supabase
            .from('visited_countries')
            .insert({ iso_numeric: id, iso_alpha3: country.alpha3, name: country.name })
      if (error) {
        apply(wasVisited) // roll back
        setError(error.message)
      } else setError(null)
    },
    [canEdit, visited],
  )

  return { visited, loading, error, toggle }
}
