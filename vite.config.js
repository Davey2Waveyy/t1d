import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-v1',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              url.hostname.endsWith('.supabase.co') &&
              request.method === 'GET' &&
              /\/rest\/v1\/(glucose_readings|meals|insulin_doses|user_settings)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'data-reads-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'src/test/**/*.test.js',
      'src/hooks/**/*.test.js',
      'src/components/**/*.test.jsx',
    ],
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.js'],
  },
});
