import { defineStore } from 'pinia'
import axios from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    // 获取当前用户
    currentUser: (state) => state.user,
    
    // 检查用户是否已登录
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    
    // 检查是否是管理员
    isAdmin: (state) => state.user && state.user.role === 'admin'
  },
  
  actions: {
    // 登录
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        // 实际项目中连接到后端API
        // const response = await axios.post('/api/auth/login', { email, password })
        // this.user = response.data.user
        // this.token = response.data.token
        
        // 模拟登录成功 - 实际项目中替换为真实API调用
        this.user = {
          id: 1,
          username: 'testuser',
          email: email,
          role: 'user'
        }
        this.token = 'sample-token-xyz'
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败，请检查您的账号和密码'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 注册
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        // 实际项目中连接到后端API
        // const response = await axios.post('/api/auth/register', userData)
        // this.user = response.data.user
        // this.token = response.data.token
        
        // 模拟注册成功 - 实际项目中替换为真实API调用
        this.user = {
          id: 2,
          username: userData.username,
          email: userData.email,
          role: 'user'
        }
        this.token = 'sample-token-xyz'
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败，请稍后再试'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 注销
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
    },
    
    // 获取当前用户信息
    async fetchCurrentUser() {
      if (!this.token) return
      
      this.loading = true
      
      try {
        // 实际项目中从API获取
        // const response = await axios.get('/api/auth/me')
        // this.user = response.data.data
        
        // 模拟获取用户数据 - 实际项目中替换为真实API调用
        this.user = {
          id: this.user?.id || 1,
          username: this.user?.username || 'testuser',
          email: this.user?.email || 'test@example.com',
          role: this.user?.role || 'user'
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户信息失败'
        // 如果出现401错误，表示token已过期，执行注销
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    }
  },
  
  // 持久化存储
  persist: {
    key: 'et-auth',
    storage: localStorage,
    paths: ['token', 'user', 'isAuthenticated']
  }
}) 