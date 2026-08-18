import {type OxfmtConfig, defineConfig} from 'oxfmt';

export const oxfmtOptions: OxfmtConfig = {
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
  // endOfLine: 'crlf',
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
};

export default defineConfig(oxfmtOptions);
