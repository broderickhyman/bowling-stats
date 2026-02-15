import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // visualizer({
    //   open: true, // Opens automatically after build
    //   gzipSize: true, // Shows gzipped sizes (what actually matters)
    //   brotliSize: true, // Shows brotli compression too
    //   filename: 'bundle-analysis.html',
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
