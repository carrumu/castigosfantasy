import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api-biwenger': {
        target: 'https://api.biwenger.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-biwenger/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Vite Proxy Error for Biwenger:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to Biwenger:', req.method, req.url);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
