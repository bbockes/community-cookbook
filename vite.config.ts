import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.GOOGLE_BOOKS_API_KEY || env.VITE_GOOGLE_BOOKS_API_KEY

  if (!apiKey) {
    console.warn(
      '\n[community-cookbook] GOOGLE_BOOKS_API_KEY is not set in .env.local.\n' +
        'Google Books requests will use the shared quota and hit rate limits quickly.\n' +
        'Copy .env.example to .env.local, add your key, then restart the dev server.\n'
    )
  }

  function injectApiKey(path: string): string {
    const rewritten = path.replace(/^\/api\/google-books/, '/books/v1/volumes')
    if (!apiKey || /([?&])key=/.test(rewritten)) return rewritten
    const separator = rewritten.includes('?') ? '&' : '?'
    return `${rewritten}${separator}key=${encodeURIComponent(apiKey)}`
  }

  return {
    plugins: [react()],
    define: {
      __BOOKS_API_KEY_CONFIGURED__: JSON.stringify(Boolean(apiKey)),
    },
    server: {
      proxy: {
        '/api/google-books': {
          target: 'https://www.googleapis.com',
          changeOrigin: true,
          rewrite: injectApiKey,
        },
      },
    },
  }
})
