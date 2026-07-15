import strip from '@rollup/plugin-strip';
import react from '@vitejs/plugin-react';
import {defineConfig, lazyPlugins} from 'vite-plus';
import {VitePWA, VitePWAOptions} from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';

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
    '*': 'vp check --fix',
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react'],
    categories: {
      correctness: 'warn',
    },
    env: {
      builtin: true,
    },
    ignorePatterns: ['dist', 'dev-dist'],
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
          'typescript/no-floating-promises': 'warn',
          'typescript/no-misused-spread': 'warn',
        },
        // rules: {
        //   'constructor-super': 'off',
        //   'for-direction': 'error',
        //   'getter-return': 'off',
        //   'no-async-promise-executor': 'error',
        //   'no-case-declarations': 'error',
        //   'no-class-assign': 'off',
        //   'no-compare-neg-zero': 'error',
        //   'no-cond-assign': 'error',
        //   'no-const-assign': 'off',
        //   'no-constant-binary-expression': 'error',
        //   'no-constant-condition': 'error',
        //   'no-control-regex': 'error',
        //   'no-debugger': 'error',
        //   'no-delete-var': 'error',
        //   'no-dupe-class-members': 'off',
        //   'no-dupe-else-if': 'error',
        //   'no-dupe-keys': 'off',
        //   'no-duplicate-case': 'error',
        //   'no-empty': 'error',
        //   'no-empty-character-class': 'error',
        //   'no-empty-pattern': 'error',
        //   'no-empty-static-block': 'error',
        //   'no-ex-assign': 'error',
        //   'no-extra-boolean-cast': 'error',
        //   'no-fallthrough': 'error',
        //   'no-func-assign': 'off',
        //   'no-global-assign': 'error',
        //   'no-import-assign': 'off',
        //   'no-invalid-regexp': 'error',
        //   'no-irregular-whitespace': 'error',
        //   'no-loss-of-precision': 'error',
        //   'no-misleading-character-class': 'error',
        //   'no-new-native-nonconstructor': 'off',
        //   'no-nonoctal-decimal-escape': 'error',
        //   'no-obj-calls': 'off',
        //   'no-prototype-builtins': 'error',
        //   'no-redeclare': 'off',
        //   'no-regex-spaces': 'error',
        //   'no-self-assign': 'error',
        //   'no-setter-return': 'off',
        //   'no-shadow-restricted-names': 'error',
        //   'no-sparse-arrays': 'error',
        //   'no-this-before-super': 'off',
        //   'no-undef': 'off',
        //   'no-unexpected-multiline': 'error',
        //   'no-unreachable': 'off',
        //   'no-unsafe-finally': 'error',
        //   'no-unsafe-negation': 'off',
        //   'no-unsafe-optional-chaining': 'error',
        //   'no-unused-labels': 'error',
        //   'no-unused-private-class-members': 'error',
        //   'no-unused-vars': ['error'],
        //   'no-useless-backreference': 'error',
        //   'no-useless-catch': 'error',
        //   'no-useless-escape': 'error',
        //   'no-with': 'off',
        //   'require-yield': 'error',
        //   'use-isnan': 'error',
        //   'valid-typeof': 'error',
        //   'no-var': 'error',
        //   'prefer-const': 'error',
        //   'prefer-rest-params': 'error',
        //   'prefer-spread': 'error',
        //   'no-array-constructor': 'error',
        //   'no-unused-expressions': 'error',
        //   'typescript/ban-ts-comment': 'error',
        //   'typescript/no-duplicate-enum-values': 'error',
        //   'typescript/no-empty-object-type': 'error',
        //   'typescript/no-explicit-any': ['off'],
        //   'typescript/no-extra-non-null-assertion': 'error',
        //   'typescript/no-misused-new': 'error',
        //   'typescript/no-namespace': 'error',
        //   'typescript/no-non-null-asserted-optional-chain': 'error',
        //   'typescript/no-require-imports': 'error',
        //   'typescript/no-this-alias': 'error',
        //   'typescript/no-unnecessary-type-constraint': 'error',
        //   'typescript/no-unsafe-declaration-merging': 'error',
        //   'typescript/no-unsafe-function-type': 'error',
        //   'typescript/no-wrapper-object-types': 'error',
        //   'typescript/prefer-as-const': 'error',
        //   'typescript/prefer-namespace-keyword': 'error',
        //   'typescript/triple-slash-reference': 'error',
        //   'react/display-name': 'error',
        //   'react/jsx-key': 'error',
        //   'react/jsx-no-comment-textnodes': 'error',
        //   'react/jsx-no-duplicate-props': 'error',
        //   'react/jsx-no-target-blank': 'error',
        //   'react/jsx-no-undef': 'error',
        //   'react/no-children-prop': 'error',
        //   'react/no-danger-with-children': 'error',
        //   'react/no-direct-mutation-state': 'error',
        //   'react/no-find-dom-node': 'error',
        //   'react/no-is-mounted': 'error',
        //   'react/no-render-return-value': 'error',
        //   'react/no-string-refs': 'error',
        //   'react/no-unescaped-entities': 'error',
        //   'react/no-unknown-property': 'error',
        //   'react/no-unsafe': 'off',
        //   'react/react-in-jsx-scope': ['off'],
        //   'react/require-render-return': 'error',
        //   'jsx-a11y/alt-text': 'error',
        //   'jsx-a11y/anchor-ambiguous-text': 'off',
        //   'jsx-a11y/anchor-has-content': 'error',
        //   'jsx-a11y/anchor-is-valid': 'off',
        //   'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        //   'jsx-a11y/aria-props': 'error',
        //   'jsx-a11y/aria-proptypes': 'error',
        //   'jsx-a11y/aria-role': 'error',
        //   'jsx-a11y/aria-unsupported-elements': 'error',
        //   'jsx-a11y/autocomplete-valid': 'error',
        //   'jsx-a11y/click-events-have-key-events': 'error',
        //   'jsx-a11y/control-has-associated-label': [
        //     'off',
        //     {
        //       ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
        //       ignoreRoles: [
        //         'grid',
        //         'listbox',
        //         'menu',
        //         'menubar',
        //         'radiogroup',
        //         'row',
        //         'tablist',
        //         'toolbar',
        //         'tree',
        //         'treegrid',
        //       ],
        //       includeRoles: ['alert', 'dialog'],
        //     },
        //   ],
        //   'jsx-a11y/heading-has-content': 'error',
        //   'jsx-a11y/html-has-lang': 'error',
        //   'jsx-a11y/iframe-has-title': 'error',
        //   'jsx-a11y/img-redundant-alt': 'error',
        //   'jsx-a11y/interactive-supports-focus': [
        //     'error',
        //     {
        //       tabbable: [
        //         'button',
        //         'checkbox',
        //         'link',
        //         'searchbox',
        //         'spinbutton',
        //         'switch',
        //         'textbox',
        //       ],
        //     },
        //   ],
        //   'jsx-a11y/label-has-associated-control': 'error',
        //   'jsx-a11y/media-has-caption': 'error',
        //   'jsx-a11y/mouse-events-have-key-events': 'error',
        //   'jsx-a11y/no-access-key': 'error',
        //   'jsx-a11y/no-autofocus': 'error',
        //   'jsx-a11y/no-distracting-elements': 'error',
        //   'jsx-a11y/no-interactive-element-to-noninteractive-role': [
        //     'error',
        //     {
        //       tr: ['none', 'presentation'],
        //       canvas: ['img'],
        //     },
        //   ],
        //   'jsx-a11y/no-noninteractive-element-interactions': [
        //     'error',
        //     {
        //       handlers: [
        //         'onClick',
        //         'onError',
        //         'onLoad',
        //         'onMouseDown',
        //         'onMouseUp',
        //         'onKeyPress',
        //         'onKeyDown',
        //         'onKeyUp',
        //       ],
        //       alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        //       body: ['onError', 'onLoad'],
        //       dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        //       iframe: ['onError', 'onLoad'],
        //       img: ['onError', 'onLoad'],
        //     },
        //   ],
        //   'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        //     'error',
        //     {
        //       ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        //       ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        //       li: [
        //         'menuitem',
        //         'menuitemradio',
        //         'menuitemcheckbox',
        //         'option',
        //         'row',
        //         'tab',
        //         'treeitem',
        //       ],
        //       table: ['grid'],
        //       td: ['gridcell'],
        //       fieldset: ['radiogroup', 'presentation'],
        //     },
        //   ],
        //   'jsx-a11y/no-noninteractive-tabindex': [
        //     'error',
        //     {
        //       tags: [],
        //       roles: ['tabpanel'],
        //       allowExpressionValues: true,
        //     },
        //   ],
        //   'jsx-a11y/no-redundant-roles': 'error',
        //   'jsx-a11y/no-static-element-interactions': [
        //     'error',
        //     {
        //       allowExpressionValues: true,
        //       handlers: [
        //         'onClick',
        //         'onMouseDown',
        //         'onMouseUp',
        //         'onKeyPress',
        //         'onKeyDown',
        //         'onKeyUp',
        //       ],
        //     },
        //   ],
        //   'jsx-a11y/role-has-required-aria-props': 'error',
        //   'jsx-a11y/role-supports-aria-props': 'error',
        //   'jsx-a11y/scope': 'error',
        //   'jsx-a11y/tabindex-no-positive': 'error',
        //   'react-compiler/react-compiler': 'error',
        //   'no-console': 'warn',
        //   'react/button-has-type': 'error',
        //   'import/no-cycle': 'error',
        //   'import/default': 'off',
        //   'import/no-named-as-default-member': 'off',
        //   'import/no-named-as-default': 'off',
        //   'check-file/filename-naming-convention': [
        //     'error',
        //     {
        //       '**/*.{tsx}': 'PASCAL_CASE',
        //       '**/*.{ts}': 'CAMEL_CASE',
        //     },
        //     {
        //       ignoreMiddleExtensions: true,
        //     },
        //   ],
        //   'check-file/folder-naming-convention': [
        //     'error',
        //     {
        //       '**/*': 'CAMEL_CASE',
        //     },
        //   ],
        //   'no-empty-function': ['off'],
        //   'react/only-export-components': [
        //     'warn',
        //     {
        //       allowConstantExport: true,
        //     },
        //   ],
        //   'typescript/explicit-function-return-type': ['off'],
        //   'typescript/explicit-module-boundary-types': ['off'],
        // },
        plugins: ['jsx-a11y', 'import'],
        jsPlugins: ['eslint-plugin-react-compiler', 'eslint-plugin-check-file'],
        env: {
          es2020: true,
          browser: true,
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
  },
  fmt: {
    arrowParens: 'always',
    bracketSpacing: false,
    jsxSingleQuote: false,
    printWidth: 100,
    proseWrap: 'always',
    quoteProps: 'as-needed',
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    useTabs: false,
    sortPackageJson: false,
    ignorePatterns: ['node_modules', 'dist', '*.html'],
  },
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
        advancedChunks: {
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
        // manualChunks: (id) => {
        //   if (id.includes('node_modules')) {
        //     if (id.includes('plotly')) {
        //       return 'vendor_plotly';
        //     } else if (id.includes('mui')) {
        //       return 'vendor_mui';
        //     } else if (id.includes('leaflet')) {
        //       return 'vendor_leaflet';
        //     } else if (id.includes('react')) {
        //       return null;
        //     }

        //     return 'vendor'; // all other package goes here
        //   }
        //   return null;
        // },
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
