import {defineConfig, type OxlintConfig} from 'oxlint';

export const lintOptions: OxlintConfig = {
  categories: {
    correctness: 'warn',
  },
  ignorePatterns: ['dist', 'dev-dist'],
  //   options: {
  //     typeAware: true,
  //     typeCheck: true,
  //   },
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
        'eslint-plugin-check-file',
        // {name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin'},
      ],

      rules: {
        // 'react/react-compiler': 'error',
        // 'react/exhaustive-deps': 'warn',
        // 'react/jsx-props-no-spreading': 'error',
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
};

export default defineConfig(lintOptions);
