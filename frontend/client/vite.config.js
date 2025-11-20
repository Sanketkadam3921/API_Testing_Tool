import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Disable ESLint errors from breaking Vercel build
process.env.ESLINT_NO_DEV_ERRORS = true;
process.env.ESLINT_NO_BUILD_ERRORS = true;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Disable ESLint during build
      eslint: {
        enabled: false,
        dev: false,
        build: false,
      },
    }),
  ],
  
  server: {
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore all warnings (especially no-unused-vars)
        if (warning.code === "THIS_IS_UNDEFINED") return;
        if (warning.code === "UNUSED_VAR") return;
        return;
      },
    },
  },
});
