import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { initializeApp as bootstrapApp } from './bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/main.css'

// Import service configurations
// import './config/firebase' // Firebase will be initialized on import - 注释掉此行
import AV from './config/leancloud' // LeanCloud is already initialized
import { initSentry } from './config/sentry' // Sentry will be initialized later
import { useAuthStore } from '@/stores/auth' // <-- Import auth store

console.log('开始应用初始化流程...')

// 导入bootstrap JS (确保正确初始化)
import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap

// 捕获未处理的Promise错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise错误:', event.reason)
})

// 捕获全局JavaScript错误
window.addEventListener('error', (event) => {
  console.error('全局JS错误:', event.error)
})

// 异步初始化应用
bootstrapApp().then(async () => {
  console.log('初始化完成，创建Vue应用...')
  const app = createApp(App)
  
  // 开发模式配置
  app.config.devtools = true
  app.config.performance = true
  app.config.silent = false
  app.config.warnHandler = function(msg, vm, trace) {
    console.warn('[Vue警告]:', msg)
    if (trace) {
      console.warn('跟踪:', trace)
    }
  }
  app.config.errorHandler = function(err, vm, info) {
    console.error('[Vue错误]:', err)
    console.error('错误信息:', info)
  }
  
  // 使用插件
  app.use(pinia)
  
  // --- 调用 checkAuth --- 
  const authStore = useAuthStore() // Get store instance
  try {
      console.log('调用 authStore.checkAuth...');
      await authStore.checkAuth() // Wait for auth check to complete
      console.log('authStore.checkAuth 完成.');
  } catch (e) {
      console.error('初始化认证检查失败:', e)
  }
  // --- 结束调用 checkAuth ---
  
  app.use(router)
  
  // Initialize Sentry after router is attached
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true') {
    initSentry(app, router)
  }
  
  // 挂载应用
  console.log('挂载Vue应用...')
  app.mount('#app')
  
  // Log LeanCloud initialization status (for debugging)
  if (AV.applicationId) {
    console.log('LeanCloud 已初始化')
  }
  
  console.log('Vue应用已挂载!')
}).catch(error => {
  console.error('初始化失败:', error)
  // 显示错误信息到页面
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="text-align: center; padding: 20px; color: red;">
        <h2>应用加载失败</h2>
        <p>详细错误: ${error.message || '未知错误'}</p>
        <button onclick="location.reload()">重试</button>
      </div>
    `
  }
}) 