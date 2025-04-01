import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import * as networkSimulator from '@/utils/networkSimulator'
import * as performanceMonitor from '@/utils/performanceMonitor'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许特定状态码不抛出错误，以便在响应拦截器中统一处理
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 404; // 允许404错误通过响应拦截器处理
  }
})

// 请求拦截器
api.interceptors.request.use(
  async config => {
    // 记录请求开始时间
    config.requestStartTime = performance.now()
    
    // 从状态管理中获取认证信息
    const authStore = useAuthStore()
    
    // 如果有token，添加到请求头
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    // 应用网络模拟逻辑
    if (process.env.NODE_ENV === 'development') {
      const simulatedConfig = await networkSimulator.simulateApiCall(config)
      return simulatedConfig
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 计算请求持续时间
    const duration = performance.now() - response.config.requestStartTime
    
    // 记录API调用性能
    performanceMonitor.recordApiCall(
      response.config.url,
      response.config.method,
      duration,
      response.status
    )
    
    // 统一处理响应数据格式
    return response.data
  },
  async error => {
    // 计算请求持续时间
    const duration = performance.now() - error.config?.requestStartTime
    
    // 记录API调用性能（失败）
    if (error.config) {
      performanceMonitor.recordApiCall(
        error.config.url,
        error.config.method,
        duration,
        error.response?.status || 0
      )
    }
    
    // 处理401错误（未授权），尝试刷新Token
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      
      // 尝试刷新Token
      const tokenRefreshed = await authStore.refreshAccessToken()
      
      // 如果Token刷新成功，重试原请求
      if (tokenRefreshed && error.config) {
        // 更新请求配置中的Authorization头
        error.config.headers['Authorization'] = `Bearer ${authStore.token}`
        return api(error.config)
      }
    }
    
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// API接口
export const homeApi = {
  getHomeData: () => api.get('/home')
}

export const resourceApi = {
  getResources: (page = 1, category = '') => {
    const params = { page }
    if (category) params.category = category
    return api.get('/resources', { params })
  },
  getResourceById: (id) => api.get(`/resources/${id}`)
}

export const newsApi = {
  getNewsList: (page = 1) => api.get('/news', { params: { page } }),
  getNewsById: (id) => api.get(`/news/${id}`)
}

// 认证相关API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
}

export default api 