import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned: resume checker, serves the /App route that
    // login/signup redirect to. med_learn takes 5173.
    port: 5174,
    strictPort: true,
  },
})
