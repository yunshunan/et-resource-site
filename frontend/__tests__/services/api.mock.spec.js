/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { useAuthStore } from '../../src/stores/auth';
import api, { authApi, resourceApi } from '../../src/services/api';
import { server, apiServiceMock } from '../msw/server';
import { rest } from 'msw';

// 测试API服务与MSW集成
describe('API Service with MSW', () => {
  let authStore;
  
  // 启动MSW服务器
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });
  
  // 每次测试后重置处理程序
  afterEach(() => {
    server.resetHandlers();
  });
  
  // 关闭MSW服务器
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    pinia.use(createPersistedState());
    setActivePinia(pinia);
    
    // 获取认证store
    authStore = useAuthStore();
    authStore.token = 'test-token';
    
    // 清除所有模拟
    vi.clearAllMocks();
  });
  
  describe('API基本请求功能', () => {
    it('应正确处理GET请求并返回数据', async () => {
      // 设置mock响应
      const mockData = { id: 1, name: 'Test' };
      apiServiceMock.mockRequestSuccess('GET', '/test', mockData);
      
      // 调用API
      const result = await api.get('/test');
      
      // 验证结果
      expect(result).toEqual(mockData);
    });
    
    it('应正确处理POST请求并返回数据', async () => {
      // 设置mock响应
      const mockData = { success: true, id: 1 };
      apiServiceMock.mockRequestSuccess('POST', '/test', mockData);
      
      // 调用API
      const result = await api.post('/test', { name: 'Test' });
      
      // 验证结果
      expect(result).toEqual(mockData);
    });
    
    it('应正确处理PUT请求并返回数据', async () => {
      // 设置mock响应
      const mockData = { success: true, id: 1 };
      apiServiceMock.mockRequestSuccess('PUT', '/test/1', mockData);
      
      // 调用API
      const result = await api.put('/test/1', { name: 'Updated' });
      
      // 验证结果
      expect(result).toEqual(mockData);
    });
    
    it('应正确处理DELETE请求并返回数据', async () => {
      // 设置mock响应
      const mockData = { success: true };
      apiServiceMock.mockRequestSuccess('DELETE', '/test/1', mockData);
      
      // 调用API
      const result = await api.delete('/test/1');
      
      // 验证结果
      expect(result).toEqual(mockData);
    });
  });
  
  describe('API错误处理', () => {
    it('应处理请求失败并抛出适当的错误', async () => {
      // 设置mock响应
      apiServiceMock.mockRequestFailure('GET', '/test', 500, 'Server Error');
      
      // 调用API并捕获错误
      try {
        await api.get('/test');
        // 如果没有抛出错误，测试失败
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Server Error');
      }
    });
    
    it('应处理网络错误', async () => {
      // 设置mock响应
      apiServiceMock.mockNetworkError('GET', '/test');
      
      // 调用API并捕获错误
      try {
        await api.get('/test');
        // 如果没有抛出错误，测试失败
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Network Error');
      }
    });
  });
  
  describe('API认证功能', () => {
    it('应在请求头中添加认证token', async () => {
      // 设置mock handler，检查请求头
      server.use(
        rest.get('*/auth-check', (req, res, ctx) => {
          const authHeader = req.headers.get('Authorization');
          
          // 验证认证头
          if (authHeader === 'Bearer test-token') {
            return res(ctx.json({ authorized: true }));
          } else {
            return res(ctx.status(401), ctx.json({ authorized: false }));
          }
        })
      );
      
      // 调用API
      const result = await api.get('/auth-check');
      
      // 验证结果
      expect(result).toEqual({ authorized: true });
    });
    
    it('当token过期时应尝试刷新并重试请求', async () => {
      // 计数器，跟踪请求尝试次数
      let attempts = 0;
      
      // 设置mock handler，第一次返回401，第二次成功
      server.use(
        rest.get('*/protected-resource', (req, res, ctx) => {
          attempts++;
          
          if (attempts === 1) {
            // 第一次请求，返回401
            return res(ctx.status(401), ctx.json({ message: 'Token expired' }));
          } else {
            // 第二次请求，检查新token并返回成功
            const authHeader = req.headers.get('Authorization');
            if (authHeader === 'Bearer new-test-token') {
              return res(ctx.json({ success: true, data: 'Protected data' }));
            } else {
              return res(ctx.status(401), ctx.json({ message: 'Invalid token' }));
            }
          }
        })
      );
      
      // 模拟token刷新函数
      const originalRefreshToken = authStore.refreshAccessToken;
      authStore.refreshAccessToken = vi.fn().mockImplementation(async () => {
        authStore.token = 'new-test-token';
        return true;
      });
      
      // 调用API
      const result = await api.get('/protected-resource');
      
      // 验证结果
      expect(attempts).toBe(2); // 确认请求被重试
      expect(authStore.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true, data: 'Protected data' });
      
      // 恢复原始函数
      authStore.refreshAccessToken = originalRefreshToken;
    });
  });
}); 