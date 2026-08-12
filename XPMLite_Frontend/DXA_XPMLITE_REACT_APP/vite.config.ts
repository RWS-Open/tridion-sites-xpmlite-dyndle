/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  build: {
    sourcemap:false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name !== undefined ? assetInfo.name.split(".") : [];
          let extType = info[info.length - 1] || "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          } else if (/woff|woff2/.test(extType)) {
            extType = "css";
          }
          return `content/xpmlite/${extType}/dxa-xpmlite.bundle.css`;
        },
        chunkFileNames: "content/xpmlite/js/dxa-xpmlite.bundle.js",
        entryFileNames: "content/xpmlite/js/dxa-xpmlite.bundle.js",
      },
    }
},
})
