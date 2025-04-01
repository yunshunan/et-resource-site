import { defineStore } from 'pinia'
import { authApi } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
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
    isAdmin: (state) => state.user && state.user.role === 'admin' ? true : false
  },
  
  actions: {
    // 登录
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.login({ email, password })
        if (response.success) {
          this.user = response.user
          this.token = response.accessToken
          this.refreshToken = response.refreshToken
          this.isAuthenticated = true
          return true
        } else {
          throw new Error(response.message || '登录失败')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '登录失败，请检查您的账号和密码'
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
        const response = await authApi.register(userData)
        if (response.success) {
          this.user = response.user
          this.token = response.accessToken
          this.refreshToken = response.refreshToken
          this.isAuthenticated = true
          return true
        } else {
          throw new Error(response.message || '注册失败')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '注册失败，请稍后再试'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 注销
    async logout() {
      try {
        if (this.isAuthenticated) {
          await authApi.logout()
        }
      } catch (error) {
        console.error('注销时发生错误:', error)
      } finally {
        this.user = null
        this.token = null
        this.refreshToken = null
        this.isAuthenticated = false
        this.error = null
      }
    },
    
    // 获取当前用户信息
    async fetchCurrentUser() {
      if (!this.token) return
      
      this.loading = true
      
      try {
        const response = await authApi.getMe()
        if (response.success) {
          this.user = response.data
          this.isAuthenticated = true
        } else {
          throw new Error(response.message || '获取用户信息失败')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '获取用户信息失败'
        // 如果出现401错误，表示token已过期，执行注销
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },
    
    // 刷新token
    async refreshAccessToken() {
      if (!this.refreshToken) return false
      
      try {
        const response = await authApi.refreshToken(this.refreshToken)
        if (response.success) {
          this.token = response.accessToken
          return true
        }
        return false
      } catch (error) {
        console.error('刷新token失败:', error)
        // 如果刷新失败，执行注销
        await this.logout()
        return false
      }
    }
  },
  
  // 持久化存储
  persist: {
    key: 'et-auth',
    storage: localStorage,
    paths: ['token', 'refreshToken', 'user', 'isAuthenticated']
  }
}) 