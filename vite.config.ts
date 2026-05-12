import { defineConfig } from 'vite';

// VITE_BASE is set by the GitHub Actions workflow to `/<repo-name>/`.
// In local dev it stays '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  server: { host: '127.0.0.1', port: 5173, open: false },
  build: { target: 'es2022' },
});
