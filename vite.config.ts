import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy for local development to simulate Firebase Rewrites
    proxy: {
      '/api': {
        // UPDATE REQUIRED: Replace 'aimockuptool55122-967185-aa966' with your actual Firebase Project ID if running locally.
        // You can see your project ID by running `firebase projects:list` in the terminal.
        target: 'http://127.0.0.1:5001/aimockuptool55122-967185-aa966/us-central1/api', 
        changeOrigin: true,
      }
    }
  }
});