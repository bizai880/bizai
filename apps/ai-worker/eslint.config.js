// apps/ai-worker/eslint.config.js
// ESLint Flat Config (ESLint 9+) للـ AI Worker
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ============================================
  // 1. التكوين الأساسي للـ JavaScript/TypeScript
  // ============================================
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // ===== قواعد TypeScript الأساسية =====
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      
      // ===== قواعد TypeScript المتقدمة =====
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      
      // ===== قواعد ES6/ESM =====
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'all'],
      'no-duplicate-imports': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      
      // ===== قواعد Async/Await =====
      'no-return-await': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'require-await': 'off', // استخدام @typescript-eslint/require-await بدلاً منه
      
      // ===== قواعد الأمان والأداء =====
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info', 'debug', 'table', 'time', 'timeEnd'],
        },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2, 10, 100, 1000],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      
      // ===== قواعد Code Style =====
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': 'off', // يترك لـ prettier
      '@typescript-eslint/indent': 'off',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
    },
  },
  
  // ============================================
  // 2. تكوين خاص لملفات الاختبار
  // ============================================
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'no-console': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  
  // ============================================
  // 3. تكوين خاص لملفات التكوين
  // ============================================
  {
    files: [
      '**/*.config.{js,ts}',
      '**/*.config.*.{js,ts}',
      '**/eslint.config.{js,ts}',
    ],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
  
  // ============================================
  // 4. تكوين خاص لملفات Docker والـ CI/CD
  // ============================================
  {
    files: ['**/Dockerfile*', '**/*.yml', '**/*.yaml', '**/.github/**/*.{yml,yaml}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  
  // ============================================
  // 5. تكوين خاص لملفات Turborepo
  // ============================================
  {
    files: ['**/turbo.json', '**/package.json'],
    rules: {
      'json/*': 'off',
    },
  },
];

// ============================================
// إعدادات Global Ignore
// ============================================
export const ignores = [
  // Build outputs
  'dist/',
  'build/',
  '.next/',
  '.turbo/',
  'coverage/',
  '*.d.ts',
  
  // Dependencies
  'node_modules/',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  
  // Environment
  '.env',
  '.env.local',
  '.env.*.local',
  
  // Logs
  '*.log',
  'logs/',
  '*.log.*',
  
  // OS
  '.DS_Store',
  'Thumbs.db',
  
  // IDE
  '.vscode/',
  '.idea/',
  '*.swp',
  '*.swo',
  
  // Temp
  'tmp/',
  'temp/',
];