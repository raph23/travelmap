import { createClient } from '@neon/neon-js'
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters'
import type { EditorScope } from '../data/visits'

const authUrl = (import.meta.env.VITE_NEON_AUTH_URL as string | undefined)?.trim()
const dataApiUrl = (import.meta.env.VITE_NEON_DATA_API_URL as string | undefined)?.trim()

export const neon = authUrl && dataApiUrl
  ? createClient({
      auth: { url: authUrl, adapter: BetterAuthReactAdapter(), allowAnonymous: true },
      dataApi: { url: dataApiUrl },
    })
  : null

export type NeonClient = NonNullable<typeof neon>

export async function getVisitEditorScope(client: NeonClient, signal: AbortSignal): Promise<EditorScope | null> {
  // The first permission check after a magic link can return an empty scope.
  for (const delay of [0, 300, 1000]) {
    if (delay) await new Promise<void>((resolve) => setTimeout(resolve, delay))
    if (signal.aborted) return null

    const { data, error } = await client.rpc('get_visit_editor_scope').abortSignal(signal)
    if (error) throw new Error(error.message)
    if (data === 'owner' || data === 'elena') return data
  }

  return null
}
