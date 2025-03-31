import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在此处添加请求头等配置
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 统一处理响应数据格式
    return response.data
  },
  error => {
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

export default api 