import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  root: 'ui',
  base: './',
  plugins: [vue()],
  build: {
    outDir: '../NetMock/ui',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        tab: path.resolve(__dirname, 'ui/tab.html'),
        popup: path.resolve(__dirname, 'ui/popup.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
