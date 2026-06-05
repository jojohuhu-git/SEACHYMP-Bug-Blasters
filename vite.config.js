import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match the GitHub Pages repo path:
// https://<user>.github.io/SEACHYMP-Bug-Blasters/
export default defineConfig({
  base: '/SEACHYMP-Bug-Blasters/',
  plugins: [react()],
})
