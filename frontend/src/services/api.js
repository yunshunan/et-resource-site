import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 获取API基础URL（避免使用process.env）
const getApiBaseUrl = () => {
  // 检查是否在Vite环境中（Vite使用import.meta.env而不是process.env）
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033';
  }
  
  // 回退到默认URL
  return 'http://localhost:3033';
};

// 创建axios实例
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许特定状态码不抛出错误，以便在响应拦截器中统一处理
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 404; // 允许404错误通过响应拦截器处理
  }
})

// --- 调试日志 --- 
console.log("[services/api.js] Axios instance created. Effective baseURL:", api.defaults.baseURL);
// --- 结束调试日志 ---

// 性能监控函数 - 简化版
const recordApiPerformance = (url, method, duration, status) => {
  if (window.performanceMonitor && typeof window.performanceMonitor.recordApiCall === 'function') {
    try {
      window.performanceMonitor.recordApiCall(url, method, duration, status);
    } catch (e) {
      console.warn('API性能记录失败:', e);
    }
  }
};

// 请求拦截器
api.interceptors.request.use(
  async config => {
    // 记录请求开始时间
    config.requestStartTime = performance.now();
    
    // 从状态管理中获取认证信息
    const authStore = useAuthStore();
    
    // 如果有token，添加到请求头
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 计算请求持续时间
    const duration = response.config?.requestStartTime ? 
      performance.now() - response.config.requestStartTime : 0;
    
    // 记录API调用性能
    if (response.config) {
      recordApiPerformance(
        response.config.url,
        response.config.method,
        duration,
        response.status
      );
    }
    
    // 如果是 204 No Content，直接返回整个 response，因为没有 data
    if (response.status === 204) {
      return response;
    }
    
    // 其他成功情况，返回 response.data
    return response.data;
  },
  async error => {
    // 计算请求持续时间
    const duration = error.config?.requestStartTime ? 
      performance.now() - error.config.requestStartTime : 0;
    
    // 记录API调用性能（失败）
    if (error.config) {
      recordApiPerformance(
        error.config.url,
        error.config.method,
        duration,
        error.response?.status || 0
      );
    }
    
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      console.warn('收到 401 Unauthorized 错误，执行登出操作。');
      const authStore = useAuthStore();
      
      // *** 修改：不再尝试刷新 Token，直接登出 ***
      await authStore.logout(); 
      
      // 可选：重定向到登录页面
      // import router from '@/router'; // 需要在文件顶部导入 router
      // router.push('/login');
      
      // 抛出特定错误或原始错误，让调用处知道认证失败
      // 可以创建一个自定义错误或直接 reject
      return Promise.reject(new Error('会话已过期或无效，请重新登录。')); 
      
      // --- 原刷新 Token 逻辑 (注释掉) ---
      // // 尝试刷新Token
      // const tokenRefreshed = await authStore.refreshAccessToken();
      // 
      // // 如果Token刷新成功，重试原请求
      // if (tokenRefreshed && error.config) {
      //   // 更新请求配置中的Authorization头
      //   error.config.headers['Authorization'] = `Bearer ${authStore.token}`;
      //   return api(error.config);
      // }
      // --- 结束原刷新 Token 逻辑 ---
    }
    
    console.error('API请求错误:', error);
    // 对于非 401 错误，继续抛出原始错误
    return Promise.reject(error); 
  }
)

// API接口
export const homeApi = {
  getHomeData: () => api.get('/api/home')
}

export const resourceApi = {
  getResources: (page = 1, category = '') => {
    const params = { page }
    if (category) params.category = category
    return api.get('/api/resources', { params })
  },
  getResourceById: (id) => api.get(`/api/resources/${id}`)
}

export const newsApi = {
  getNewsList: (page = 1) => api.get('/api/news', { params: { page } }),
  getNewsById: (id) => api.get(`/api/news/${id}`)
}

// 认证相关API
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyLeanCloudToken: (sessionToken) => api.post('/api/auth/verify-leancloud-token', { sessionToken }),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken })
}

export default api; 