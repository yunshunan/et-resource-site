import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// import path from 'path'

// 导入ESM格式的日志过滤函数
import { filterTestLog } from './scripts/vitestLogFilter.js'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    silent: process.env.CI === 'true',
    onConsoleLog(log, type, options) {
      // 识别日志来源
      let source = 'unknown';
      
      // 尝试从测试文件路径识别模块
      if (options && options.file) {
        const filePath = options.file;
        if (filePath.includes('auth')) {
          source = 'auth';
        } else if (filePath.includes('resources')) {
          source = 'resources';
        } else if (filePath.includes('api') || filePath.includes('axios')) {
          source = 'axios';
        }
      }
      
      // 使用ESM格式的过滤函数
      return filterTestLog(log, source, type || 'log');
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/main.js', 
        '**/node_modules/**',
        'src/plugins/**',
        'src/assets/**'
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}) 