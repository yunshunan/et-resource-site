/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// 导入模拟响应
import { 
  mockLoginSuccess, 
  mockRefreshTokenSuccess 
} from './mock/authApiMock';

// 模拟API
vi.mock('../src/services/api', () => {
  const mockGetMe = vi.fn();
  const mockRefreshToken = vi.fn();
  const mockLogout = vi.fn();
  
  return {
    authApi: {
      getMe: mockGetMe,
      refreshToken: mockRefreshToken,
      logout: mockLogout
    }
  };
});

// 导入要测试的store
import { useAuthStore } from '../src/stores/auth';
import { authApi } from '../src/services/api';

describe('Auth Store 分支覆盖率测试', () => {
  let authStore;

  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    pinia.use(createPersistedState());
    setActivePinia(pinia);
    
    // 获取auth store
    authStore = useAuthStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });
  
  // 测试fetchCurrentUser方法中特定边缘情况
  describe('fetchCurrentUser边缘情况', () => {
    it('当无token时应提早返回', async () => {
      // 确保token为null
      authStore.token = null;
      
      // 调用fetchCurrentUser
      await authStore.fetchCurrentUser();
      
      // 验证getMe不被调用
      expect(authApi.getMe).not.toHaveBeenCalled();
    });
    
    it('当API返回成功但响应无success标志时应抛出错误', async () => {
      // 设置token
      authStore.token = 'valid-token';
      
      // 模拟API响应不带success标志
      authApi.getMe.mockResolvedValue({
        data: { id: '1', name: 'Test User' }
      });
      
      // 调用fetchCurrentUser
      await authStore.fetchCurrentUser();
      
      // 验证错误状态
      expect(authStore.error).toBe('获取用户信息失败');
      expect(authStore.isAuthenticated).toBe(false);
    });
    
    it('当出现401错误时应执行注销', async () => {
      // 设置token和认证状态
      authStore.token = 'expired-token';
      authStore.isAuthenticated = true;
      authStore.user = { id: '1', name: 'Test User' };
      
      // 模拟401错误
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      authApi.getMe.mockRejectedValue(error);
      
      // 覆写logout方法
      const originalLogout = authStore.logout;
      let logoutCalled = false;
      authStore.logout = async () => {
        logoutCalled = true;
        authStore.token = null;
        authStore.isAuthenticated = false;
        authStore.user = null;
      };
      
      // 调用fetchCurrentUser
      await authStore.fetchCurrentUser();
      
      // 验证logout被调用
      expect(logoutCalled).toBe(true);
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      
      // 恢复原始方法
      authStore.logout = originalLogout;
    });
    
    it('当出现非401错误时应设置错误消息', async () => {
      // 设置token
      authStore.token = 'valid-token';
      
      // 模拟500错误
      const error = new Error('Server Error');
      error.response = { 
        status: 500,
        data: { message: '服务器内部错误' }
      };
      authApi.getMe.mockRejectedValue(error);
      
      // 调用fetchCurrentUser
      await authStore.fetchCurrentUser();
      
      // 验证错误状态
      expect(authStore.error).toBe('服务器内部错误');
      expect(authStore.loading).toBe(false);
    });
  });
  
  // 测试refreshAccessToken方法中特定边缘情况
  describe('refreshAccessToken边缘情况', () => {
    it('当无refreshToken时应返回false', async () => {
      // 确保refreshToken为null
      authStore.refreshToken = null;
      
      // 调用refreshAccessToken
      const result = await authStore.refreshAccessToken();
      
      // 验证结果和API调用
      expect(result).toBe(false);
      expect(authApi.refreshToken).not.toHaveBeenCalled();
    });
    
    it('当刷新成功但响应无success标志时应返回false', async () => {
      // 设置refreshToken
      authStore.refreshToken = 'valid-refresh-token';
      
      // 模拟API响应不带success标志
      authApi.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token'
      });
      
      // 调用refreshAccessToken
      const result = await authStore.refreshAccessToken();
      
      // 验证结果
      expect(result).toBe(false);
      expect(authStore.token).not.toBe('new-access-token');
    });
    
    it('当刷新失败时应执行注销', async () => {
      // 设置token和refreshToken
      authStore.token = 'old-token';
      authStore.refreshToken = 'invalid-refresh-token';
      authStore.isAuthenticated = true;
      authStore.user = { id: '1', name: 'Test User' };
      
      // 模拟网络错误
      authApi.refreshToken.mockRejectedValue(new Error('Network Error'));
      
      // 调用refreshAccessToken
      const result = await authStore.refreshAccessToken();
      
      // 验证结果
      expect(result).toBe(false);
      expect(authStore.token).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });
}); 