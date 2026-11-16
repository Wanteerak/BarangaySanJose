import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
    // Pinapayagan ang HTTPS tunnel host (trycloudflare.com)
    allowedHosts: true,
    proxy: {
      // Pinapadaan ang /api sa Express backend (port 3001)
      // para gumana kahit HTTPS ang site (walang mixed-content block)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
