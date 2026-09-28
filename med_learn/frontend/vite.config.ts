import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned: auth/landing app. med_app takes 5174.
    // Without this, Vite assigns ports by START ORDER and the
    // login/signup redirect to /App would randomly break.
    port: 5173,
    strictPort: true,
  },
})
