import { useCallback, useEffect, useRef, useState } from 'react'
import { neon } from '../lib/neon'
import { COUNTRY_BY_ID } from '../data/countries'

export function useVisited(canEdit: boolean) {
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(Boolean(neon))
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = useRef(new Set<string>())

  useEffect(() => {
    if (!neon) return
    const client = neon
    let active = true

    async function load() {
      try {
        const { data, error } = await client.from('visited_countries').select('iso_numeric')
        if (error) throw new Error(error.message)
        if (active) {
          setVisited(new Set(data.map((row) => row.iso_numeric as string)))
          setLoaded(true)
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : 'Could not load visited countries.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [])

  const canToggle = canEdit && loaded
  const toggle = useCallback(
    async (id: string) => {
      const country = COUNTRY_BY_ID.get(id)
      if (!neon || !canToggle || !country || pending.current.has(id)) return
      pending.current.add(id)
      const wasVisited = visited.has(id)
      const apply = (on: boolean) =>
        setVisited((prev) => {
          const next = new Set(prev)
          if (on) next.add(id)
          else next.delete(id)
          return next
        })
      apply(!wasVisited) // optimistic
      try {
        const { error } = wasVisited
          ? await neon.from('visited_countries').delete().eq('iso_numeric', id)
          : await neon.from('visited_countries').upsert(
              { iso_numeric: id, iso_alpha3: country.alpha3, name: country.name },
              { onConflict: 'iso_numeric', ignoreDuplicates: true },
            )
        if (error) throw new Error(error.message)
        setError(null)
      } catch (error) {
        apply(wasVisited) // roll back
        setError(error instanceof Error ? error.message : 'Could not save the country.')
      } finally {
        pending.current.delete(id)
      }
    },
    [canToggle, visited],
  )

  return { visited, loading, error, canToggle, toggle }
}
