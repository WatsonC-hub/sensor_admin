import strip from '@rollup/plugin-strip';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';
import {defineConfig, lazyPlugins} from 'vite-plus';

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

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    '*': 'vpr fix',
  },
  fmt: {
    arrowParens: 'always',
    bracketSpacing: false,
    jsxSingleQuote: false,
    printWidth: 100,
    singleQuote: true,
    proseWrap: 'always',
    quoteProps: 'as-needed',
    semi: true,
    tabWidth: 2,
    trailingComma: 'es5',
    useTabs: false,
    sortPackageJson: true,
    ignorePatterns: ['node_modules', 'dist', '*.html'],
    sortImports: {
      newlinesBetween: true,
      groups: [
        ['value-builtin'],
        ['value-external'],
        ['value-internal'],
        ['value-parent', 'value-sibling', 'value-index'],
        ['type-import'],
        ['unknown'],
      ],
    },
  },
  lint: {
    categories: {
      correctness: 'off',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ['dist', 'dev-dist'],
    overrides: [
      {
        env: {
          builtin: true,
          es2018: true,
          es2020: true,
          browser: true,
        },
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        plugins: ['typescript', 'react'],
        jsPlugins: [
          'eslint-plugin-react-compiler',
          'eslint-plugin-check-file',
          // {name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin'},
        ],

        rules: {
          'react-compiler/react-compiler': 'error',
          // set of custom rules

          'no-console': 'warn',
          'react/button-has-type': 'error',
          'react/react-in-jsx-scope': ['off'],
          'jsx-a11y/anchor-is-valid': 'off',
          'no-unused-vars': 'error',

          'typescript/no-floating-promises': 'warn',
          'typescript/no-misused-promises': 'warn',
          'typescript/no-explicit-any': ['warn'],
          'typescript/consistent-type-imports': ['error', {prefer: 'type-imports'}],
          'typescript/consistent-type-exports': [
            'error',
            {fixMixedExportsWithInlineTypeSpecifier: true},
          ],
          'typescript/no-deprecated': 'warn',
          'typescript/return-await': ['error', 'in-try-catch'],

          'import/no-cycle': 'error',
          'import/default': 'off',
          'import/no-named-as-default-member': 'off',
          'import/no-named-as-default': 'off',
          'check-file/filename-naming-convention': [
            'error',
            {
              '**/*.tsx': 'PASCAL_CASE',
            },
            {
              ignoreMiddleExtensions: true,
            },
          ],
          'check-file/folder-naming-convention': [
            'error',
            {
              'src/**/*': 'CAMEL_CASE',
            },
          ],
          'no-empty-function': ['off'],
          'react/only-export-components': [
            'warn',
            {
              allowConstantExport: true,
            },
          ],
          'typescript/explicit-function-return-type': ['off'],
        },
      },
    ],
    globals: {
      AsyncDisposableStack: 'readonly',
      DisposableStack: 'readonly',
      SuppressedError: 'readonly',
    },
  },

  // "rules": {
  //   "typescript/no-floating-promises": "warn",
  //   "typescript/no-misused-promises": "warn"
  // }
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    react(),
    svgrPlugin(),
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
