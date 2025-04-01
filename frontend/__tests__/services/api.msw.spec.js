/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from '../../src/services/api';
import { server, createNetworkErrorHandler, createServerErrorHandler } from '../msw/server';

describe('API服务 (使用MSW)', () => {
  beforeEach(() => {
    // 初始化Pinia
    const pinia = createPinia();
    setActivePinia(pinia);
    
    vi.clearAllMocks();
  });
  
  describe('认证请求', () => {
    it('应成功处理登录请求', async () => {
      const response = await axios.post('/api/auth/login', {
        username: 'testuser',
        password: 'password'
      });
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data.user).toBeDefined();
      expect(response.data.tokens).toBeDefined();
    });
    
    it('应处理网络错误', async () => {
      // 添加一个模拟网络错误的处理程序
      server.use(createNetworkErrorHandler('post', '/api/auth/login'));
      
      // 使用try-catch结构捕获网络错误
      let error;
      try {
        await axios.post('/api/auth/login', {
          username: 'testuser',
          password: 'password'
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
      server.use(createServerErrorHandler('post', '/api/auth/login', 500, '服务器内部错误'));
      
      let error;
      try {
        await axios.post('/api/auth/login', {
          username: 'testuser',
          password: 'password'
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
      const response = await axios.get('/api/resources');
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.pagination).toBeDefined();
    });
    
    it('应成功获取资源详情', async () => {
      const response = await axios.get('/api/resources/res1');
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data._id).toBe('res1');
    });
    
    it('应处理获取不存在的资源', async () => {
      let response;
      try {
        response = await axios.get('/api/resources/nonexistent');
      } catch (error) {
        // 如果捕获到错误，验证错误状态码
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.message).toBe('资源不存在');
        return;
      }
      
      // 如果不抛出错误，验证响应是否符合预期
      expect(response.success).toBe(false);
      expect(response.message).toBe('资源不存在');
    });
    
    it('应成功创建资源', async () => {
      const newResource = {
        title: '测试资源',
        description: '这是一个测试资源',
        content: '测试内容',
        category: 'test'
      };
      
      const response = await axios.post('/api/resources', newResource);
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data._id).toBeDefined();
      expect(response.data.title).toBe('测试资源');
    });
    
    it('应成功更新资源', async () => {
      const updatedData = {
        title: '更新后的标题'
      };
      
      const response = await axios.put('/api/resources/res1', updatedData);
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data.title).toBe('更新后的标题');
    });
    
    it('应成功删除资源', async () => {
      const response = await axios.delete('/api/resources/res1');
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBe('资源删除成功');
    });
  });
  
  describe('收藏和评分功能', () => {
    it('应成功收藏资源', async () => {
      const response = await axios.put('/api/resources/res2/favorite');
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data.favorites).toBeDefined();
    });
    
    it('应成功评分资源', async () => {
      const response = await axios.post('/api/resources/res2/rating', { rating: 5 });
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data.averageRating).toBeDefined();
      expect(response.data.ratingCount).toBeDefined();
    });
  });
}); 