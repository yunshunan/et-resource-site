import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    silent: process.env.CI === 'true',
    onConsoleLog(log) {
      if (log.includes('Network Error') || 
          log.includes('401 Unauthorized') || 
          log.includes('Request failed with status code')) {
        return false;
      }
      return true;
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