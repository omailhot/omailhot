import { createClient } from '@neondatabase/neon-js'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

if (!authUrl || !dataApiUrl) {
  // Keep the app booting, but fail clearly at first DB call.
  console.warn('Missing VITE_NEON_AUTH_URL or VITE_NEON_DATA_API_URL')
}

export const neonClient = createClient({
  auth: {
    url: authUrl ?? '',
  },
  dataApi: {
    url: dataApiUrl ?? '',
  },
})
