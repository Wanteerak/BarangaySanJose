import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para i-set ang tamang Content-Type ng .apk (para kilalanin ng Android installer)
function apkContentTypePlugin() {
  return {
    name: 'apk-content-type',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.toLowerCase().endsWith('.apk')) {
          res.setHeader('Content-Type', 'application/vnd.android.package-archive');
          res.setHeader('Content-Disposition', 'attachment; filename="barangay-san-jose.apk"');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apkContentTypePlugin()],
  server: {
    port: 5174,
    host: true, // expose sa LAN (para ma-access ng phone)
    watch: {
      ignored: ['**/public/download/**'],
    },
  },
})