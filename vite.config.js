/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      allowedHosts: true,

      // ✅ HMR — let Vite handle it automatically on same port
      // Do NOT set hmrPort/clientPort separately — causes WebSocket mismatch on Windows
      hmr: {
        overlay: true,
      },

      // ✅ Fast Windows file watching — chokidar polling
      watch: {
        usePolling: true,
        interval: 100,
        binaryInterval: 300,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      },

      proxy: {
        '/api/v1': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') return;
            });
          }
        },
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') return;
            });
          }
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
  }
})
