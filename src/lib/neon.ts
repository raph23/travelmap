import { createClient } from '@neon/neon-js'
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters'

const authUrl = (import.meta.env.VITE_NEON_AUTH_URL as string | undefined)?.trim()
const dataApiUrl = (import.meta.env.VITE_NEON_DATA_API_URL as string | undefined)?.trim()

export const neon = authUrl && dataApiUrl
  ? createClient({
      auth: { url: authUrl, adapter: BetterAuthReactAdapter(), allowAnonymous: true },
      dataApi: { url: dataApiUrl },
    })
  : null

export type NeonClient = NonNullable<typeof neon>

function readTokenClaims(token: string | undefined) {
  const segments = token?.split('.')
  if (segments?.length !== 3) return null

  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)) as { sub?: string; exp?: number } | null
  } catch {
    return null
  }
}

export function createEditorDataApi(client: NeonClient, userId: string, sessionToken: string | undefined) {
  if (!dataApiUrl) return null
  let token = sessionToken

  return createClient({
    dataApi: {
      url: dataApiUrl,
      async getToken() {
        // Keep editor requests tied to the account shown in the editor. The Data API verifies the JWT.
        const claims = readTokenClaims(token)
        if (claims?.sub === userId && typeof claims.exp === 'number' && claims.exp * 1000 > Date.now() + 10_000) {
          return token ?? null
        }

        const { data, error } = await client.auth.$fetch<{ token?: string }>('/token', { method: 'GET' })
        const refreshed = data?.token
        if (error || !refreshed || readTokenClaims(refreshed)?.sub !== userId) {
          throw new Error('Could not verify this sign-in. Sign out and request a fresh link.')
        }

        token = refreshed
        return refreshed
      },
    },
  })
}

export type EditorDataApi = NonNullable<ReturnType<typeof createEditorDataApi>>
