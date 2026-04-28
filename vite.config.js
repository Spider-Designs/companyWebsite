import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const jsEntriesDir = path.resolve('src/js');
const inputEntries = Object.fromEntries(
  fs
    .readdirSync(jsEntriesDir)
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => {
      const entryName = fileName.replace(/\.js$/, '');
      return [entryName, path.join(jsEntriesDir, fileName)];
    })
);

export default defineConfig({
  appType: 'custom',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    manifest: true,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: inputEntries,
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
