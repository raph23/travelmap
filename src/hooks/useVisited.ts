import { useCallback, useEffect, useRef, useState } from 'react'
import { neon } from '../lib/neon'
import { COUNTRY_BY_ID } from '../data/countries'
import { canEditVisit, changeVisit, NO_VISITS, type EditorScope, type VisitGroup, type Visits } from '../data/visits'

type VisitedCountry = Visits & { iso_numeric: string }

export function useVisited(scope: EditorScope | null) {
  const [visits, setVisits] = useState<Map<string, Visits>>(new Map())
  const [loading, setLoading] = useState(Boolean(neon))
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saving = useRef(new Set<string>())
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    if (!neon) return
    const client = neon
    let active = true

    async function load() {
      try {
        const { data, error } = await client.from('visited_countries').select('iso_numeric, raph, elena, together')
        if (error) throw new Error(error.message)
        if (active) {
          setVisits(new Map((data as VisitedCountry[]).map(({ iso_numeric, ...flags }) => [iso_numeric, flags])))
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

  const editableScope = loaded ? scope : null
  const setVisit = useCallback(
    async (id: string, group: VisitGroup, checked: boolean) => {
      const country = COUNTRY_BY_ID.get(id)
      const previous = visits.get(id) ?? NO_VISITS
      if (!neon || !country || !canEditVisit(editableScope, group, previous) || saving.current.has(id)) return
      saving.current.add(id)
      setPending(new Set(saving.current))

      const apply = (flags: Visits) =>
        setVisits((current) => {
          const next = new Map(current)
          if (flags.raph || flags.elena || flags.together) next.set(id, flags)
          else next.delete(id)
          return next
        })
      apply(changeVisit(previous, group, checked))
      try {
        const { data, error } = await neon.rpc('set_country_visit', {
          country_id: id,
          country_alpha3: country.alpha3,
          country_name: country.name,
          visit_group: group,
          checked,
        })
        if (error) throw new Error(error.message)
        if (!data) throw new Error('Could not save the country.')
        apply(data as Visits)
        setError(null)
      } catch (error) {
        apply(previous)
        setError(error instanceof Error ? error.message : 'Could not save the country.')
      } finally {
        saving.current.delete(id)
        setPending(new Set(saving.current))
      }
    },
    [editableScope, visits],
  )

  return { visits, loading, loaded, error, editableScope, pending, setVisit }
}
