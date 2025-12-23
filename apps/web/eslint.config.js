import js from '@eslint/js'
import nextPlugin from 'eslint-plugin-next'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['.next/', 'node_modules/', 'dist/'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      next: nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  }
)
