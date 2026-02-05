import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // Set base for GitHub Pages - change this to match your repo name
  base: process.env.GITHUB_ACTIONS ? '/claude-companion/' : '/',
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
  },
});
