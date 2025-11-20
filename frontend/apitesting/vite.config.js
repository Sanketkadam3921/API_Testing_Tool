import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Show ESLint errors as overlay in development
  server: {
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  build: {
    // Fail build on lint errors
    rollupOptions: {
      // eslint-disable-next-line no-unused-vars
      onwarn(_warning, _warn) {
        // Suppress warnings during build if needed
      },
    },
  },
})
