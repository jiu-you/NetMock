import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  root: 'ui-src',
  base: './',
  plugins: [vue()],
  build: {
    outDir: '../ui',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        tab: path.resolve(__dirname, 'ui-src/tab.html'),
        popup: path.resolve(__dirname, 'ui-src/popup.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
