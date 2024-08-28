import strip from '@rollup/plugin-strip';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA, VitePWAOptions} from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const pwaOptions: Partial<VitePWAOptions> = {
  devOptions: {
    enabled: true,
    type: 'module',
  },
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.js',
  registerType: 'autoUpdate',
  injectManifest: {
    globPatterns: ['**/*'],
    maximumFileSizeToCacheInBytes: 5000000,
  },
  includeAssets: ['**/*'],
  manifest: {
    name: 'Calypso @ Field',
    short_name: 'Field',
    description: 'App til at se tidsserier, lave kontrol målinger, skifte udstyr mm.',
    theme_color: '#00786d',
    background_color: '#00786d',
    id: '/',
    dir: 'ltr',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait',
    start_url: '/',
    lang: 'da-DK',
    categories: ['utilities', 'productivity'],
    screenshots: [
      {
        src: 'screenshot-map.png',
        type: 'image/png',
        sizes: '374x668',
        form_factor: 'narrow',
        label: 'Kortvisning af målestationer',
      },
      {
        src: 'screenshot-ts.png',
        type: 'image/png',
        sizes: '375x668',
        form_factor: 'narrow',
        label: 'Tidsserie af måledata',
      },
      {
        src: 'screenshot-ts-wide.png',
        type: 'image/png',
        sizes: '1855x827',
        form_factor: 'wide',
        label: 'Tidsserie af måledata på desktop',
      },
    ],
    shortcuts: [
      {
        name: 'Field',
        url: '/field',
        description: 'Åben Field',
        icons: [
          {
            src: 'android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Admin',
        url: '/admin',
        description: 'Åben Admin',
        icons: [
          {
            src: 'android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],

    icons: [
      {
        src: 'manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
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
    VitePWA(pwaOptions),
    viteTsconfigPaths(),
    strip({
      functions: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    }),
    // removeConsole(),
    // sentryVitePlugin(sentryOptions),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('plotly')) {
              return 'vendor_plotly';
            } else if (id.includes('@material-ui')) {
              return 'vendor_mui';
            }

            return 'vendor'; // all other package goes here
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/static/images': {
        target: 'https://dhmol4s2b971r.cloudfront.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/static\/images/, ''),
      },
    },
  },
});
