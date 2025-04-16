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
        
        // 检查后端返回的 result 是否包含 token 和 user
        if (result && result.token && result.user) {
          console.log('Step 1: Inside IF block, result valid.'); // 日志 1
          
          // 使用后端 API 返回的 user 对象更新状态
          this.user = {
            id: result.user.id, 
            email: result.user.email,
            username: result.user.username,
            role: result.user.role || 'user',
            avatar: result.user.avatar,
            createdAt: result.user.createdAt
          };
          console.log('Step 2: User state assigned.', this.user); // 日志 2
          
          this.token = result.token;
          console.log('Step 3: Token state assigned.'); // 日志 3
          
          this.isAuthenticated = true;
          console.log('Step 4: isAuthenticated state assigned.'); // 日志 4
          
          // 保存JWT到localStorage
          try {
            localStorage.setItem('jwt', result.token);
            console.log('Step 5: Token saved to localStorage.'); // 日志 5
          } catch (storageError) {
            console.error('Error saving token to localStorage:', storageError);
            this.error = '无法保存登录状态，请检查浏览器设置';
            return false; // 保存失败则登录失败
          }
          
          console.log('Step 6 (Final): Auth state updated successfully:', this.user);
          return true; // 确认成功
        } else {
          // 如果后端响应不完整，记录错误并设置错误状态
          console.error('Login failed: Backend response missing token or user info.', result);
          this.error = '登录失败：服务器响应数据不完整';
          return false;
        }
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
    
    // **** Added checkAuth action ****
    async checkAuth() {
      console.log('checkAuth started. Current token:', this.token);
      if (!this.token) {
        console.log('checkAuth: No token found.');
        this.isAuthenticated = false; // Ensure state consistency
        this.user = null;           // Ensure state consistency
        return false; // No token, definitely not authenticated
      }

      this.loading = true;
      try {
        // Assuming authApi has getMe method calling GET /api/auth/me
        // Ensure axios instance used by authApi has interceptor for token
        const response = await authApi.getMe(); 

        if (response && response.success && response.user) {
          console.log('checkAuth successful. User:', response.user);
          this.user = response.user; // Update with fresh user data
          this.isAuthenticated = true; // Confirm authentication
          // Optionally update localStorage user if persist plugin doesn't handle object updates well
          // localStorage.setItem('et-auth', JSON.stringify({ token: this.token, user: this.user, isAuthenticated: this.isAuthenticated }));
          return true;
        } else {
          console.warn('checkAuth: API response invalid or indicates failure.', response);
          await this.logout(); // Clear invalid state if response is not successful
          return false;
        }
      } catch (error) {
        // API call failed (e.g., 401 Unauthorized for invalid/expired token)
        console.error('checkAuth failed:', error);
        // Check if it's a 401 or similar auth error
        if (error.response?.status === 401 || error.response?.status === 403) {
             console.log('checkAuth: Token invalid or expired. Logging out.');
             await this.logout(); // Clear invalid token and state
        } else {
             // For other errors (network, server error), maybe just log 
             // and keep existing potentially stale state? Or logout?
             // Choosing to logout for now to ensure clean state.
             console.log('checkAuth: Non-auth error during check. Logging out for safety.');
             await this.logout();
        }
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
  },
  
  // 持久化存储
  persist: {
    key: 'et-auth',
    storage: localStorage,
    paths: ['token', 'user', 'isAuthenticated']
  }
}) 