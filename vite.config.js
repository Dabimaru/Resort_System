import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.VITE_API_PORT || 5001);
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';
const repoName = (process.env.GITHUB_REPOSITORY || '').split('/')[1];
const basePath = process.env.VITE_BASE_PATH || (isGithubPages && repoName ? `/${repoName}/` : '/');

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
