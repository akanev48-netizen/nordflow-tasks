import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nordflow-tasks/',
  server: {
    port: 3000
  }
})
