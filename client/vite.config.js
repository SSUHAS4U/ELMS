import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Raise warning threshold since we're now splitting properly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — always needed, cache aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts and data-viz — only loaded on dashboard/report pages
          'vendor-charts': ['recharts', 'react-countup', 'react-circular-progressbar', 'react-calendar-heatmap'],
          // Animation — used across many pages but separate from core
          'vendor-motion': ['framer-motion'],
          // UI primitives
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'sonner',
            'cmdk',
          ],
          // Table
          'vendor-table': ['@tanstack/react-table'],
          // Date utilities
          'vendor-dates': ['date-fns', 'react-day-picker'],
          // Realtime & HTTP
          'vendor-network': ['axios', 'socket.io-client'],
          // State
          'vendor-state': ['zustand', 'zod'],
        },
      },
    },
  },
});
