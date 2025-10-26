import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Ouve em todas as interfaces
    watch: {
      usePolling: true // Habilita polling para o Docker
    }
  }
})
