// Legacy Vite app: kept only so the admin dashboard keeps working while it is ported to Next.js.
// Run with `npm run admin` and open http://127.0.0.1:5173/admin.html
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: here('.'),
  envDir: here('..'),
  publicDir: here('../public'),
  server: { host: '127.0.0.1', port: 5173 },
  build: {
    outDir: here('../dist-legacy'),
    emptyOutDir: true,
    rollupOptions: { input: { index: here('index.html'), admin: here('admin.html') } },
  },
});
