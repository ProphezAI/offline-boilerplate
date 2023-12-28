import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  plugins: [
    basicSsl()
  ]
});
