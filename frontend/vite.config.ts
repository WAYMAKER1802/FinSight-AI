import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
        target     : 'http://localhost:5000',
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
