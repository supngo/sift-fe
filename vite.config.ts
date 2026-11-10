import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // the backend's CORS allows http://localhost:5173; fail instead of silently moving to another port
    port: 5173,
    strictPort: true,
  },
})
