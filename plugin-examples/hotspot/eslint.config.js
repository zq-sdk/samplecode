/**
 * ESLint 配置文件
 */

import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

export default [
  // 基础 JavaScript 推荐配置
  js.configs.recommended,

  // Prettier 配置（禁用与 Prettier 冲突的规则）
  configPrettier,

  {
    files: ['**/*.{js,vue}'],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // 浏览器全局变量
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',

        // 项目特定的全局变量
        qspace: 'readonly',
        HotspotTag: 'readonly',
      },
    },
    rules: {
      // Prettier 规则
      'prettier/prettier': 'error',

      // JavaScript 规则
      'no-console': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // 代码风格规则
      indent: 'off', // 由 Prettier 处理
      quotes: 'off', // 由 Prettier 处理
      semi: 'off', // 由 Prettier 处理
      'comma-dangle': 'off', // 由 Prettier 处理
    },
  },

  {
    // Node.js 配置文件
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
  },

  {
    // 忽略的文件
    ignores: [
      'node_modules/**',
      'dist/**',
      'public/lib/**',
      'public/sdk/**',
      '*.min.js',
    ],
  },
]
