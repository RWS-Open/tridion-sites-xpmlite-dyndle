// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    lib:{
      entry:"src/index.ts",
      name: 'XpmEditor',
      fileName: () => 'xpmlite-editor.bundle.js',
      formats: ['iife']
    },
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        entryFileNames: 'xpmlite-editor.bundle.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'xpmlite-editor.bundle.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      mangle: true,
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
});