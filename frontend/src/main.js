import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/main.css'
import { initPerformanceMonitoring } from './utils/performance'

// 初始化性能监控
if (process.env.NODE_ENV !== 'test') {
  initPerformanceMonitoring();
}

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app') 