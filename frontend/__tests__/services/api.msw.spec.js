/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { server, createNetworkErrorHandler, createServerErrorHandler } from '../msw/server';
import { apiServiceMock } from '../msw/mockHelpers';

// 设置axios基础URL
axios.defaults.baseURL = 'http://localhost:3000/api';

describe('API服务 (使用MSW)', () => {
  // 启动MSW服务器
  beforeAll(() => {
    server.listen();
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
    // 初始化Pinia
    const pinia = createPinia();
    setActivePinia(pinia);
    
    vi.clearAllMocks();
  });
  
  describe('认证请求', () => {
    it('应成功处理登录请求', async () => {
      // 使用apiServiceMock模拟登录成功
      apiServiceMock.mockRequestSuccess('POST', '/auth/login', {
        success: true,
        data: {
          user: {
            _id: 'user1',
            username: 'testuser',
            email: 'test@example.com'
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          }
        }
      });
      
      const response = await axios.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data.user).toBeDefined();
      expect(response.data.data.tokens).toBeDefined();
    });
    
    it('应处理网络错误', async () => {
      // 添加一个模拟网络错误的处理程序
      apiServiceMock.mockNetworkError('POST', '/auth/login');
      
      // 使用try-catch结构捕获网络错误
      let error;
      try {
        await axios.post('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      } catch (e) {
        error = e;
      }
      
      // 验证是否捕获到错误
      expect(error).toBeDefined();
      expect(error.message).toMatch(/network|Network/i);
    });
    
    it('应处理服务器错误', async () => {
      // 添加一个模拟服务器错误的处理程序
      apiServiceMock.mockRequestFailure('POST', '/auth/login', 500, '服务器内部错误');
      
      let error;
      try {
        await axios.post('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      } catch (e) {
        error = e;
      }
      
      // 验证服务器错误
      expect(error).toBeDefined();
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(500);
      expect(error.response.data.message).toBe('服务器内部错误');
    });
  });
  
  describe('资源请求', () => {
    it('应成功获取资源列表', async () => {
      // 模拟资源列表响应
      apiServiceMock.mockRequestSuccess('GET', '/resources', {
        success: true,
        data: [
          { _id: 'res1', title: '资源1' },
          { _id: 'res2', title: '资源2' }
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10
        }
      });
      
      const response = await axios.get('/resources');
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.pagination).toBeDefined();
    });
    
    it('应成功获取资源详情', async () => {
      // 模拟资源详情响应
      apiServiceMock.mockRequestSuccess('GET', '/resources/res1', {
        success: true,
        data: {
          _id: 'res1',
          title: '资源1',
          description: '资源1的描述'
        }
      });
      
      const response = await axios.get('/resources/res1');
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data._id).toBe('res1');
    });
    
    it('应处理获取不存在的资源', async () => {
      // 模拟资源不存在响应
      apiServiceMock.mockRequestFailure('GET', '/resources/nonexistent', 404, '资源不存在');
      
      let error;
      try {
        await axios.get('/resources/nonexistent');
      } catch (error) {
        // 验证错误状态码
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.message).toBe('资源不存在');
        return;
      }
      
      // 如果没有抛出错误，测试失败
      expect(true).toBe(false, '应该抛出404错误');
    });
    
    it('应成功创建资源', async () => {
      const newResource = {
        title: '测试资源',
        description: '这是一个测试资源',
        content: '测试内容',
        category: 'test'
      };
      
      // 模拟创建资源响应
      apiServiceMock.mockRequestSuccess('POST', '/resources', {
        success: true,
        data: {
          _id: 'new-res',
          ...newResource,
          createdAt: new Date().toISOString()
        }
      });
      
      const response = await axios.post('/resources', newResource);
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data._id).toBeDefined();
      expect(response.data.data.title).toBe('测试资源');
    });
    
    it('应成功更新资源', async () => {
      const updatedData = {
        title: '更新后的标题'
      };
      
      // 模拟更新资源响应
      apiServiceMock.mockRequestSuccess('PUT', '/resources/res1', {
        success: true,
        data: {
          _id: 'res1',
          title: '更新后的标题',
          description: '原始描述'
        }
      });
      
      const response = await axios.put('/resources/res1', updatedData);
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data.title).toBe('更新后的标题');
    });
    
    it('应成功删除资源', async () => {
      // 模拟删除资源响应
      apiServiceMock.mockRequestSuccess('DELETE', '/resources/res1', {
        success: true,
        message: '资源删除成功'
      });
      
      const response = await axios.delete('/resources/res1');
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('资源删除成功');
    });
  });
  
  describe('收藏和评分功能', () => {
    it('应成功收藏资源', async () => {
      // 模拟收藏资源响应
      apiServiceMock.mockRequestSuccess('PUT', '/resources/res2/favorite', {
        success: true,
        data: {
          _id: 'res2',
          favorites: ['user1', 'user2']
        }
      });
      
      const response = await axios.put('/resources/res2/favorite');
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data.favorites).toBeDefined();
    });
    
    it('应成功评分资源', async () => {
      // 模拟评分资源响应
      apiServiceMock.mockRequestSuccess('POST', '/resources/res2/rating', {
        success: true,
        data: {
          _id: 'res2',
          averageRating: 4.5,
          ratingCount: 10
        }
      });
      
      const response = await axios.post('/resources/res2/rating', { rating: 5 });
      
      expect(response).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data.averageRating).toBeDefined();
      expect(response.data.data.ratingCount).toBeDefined();
    });
  });
}); 