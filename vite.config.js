/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'gzip': ['fflate'],
          'gpt-tokenizer': ['gpt-tokenizer'],
          'toon': ['@toon-format/toon'],
          'motion': ['framer-motion'],
          'gsap': ['gsap'],
          'lenis': ['lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  worker: {
    format: 'es',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
