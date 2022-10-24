import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/ww-code-cell.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    }
  }
})
