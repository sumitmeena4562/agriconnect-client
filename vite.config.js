import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiUrl = env.VITE_API_URL || ''
  const host = apiUrl.replace(/^https?:\/\//, '').split('/')[0]
  const isNgrok = host.includes('ngrok')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: true,
      hmr: isNgrok ? {
        host,
        clientPort: 443,
        protocol: 'wss',
      } : true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
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

// Force Vite restart - trigger HMR cache clear
