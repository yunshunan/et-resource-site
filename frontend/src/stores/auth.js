import { defineStore } from 'pinia'
import { authApi } from '@/services/api'
import { wrapApiCall } from '@/utils/errorHandler'

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
      try {
        const result = await wrapApiCall(
          () => authApi.login({ email, password }),
          this,
          '登录失败'
        );
        
        if (result) {
          // 提取用户信息和令牌
          this.user = result.user || null;
          this.token = result.tokens?.accessToken || result.accessToken || null;
          this.refreshToken = result.tokens?.refreshToken || result.refreshToken || null;
          this.isAuthenticated = !!this.token;
          return true;
        }
        
        return false;
      } catch (error) {
        return false;
      }
    },
    
    // 注册
    async register(userData) {
      try {
        const result = await wrapApiCall(
          () => authApi.register(userData),
          this,
          '注册失败'
        );
        
        if (result) {
          // 提取用户信息和令牌
          this.user = result.user || null;
          this.token = result.tokens?.accessToken || result.accessToken || null;
          this.refreshToken = result.tokens?.refreshToken || result.refreshToken || null;
          this.isAuthenticated = !!this.token;
          return true;
        }
        
        return false;
      } catch (error) {
        return false;
      }
    },
    
    // 注销
    async logout() {
      try {
        if (this.isAuthenticated) {
          await wrapApiCall(
            () => authApi.logout(),
            null, // 不需要设置loading和error状态
            '注销失败'
          );
        }
      } catch (error) {
        // 即使注销失败，我们仍然要清除本地状态
        console.error('注销失败:', error);
      } finally {
        // 清除认证状态
        this.clearAuth();
      }
    },
    
    // 清除认证状态
    clearAuth() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.error = null;
    },
    
    // 获取当前用户信息
    async fetchCurrentUser() {
      if (!this.token) return false;
      
      try {
        const result = await wrapApiCall(
          () => authApi.getMe(),
          this,
          '获取用户信息失败'
        );
        
        if (result) {
          this.user = result;
          this.isAuthenticated = true;
          return true;
        }
        
        return false;
      } catch (error) {
        // 如果出现401错误，表示token已过期，执行注销
        if (error.response?.status === 401) {
          this.clearAuth();
        }
        return false;
      }
    },
    
    // 刷新token
    async refreshAccessToken() {
      if (!this.refreshToken) return false;
      
      try {
        const result = await wrapApiCall(
          () => authApi.refreshToken(this.refreshToken),
          null, // 不需要设置loading和error状态
          '刷新token失败'
        );
        
        if (result) {
          // 更新token
          this.token = result.accessToken || null;
          return !!this.token;
        }
        
        return false;
      } catch (error) {
        // 如果刷新失败，清除认证状态
        this.clearAuth();
        return false;
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