import js from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {ignores: ['dist']},
  {
    // specify the formats on which to apply the rules below
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // use predefined configs in installed eslint plugins
    extends: [
      // js
      js.configs.recommended,
      // ts
      ...tseslint.configs.recommended,
      // react
      react.configs.flat.recommended,
      // import
      importPlugin.flatConfigs.recommended,
      // a11y (accessibility
      jsxA11y.flatConfigs.recommended,
      // checkfile
    ],

    languageOptions: {ecmaVersion: 2020, globals: globals.browser},
    // specify used plugins
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'check-file': checkFile,
      'react-compiler': reactCompiler,
    },
    settings: {
      // for eslint-plugin-react to auto detect react version
      react: {version: 'detect'},
      // for eslint-plugin-import to use import alias
      'import/resolver': {typescript: {project: './tsconfig.json'}},
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      // set of custom rules
      'react/prop-types': 'off',
      'no-console': 'warn',
      'react/button-has-type': 'error',
      'react/react-in-jsx-scope': ['off'],
      'jsx-a11y/anchor-is-valid': 'off',
      'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['off'],
      '@typescript-eslint/explicit-module-boundary-types': ['off'],
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],
      // 'import/order': [
      //   'error',
      //   {
      //     groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
      //     'newlines-between': 'always',
      //     alphabetize: {order: 'asc', caseInsensitive: true},
      //   },
      // ],
      'import/no-unresolved': 'off',
      'import/no-cycle': 'error',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'check-file/filename-naming-convention': [
        'error',
        {'**/*.{tsx}': 'PASCAL_CASE', '**/*.{ts}': 'CAMEL_CASE'},
        {ignoreMiddleExtensions: true},
      ],
      'check-file/folder-naming-convention': ['error', {'**/*': 'CAMEL_CASE'}],
    },
  }
);
