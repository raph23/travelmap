import { createClient } from '@neon/neon-js'
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters'

const authUrl = (import.meta.env.VITE_NEON_AUTH_URL as string | undefined)?.trim()
const dataApiUrl = (import.meta.env.VITE_NEON_DATA_API_URL as string | undefined)?.trim()

export const editorId = (import.meta.env.VITE_NEON_EDITOR_ID as string | undefined)?.trim()

export const neon = authUrl && dataApiUrl
  ? createClient({
      auth: { url: authUrl, adapter: BetterAuthReactAdapter(), allowAnonymous: true },
      dataApi: { url: dataApiUrl },
    })
  : null

export type NeonClient = NonNullable<typeof neon>
