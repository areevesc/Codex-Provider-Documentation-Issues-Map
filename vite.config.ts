import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

function getGitHubPagesBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (!repo || repo.endsWith('.github.io')) return '/';
  return `/${repo}/`;
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? getGitHubPagesBase() : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
