import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  server: {
    proxy: {
      // proxy dla REST API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // proxy dla SockJS/WebSocket
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,            // <–– to włącza proxy dla websocketów
        changeOrigin: true,
      },
    }
  }
})

