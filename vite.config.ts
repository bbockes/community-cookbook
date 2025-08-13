import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '.replit.dev',
      'bd6c7dd3-8a0c-4951-8737-ad7d534c0dc0-00-24ogb6nhgbk5m.worf.replit.dev'
    ]
  }
})
