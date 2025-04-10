import { defineStore } from 'pinia'
import { authApi } from '@/services/api'
import AV from '@/config/leancloud'
// eslint-disable-next-line no-unused-vars
import { wrapApiCall, extractErrorMessage } from '@/utils/errorHandler'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('jwt') || null,
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
      this.loading = true;
      this.error = null;
      
      try {
        // 使用LeanCloud进行身份验证
        const user = await AV.User.logIn(email, password);
        
        // 获取LeanCloud Session Token
        const sessionToken = user.getSessionToken();
        
        // 发送令牌到后端进行验证并获取JWT
        const result = await authApi.verifyLeanCloudToken(sessionToken);
        
        if (result && result.token) {
          this.user = {
            id: user.id,
            email: user.get('email'),
            username: user.get('username'),
            role: user.get('role') || 'user',
            avatar: user.get('avatar'),
            createdAt: user.get('createdAt')
          };
          this.token = result.token;
          this.isAuthenticated = true;
          
          // 保存JWT到localStorage
          localStorage.setItem('jwt', result.token);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('登录失败:', error);
        this.error = extractErrorMessage(error) || '登录失败，请检查您的凭证';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 注册
    async register(email, password, username) {
      this.loading = true;
      this.error = null;
      
      try {
        // 使用LeanCloud创建用户
        const user = new AV.User();
        user.setUsername(username || email);
        user.setPassword(password);
        user.setEmail(email);
        
        // 添加默认角色
        user.set('role', 'user');
        
        // 注册新用户
        await user.signUp();
        
        // 注册成功后，获取LeanCloud Session Token
        const sessionToken = user.getSessionToken();
        
        // 发送令牌到后端进行验证并获取JWT
        const result = await authApi.verifyLeanCloudToken(sessionToken);
        
        if (result && result.token) {
          this.user = {
            id: user.id,
            email: user.get('email'),
            username: user.get('username'),
            role: user.get('role') || 'user',
            avatar: user.get('avatar'),
            createdAt: user.get('createdAt')
          };
          this.token = result.token;
          this.isAuthenticated = true;
          
          // 保存JWT到localStorage
          localStorage.setItem('jwt', result.token);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('注册失败:', error);
        this.error = extractErrorMessage(error) || '注册失败，请稍后重试';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 使用LeanCloud Session Token获取JWT
    async verifyLeanCloudToken(sessionToken) {
      this.loading = true;
      this.error = null;
      
      try {
        // 发送令牌到后端进行验证并获取JWT
        const result = await authApi.verifyLeanCloudToken(sessionToken);
        
        if (result && result.token) {
          this.user = result.user;
          this.token = result.token;
          this.isAuthenticated = true;
          
          // 保存JWT到localStorage
          localStorage.setItem('jwt', result.token);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('验证令牌失败:', error);
        this.error = extractErrorMessage(error) || '身份验证失败';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 注销
    async logout() {
      try {
        // 尝试登出LeanCloud
        await AV.User.logOut();
        
        // 清除本地存储
        localStorage.removeItem('jwt');
        
        // 重置状态
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.error = null;
        
        return true;
      } catch (error) {
        console.error('注销失败:', error);
        return false;
      }
    },
    
    // 初始化认证状态
    async init() {
      // 检查本地存储中是否有JWT
      const token = localStorage.getItem('jwt');
      
      if (token) {
        this.token = token;
        
        // 尝试获取用户信息
        try {
          const user = await authApi.getMe();
          
          if (user) {
            this.user = user;
            this.isAuthenticated = true;
            return true;
          }
        } catch (error) {
          // 如果令牌无效，清除认证状态
          console.error('初始化认证状态失败:', error);
          this.logout();
        }
      }
      
      return false;
    }
  },
  
  // 持久化存储
  persist: {
    key: 'et-auth',
    storage: localStorage,
    paths: ['token', 'user', 'isAuthenticated']
  }
}) 