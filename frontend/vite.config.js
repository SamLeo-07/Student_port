import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    envDir: '../',
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5002',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    icons: ['lucide-react'],
                    three: ['three', '@react-three/fiber', '@react-three/drei'],
                    ui: ['framer-motion']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
