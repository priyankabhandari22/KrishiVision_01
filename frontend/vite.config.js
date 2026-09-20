import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': API_TARGET,
      '/predict': API_TARGET,
      '/history': API_TARGET,
      '/analytics': API_TARGET,
      '/health': API_TARGET,
      '/evaluation': API_TARGET,
      '/static': API_TARGET,
      '/docs': API_TARGET,
      '/openapi.json': API_TARGET,
    },
  },
});