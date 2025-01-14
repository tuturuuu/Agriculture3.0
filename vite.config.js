import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Resolve Popper.js for Bootstrap
  resolve: {
    alias: {
      '@popperjs/core': './node_modules/@popperjs/core/dist/umd/popper.js',
    }
  }
})
