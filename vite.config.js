import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api requests go to the Express server, so cookies work without any CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
