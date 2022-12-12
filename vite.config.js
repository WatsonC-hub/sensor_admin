import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import {visualizer} from 'rollup-plugin-visualizer';
import {VitePWA} from 'vite-plugin-pwa';
import sentryVitePlugin from '@sentry/vite-plugin';

const pwaOptions = {
  registerType: 'autoUpdate',
  manifest: {
    name: 'Calypso @ Field',
    short_name: 'Calypso @ Field',
    description: 'App til at se tidsserier, lave kontrol målinger, skifte udstyr mm.',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
};

const sentryOptions = {
  org: 'watsonc',
  project: 'calypso-field',
  include: ['./dist'],
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgrPlugin(),
    visualizer(),
    VitePWA(pwaOptions),
    sentryVitePlugin(sentryOptions),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      src: '/src',
      public: '/public',
    },
  },
});
