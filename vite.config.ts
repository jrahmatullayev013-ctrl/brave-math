import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",          // barcha yo‘llar to‘g‘ri ishlashi uchun
  build: {
    outDir: "dist"    // Vercel default chiqish papkasi
  }
})
