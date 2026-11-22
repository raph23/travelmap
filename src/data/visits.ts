export const VISIT_GROUPS = [
  { id: 'raph', label: 'Raph' },
  { id: 'elena', label: 'Elena' },
  { id: 'together', label: 'Together' },
] as const

export type VisitGroup = (typeof VISIT_GROUPS)[number]['id']
export type Visits = Record<VisitGroup, boolean>
export type EditorScope = 'owner' | 'elena'

export const NO_VISITS: Visits = { raph: false, elena: false, together: false }

export function canEditVisit(scope: EditorScope | null, group: VisitGroup, visits?: Visits) {
  return scope === 'owner' || (scope === 'elena' && group === 'elena' && !visits?.together)
}

export function changeVisit(visits: Visits, group: VisitGroup, checked: boolean): Visits {
  if (group === 'together' && checked) return { raph: true, elena: true, together: true }
  return { ...visits, together: visits.together && checked, [group]: checked }
}
