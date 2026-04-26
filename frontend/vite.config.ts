import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'sonner'],
          'tiptap': [
            '@tiptap/react', 
            '@tiptap/starter-kit', 
            '@tiptap/extension-table', 
            '@tiptap/extension-bubble-menu',
            '@tiptap/extension-code-block-lowlight'
          ],
          'viz': ['mermaid', 'chart.js', 'katex'],
          'lowlight': ['lowlight']
        }
      }
    },
    chunkSizeWarningLimit: 800, // Slightly higher limit after chunking
  }
})
