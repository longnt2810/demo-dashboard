import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng: Giúp đường dẫn hoạt động đúng trên GitHub Pages sub-folder
  build: {
    outDir: 'dist',
  }
})