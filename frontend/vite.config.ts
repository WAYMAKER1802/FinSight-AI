import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/ (Restarted to pick up tradingview widgets)
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'InvestIQ - AI Portfolio Advisor',
        short_name: 'InvestIQ',
        description: 'AI-driven financial planning and portfolio management.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@'          : path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages'     : path.resolve(__dirname, './src/pages'),
      '@hooks'     : path.resolve(__dirname, './src/hooks'),
      '@utils'     : path.resolve(__dirname, './src/utils'),
      '@types'     : path.resolve(__dirname, './src/types'),
      '@store'     : path.resolve(__dirname, './src/store'),
      '@assets'    : path.resolve(__dirname, './src/assets'),
      '@api'       : path.resolve(__dirname, './src/api'),
    },
  },
  server: {
    port : 3000,
    open : true,
    proxy: {
      '/api': {
        target     : 'http://localhost:5005',
        changeOrigin: true,
        secure     : false,
      },
    },
  },
  build: {
    outDir        : 'dist',
    sourcemap     : true,
    rollupOptions : {
      output: {
        manualChunks: {
          react    : ['react', 'react-dom', 'react-router-dom'],
          charts   : ['recharts'],
          animation: ['framer-motion'],
          ui       : ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          query    : ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'framer-motion'],
  },
});
