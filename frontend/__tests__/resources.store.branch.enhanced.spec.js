/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// 导入要测试的store
import { useResourceStore } from '../src/stores/resources';
import { useAuthStore } from '../src/stores/auth';
import axios from '../src/services/api';

// 模拟API
vi.mock('../src/services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  };
});

describe('Resource Store 增强分支覆盖率测试', () => {
  let resourceStore;
  let authStore;

  beforeEach(() => {
    // 创建一个新的pinia实例
    const pinia = createPinia();
    setActivePinia(pinia);
    
    // 获取resource store和auth store
    resourceStore = useResourceStore();
    authStore = useAuthStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });
  
  // 测试isFavorited getter的各种边界情况
  describe('isFavorited getter的分支覆盖', () => {
    it('当resource为null时应返回false', () => {
      resourceStore.resource = null;
      
      const result = resourceStore.isFavorited('anyId');
      
      expect(result).toBe(false);
    });
    
    it('当resource.favorites不存在时应返回false', () => {
      resourceStore.resource = { _id: '123', title: 'Test Resource' };
      
      const result = resourceStore.isFavorited('anyId');
      
      expect(result).toBe(false);
    });
    
    it('当resourceId不在favorites列表中时应返回false', () => {
      resourceStore.resource = { 
        _id: '123', 
        title: 'Test Resource',
        favorites: ['user1', 'user2']
      };
      
      const result = resourceStore.isFavorited('user3');
      
      expect(result).toBe(false);
    });
    
    it('当resourceId在favorites列表中时应返回true', () => {
      resourceStore.resource = { 
        _id: '123', 
        title: 'Test Resource',
        favorites: ['user1', 'user2', 'user3']
      };
      
      const result = resourceStore.isFavorited('user2');
      
      expect(result).toBe(true);
    });
  });
  
  // 测试API响应的成功/失败分支
  describe('API响应处理的分支覆盖', () => {
    it('fetchResources应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.get.mockResolvedValue({
        success: false,
        message: '服务器错误'
      });
      
      await resourceStore.fetchResources();
      
      // 验证错误被正确设置
      expect(resourceStore.error).toBe('服务器错误');
      expect(resourceStore.loading).toBe(false);
    });
    
    it('fetchResourceById应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.get.mockResolvedValue({
        success: false,
        message: '资源不存在'
      });
      
      await resourceStore.fetchResourceById('999');
      
      // 验证错误被正确设置
      expect(resourceStore.error).toBe('资源不存在');
      expect(resourceStore.loading).toBe(false);
    });
    
    it('createResource应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.post.mockResolvedValue({
        success: false,
        message: '创建失败，缺少必要字段'
      });
      
      const result = await resourceStore.createResource({});
      
      // 验证错误被正确设置，结果为null
      expect(resourceStore.error).toBe('创建失败，缺少必要字段');
      expect(resourceStore.loading).toBe(false);
      expect(result).toBeNull();
    });
    
    it('updateResource应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.put.mockResolvedValue({
        success: false,
        message: '更新失败，无权限'
      });
      
      const result = await resourceStore.updateResource('123', {});
      
      // 验证错误被正确设置，结果为null
      expect(resourceStore.error).toBe('更新失败，无权限');
      expect(resourceStore.loading).toBe(false);
      expect(result).toBeNull();
    });
    
    it('deleteResource应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.delete.mockResolvedValue({
        success: false,
        message: '删除失败，无权限'
      });
      
      const result = await resourceStore.deleteResource('123');
      
      // 验证错误被正确设置，结果为false
      expect(resourceStore.error).toBe('删除失败，无权限');
      expect(resourceStore.loading).toBe(false);
      expect(result).toBe(false);
    });
    
    it('toggleFavorite应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.put.mockResolvedValue({
        success: false,
        message: '收藏操作失败，请先登录'
      });
      
      const result = await resourceStore.toggleFavorite('123');
      
      // 验证错误被正确设置，结果为null
      expect(resourceStore.error).toBe('收藏操作失败，请先登录');
      expect(result).toBeNull();
    });
    
    it('rateResource应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.post.mockResolvedValue({
        success: false,
        message: '评分操作失败，请先登录'
      });
      
      const result = await resourceStore.rateResource('123', 5);
      
      // 验证错误被正确设置，结果为null
      expect(resourceStore.error).toBe('评分操作失败，请先登录');
      expect(result).toBeNull();
    });
    
    it('fetchFavorites应处理API响应不成功的情况', async () => {
      // 模拟API响应失败但没有抛出异常
      axios.get.mockResolvedValue({
        success: false,
        message: '获取收藏列表失败，请先登录'
      });
      
      await resourceStore.fetchFavorites();
      
      // 验证错误被正确设置
      expect(resourceStore.error).toBe('获取收藏列表失败，请先登录');
      expect(resourceStore.loading).toBe(false);
    });
  });
}); 