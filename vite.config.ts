import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';
import {defineConfig, lazyPlugins} from 'vite-plus';

import {oxfmtOptions} from './oxfmt.config.ts';
import {lintOptions} from './oxlint.config.ts';

import type {VitePWAOptions} from 'vite-plugin-pwa';
import type {PluginOption} from 'vite-plus';

const MAX_COMMAND_LENGTH = 7000;

function chunkCommands(command: string, files: readonly string[]): string[] {
  const commands: string[] = [];
  let current = command;
  for (const file of files) {
    const arg = ` "${path.relative(process.cwd(), file)}"`;
    if (current !== command && current.length + arg.length > MAX_COMMAND_LENGTH) {
      commands.push(current);
      current = command;
    }
    current += arg;
  }
  if (current !== command) commands.push(current);
  return commands;
}

const pwaOptions: Partial<VitePWAOptions> = {
  devOptions: {enabled: true, type: 'module'},
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.js',
  registerType: 'autoUpdate',
  injectManifest: {globPatterns: ['**/!(*.map)'], maximumFileSizeToCacheInBytes: 5000000},
  includeAssets: ['**/*'],
  // includeAssets: ['favicon.ico', 'apple-touch-icon.png'],

  // injectManifest: {
  //   globPatterns: ['**/*.{js,css,html,json,webmanifest,png,svg,ico,woff,woff2}'],
  //   maximumFileSizeToCacheInBytes: 5000000,
  // },
  manifest: {
    name: 'Calypso @ Field',
    short_name: 'Field',
    description: 'App til at se tidsserier, lave kontrol målinger, skifte udstyr mm.',
    theme_color: '#00786d',
    background_color: '#00786d',
    id: '/',
    dir: 'ltr',
    display: 'minimal-ui',
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

// Development against the production login (calypso-auth on admin.watsonc.dk). Its session cookie
// lives on .watsonc.dk and is Secure, so the dev server has to be https on a watsonc.dk name: a hosts
// entry `127.0.0.1 local.watsonc.dk` and a mkcert certificate in ~/.watsonc-cert (see README). Then
// Field is https://local.watsonc.dk:5174 (5173 is a local calypso-auth's). Without the certificate
// this is off and the dev server runs on localhost as before.
const certDir = process.env.WATSONC_CERT_DIR ?? path.join(os.homedir(), '.watsonc-cert');
const cert = path.join(certDir, 'local.watsonc.dk.pem');
const key = path.join(certDir, 'local.watsonc.dk-key.pem');
const localHttps = fs.existsSync(cert) && fs.existsSync(key);

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  staged: {
    // Split into several commands so each stays under cmd.exe's 8191-char limit on Windows.
    '*.{ts,tsx,js,jsx}': (files: readonly string[]) => chunkCommands('vp check --fix', files),
  },
  fmt: oxfmtOptions,
  lint: lintOptions,
  run: {
    tasks: {
      typeCheck: {
        command: 'vp lint --quiet --type-check --type-aware',
      },
      check: {
        command: 'vp check --fix',
        dependsOn: ['typeCheck'],
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
      devBuild: {
        command: 'vp build',
        dependsOn: ['typeCheck', 'check'],
        cache: false,
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
  plugins: [
    lazyPlugins(
      async () =>
        [
          react(),
          svgrPlugin({
            include: '**/*.svg?react',
          }),
          VitePWA(pwaOptions),
        ] as PluginOption[]
    ),
  ],
  // define: {global: 'window'},
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
          },
        },
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
    ...(localHttps && {
      host: 'local.watsonc.dk',
      allowedHosts: ['local.watsonc.dk'],
      https: {cert: fs.readFileSync(cert), key: fs.readFileSync(key)},
      port: 5174,
      strictPort: true,
    }),
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
