import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import type { Linter } from 'eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import * as mdx from 'eslint-plugin-mdx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintPluginPrettierRecommended,
  {
    ignores: ['.velite/', 'node_modules/*'],
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  },
  { files: ['*.md', '*.mdx'], ...mdx.flat }
] satisfies Linter.Config[];

export default eslintConfig;
