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
          'pdf': ['pdfjs-dist'],
          'excel': ['xlsx'],
          'docx': ['mammoth'],
          'data': ['papaparse', 'fflate'],
          'tokenizer': ['gpt-tokenizer'],
          'toon': ['@toon-format/toon'],
          'motion': ['framer-motion'],
          'gsap': ['gsap'],
          'lenis': ['lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Heavy libs are lazy-loaded
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['pdfjs-dist'], // Let it load dynamically
  },
  worker: {
    format: 'es',
  },
})
