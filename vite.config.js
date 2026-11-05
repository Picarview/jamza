import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { readPublicConfig } from './src/config/env.js';

export default defineConfig(({ mode }) => {
  readPublicConfig(loadEnv(mode, process.cwd(), 'VITE_'));
  return {
    appType: 'mpa',
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
    build: {
      target: 'es2022',
      rollupOptions: {
        input: {
          site: fileURLToPath(new URL('./index.html', import.meta.url)),
          admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
          notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
        },
      },
    },
  };
});
