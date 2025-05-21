/**
 * ESLint 配置文件
 * 配置 Vue 3 项目的代码检查规则
 */

import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

export default [
  // 基础 JavaScript 推荐配置
  js.configs.recommended,

  // Vue 3 推荐配置
  ...pluginVue.configs['flat/recommended'],

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

        // Vue 3 全局变量（通过 unplugin-auto-import 自动导入）
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        inject: 'readonly',
        provide: 'readonly',
        nextTick: 'readonly',

        // 项目特定的全局变量
        qspace: 'readonly',
        HotspotTag: 'readonly',
        Put2D: 'readonly',
        Adapter: 'readonly',
        Aliplayer: 'readonly',
      },
    },
    rules: {
      // Prettier 规则
      'prettier/prettier': 'error',

      // JavaScript 规则
      'no-console': 'off', // 允许 console.log，因为项目需要调试信息
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

      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      'vue/no-mutating-props': 'error',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

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
      // 复杂的第三方集成文件（暂时忽略，后续可以逐步修复）
      'src/components/IOTScreen/**',
      'src/components/VideoPlayer/**',
      'src/plugins/Service/**',
    ],
  },
]
