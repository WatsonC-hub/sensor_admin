import strip from '@rollup/plugin-strip';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';
import {defineConfig, lazyPlugins} from 'vite-plus';

import {oxfmtOptions} from './oxfmt.config';
import {lintOptions} from './oxlint.config';

import type {VitePWAOptions} from 'vite-plugin-pwa';

const pwaOptions: Partial<VitePWAOptions> = {
  devOptions: {enabled: true, type: 'module'},
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.js',
  registerType: 'autoUpdate',
  injectManifest: {globPatterns: ['**/!(*.map)'], maximumFileSizeToCacheInBytes: 5000000},
  includeAssets: ['**/*'],
  manifest: {
    name: 'Calypso @ Field',
    short_name: 'Field',
    description: 'App til at se tidsserier, lave kontrol målinger, skifte udstyr mm.',
    theme_color: '#00786d',
    background_color: '#00786d',
    id: '/',
    dir: 'ltr',
    display: 'minimal-ui',
    // display_override: ['window-controls-overlay'],
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
        icons: [{src: 'android-launchericon-96-96.png', sizes: '96x96', type: 'image/png'}],
      },
      {
        name: 'Admin',
        url: '/admin',
        description: 'Åben Admin',
        icons: [{src: 'android-launchericon-96-96.png', sizes: '96x96', type: 'image/png'}],
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

// const sentryOptions = {
//   org: 'watsonc',
//   project: 'calypso-field',
//   include: ['./dist'],
//   authToken: process.env.SENTRY_AUTH_TOKEN,
// };

// "scripts": {
//   "dev": "vp dev",
//   "build": "tsc -b && vp build",
//   "serve": "vp preview",
//   "prune": "vp dlx ts-prune -p ./tsconfig.app.json",
//   "generate": "openapi --input ./spec.json --output ./src/types/api --exportServices false --exportCore false --useOptions --useUnionTypes",
//   "check": "vp check",
//   "fix": "vp check --fix",
//   "test": "vp test",
//   "check-types": "tsc -b --pretty --noEmit",
//   "prepare": "vp config"
// },

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    '*': 'vpr fix',
  },
  fmt: oxfmtOptions,
  lint: lintOptions,
  run: {
    tasks: {
      check: {
        command: 'vp check --fix',
      },
      serve: {
        command: 'vp preview',
        dependsOn: ['check', 'build'],
      },
      prune: {
        command: 'vp dlx ts-prune -p ./tsconfig.app.json',
        dependsOn: ['check'],
      },
      generate: {
        command:
          'openapi --input ./spec.json --output ./src/types/api --exportServices false --exportCore false --useOptions --useUnionTypes',
        dependsOn: ['check'],
      },
      build: {
        command: 'vp build',
        dependsOn: ['check'],
      },

      test: {
        command: 'vp test',
      },

      ci: {
        command: 'vp build',
        dependsOn: ['check', 'test'],
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    react(),
    svgrPlugin({
      include: '**/*.svg?react',
    }),
    VitePWA(pwaOptions),
    {
      ...strip({include: /\**\/*.js/, functions: ['console.log', 'assert.*']}),
      // { include: /\**\/*.js/ } // <- this works, but the default of '**/*.js' doesn't
      apply: 'build',
    },
    // visualizer({filename: 'stats.html', open: true}),
    // removeConsole(),
    // sentryVitePlugin(sentryOptions),
  ]),
  // define: {global: 'window'},
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        codeSplitting: {
          groups: [
            {
              name: 'vendor_plotly',
              test: /[\\/]node_modules[\\/](plotly.js)[\\/]/,
            },
            {
              name: 'vendor_mui',
              test: /[\\/]node_modules[\\/](?:@mui)[\\/]/,
            },
            {
              name: 'vendor_leaflet',
              test: /[\\/]node_modules[\\/](leaflet)[\\/]/,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/](?!plotly|@mui|leaflet|react)[\\/]/,
            },
          ],
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
      '/events': {
        target: 'https://eu.i.posthog.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/events/, ''),
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
