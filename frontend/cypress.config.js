const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // 实现节点事件监听器
    },
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
    testUser: {
      email: 'test@example.com',
      password: 'testPassword123'
    },
    adminUser: {
      email: 'admin@example.com',
      password: 'adminPassword123'
    }
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  }
}) 