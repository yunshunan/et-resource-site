/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// 导入要测试的store
import { useResourceStore } from '../src/stores/resources';
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

describe('Resource Store 分支覆盖率测试', () => {
  let resourceStore;

  beforeEach(() => {
    // 创建一个新的pinia实例
    const pinia = createPinia();
    setActivePinia(pinia);
    
    // 获取resource store
    resourceStore = useResourceStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });
  
  // 测试资源列表获取时的过滤器边缘情况
  describe('fetchResources函数的分支覆盖', () => {
    it('应正确处理没有过滤条件的情况', async () => {
      // 模拟成功响应
      axios.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', title: 'Test Resource' }],
        pagination: { currentPage: 1, totalPages: 1, total: 1 }
      });
      
      // 调用没有参数的fetchResources
      await resourceStore.fetchResources();
      
      // 验证API调用
      expect(axios.get).toHaveBeenCalledWith('/resources', { 
        params: expect.objectContaining({ page: 1 }) 
      });
    });
    
    it('应正确合并和更新过滤条件', async () => {
      // 设置初始过滤条件
      resourceStore.filters.category = 'initial-category';
      resourceStore.filters.search = 'initial-search';
      
      // 模拟成功响应
      axios.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', title: 'Test Resource' }],
        pagination: { currentPage: 1, totalPages: 1, total: 1 }
      });
      
      // 调用fetchResources并传入新的过滤条件
      const newFilters = { 
        category: 'new-category',
        search: 'new-search'
      };
      await resourceStore.fetchResources(2, newFilters);
      
      // 验证过滤条件已更新
      expect(resourceStore.filters.category).toBe('new-category');
      expect(resourceStore.filters.search).toBe('new-search');
      
      // 验证API调用参数
      expect(axios.get).toHaveBeenCalledWith('/resources', { 
        params: expect.objectContaining({ 
          page: 2, 
          category: 'new-category',
          search: 'new-search'
        })
      });
    });
    
    it('应只更新提供的过滤条件', async () => {
      // 设置初始过滤条件
      resourceStore.filters.category = 'initial-category';
      resourceStore.filters.search = 'initial-search';
      
      // 模拟成功响应
      axios.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', title: 'Test Resource' }],
        pagination: { currentPage: 1, totalPages: 1, total: 1 }
      });
      
      // 只更新category
      await resourceStore.fetchResources(1, { category: 'new-category' });
      
      // 验证只有category被更新
      expect(resourceStore.filters.category).toBe('new-category');
      expect(resourceStore.filters.search).toBe('initial-search');
    });
  });
  
  // 测试更新资源时的分支覆盖
  describe('updateResource函数的分支覆盖', () => {
    it('应更新当前查看的资源', async () => {
      // 设置当前资源
      resourceStore.resource = { _id: '123', title: 'Current Resource' };
      
      // 模拟更新成功
      const updatedResource = { _id: '123', title: 'Updated Resource' };
      axios.put.mockResolvedValue({
        success: true,
        data: updatedResource
      });
      
      // 执行更新
      const result = await resourceStore.updateResource('123', { title: 'Updated Resource' });
      
      // 验证API调用
      expect(axios.put).toHaveBeenCalledWith('/resources/123', { title: 'Updated Resource' });
      
      // 验证当前资源已更新
      expect(resourceStore.resource).toEqual(updatedResource);
      expect(result).toEqual(updatedResource);
    });
    
    it('不应更新不匹配的资源', async () => {
      // 设置当前资源
      const originalResource = { _id: '999', title: 'Other Resource' };
      resourceStore.resource = originalResource;
      
      // 模拟更新成功
      const updatedResource = { _id: '123', title: 'Updated Resource' };
      axios.put.mockResolvedValue({
        success: true,
        data: updatedResource
      });
      
      // 执行更新其他资源
      const result = await resourceStore.updateResource('123', { title: 'Updated Resource' });
      
      // 验证API调用
      expect(axios.put).toHaveBeenCalledWith('/resources/123', { title: 'Updated Resource' });
      
      // 验证当前资源没有更新
      expect(resourceStore.resource).toEqual(originalResource);
      expect(result).toEqual(updatedResource);
    });
  });
  
  // 测试删除资源函数
  describe('deleteResource函数的分支覆盖', () => {
    it('应从列表中移除删除的资源', async () => {
      // 设置资源列表
      resourceStore.resources = [
        { _id: '1', title: 'Resource 1' },
        { _id: '2', title: 'Resource 2' },
        { _id: '3', title: 'Resource 3' }
      ];
      
      // 模拟删除成功
      axios.delete.mockResolvedValue({
        success: true
      });
      
      // 执行删除
      const result = await resourceStore.deleteResource('2');
      
      // 验证资源被从列表中移除
      expect(resourceStore.resources).toHaveLength(2);
      expect(resourceStore.resources.find(r => r._id === '2')).toBeUndefined();
      expect(result).toBe(true);
    });
  });
  
  // 测试收藏/取消收藏函数
  describe('toggleFavorite函数的分支覆盖', () => {
    it('应更新当前资源的收藏状态', async () => {
      // 设置当前资源
      resourceStore.resource = { 
        _id: '123', 
        title: 'Test Resource',
        favorites: ['user1'],
        favoriteCount: 1
      };
      
      // 模拟收藏操作成功
      axios.put.mockResolvedValue({
        success: true,
        data: {
          favorites: ['user1', 'user2'],
          favoriteCount: 2
        }
      });
      
      // 执行收藏操作
      await resourceStore.toggleFavorite('123');
      
      // 验证当前资源的收藏状态已更新
      expect(resourceStore.resource.favorites).toEqual(['user1', 'user2']);
      expect(resourceStore.resource.favoriteCount).toBe(2);
    });
    
    it('不应更新不匹配的资源', async () => {
      // 设置当前资源
      const originalResource = { 
        _id: '999', 
        title: 'Other Resource',
        favorites: ['user1'],
        favoriteCount: 1
      };
      resourceStore.resource = originalResource;
      
      // 模拟收藏操作成功
      axios.put.mockResolvedValue({
        success: true,
        data: {
          favorites: ['user1', 'user2'],
          favoriteCount: 2
        }
      });
      
      // 执行收藏操作在不同的资源上
      await resourceStore.toggleFavorite('123');
      
      // 验证当前资源没有更新
      expect(resourceStore.resource).toEqual(originalResource);
    });
  });
  
  // 测试评分函数
  describe('rateResource函数的分支覆盖', () => {
    it('应更新当前资源的评分', async () => {
      // 设置当前资源
      resourceStore.resource = { 
        _id: '123', 
        title: 'Test Resource',
        averageRating: 4.0,
        ratingCount: 5
      };
      
      // 模拟评分操作成功
      axios.post.mockResolvedValue({
        success: true,
        data: {
          averageRating: 4.2,
          ratingCount: 6
        }
      });
      
      // 执行评分操作
      await resourceStore.rateResource('123', 5);
      
      // 验证当前资源的评分已更新
      expect(resourceStore.resource.averageRating).toBe(4.2);
      expect(resourceStore.resource.ratingCount).toBe(6);
    });
    
    it('不应更新不匹配的资源', async () => {
      // 设置当前资源
      const originalResource = { 
        _id: '999', 
        title: 'Other Resource',
        averageRating: 4.0,
        ratingCount: 5
      };
      resourceStore.resource = originalResource;
      
      // 模拟评分操作成功
      axios.post.mockResolvedValue({
        success: true,
        data: {
          averageRating: 4.2,
          ratingCount: 6
        }
      });
      
      // 执行评分操作在不同的资源上
      await resourceStore.rateResource('123', 5);
      
      // 验证当前资源没有更新
      expect(resourceStore.resource).toEqual(originalResource);
    });
  });
  
  // 测试isFavorited getter
  describe('isFavorited getter的分支覆盖', () => {
    it('当resource为null时应返回false', () => {
      // 设置resource为null
      resourceStore.resource = null;
      
      // 调用getter
      const result = resourceStore.isFavorited('anyId');
      
      // 应该返回false
      expect(result).toBe(false);
    });
    
    it('当resource.favorites为undefined时应返回false', () => {
      // 设置resource但不包含favorites
      resourceStore.resource = { _id: '123', title: 'Test Resource' };
      resourceStore.user = { id: 'user1' };
      
      // 调用getter
      const result = resourceStore.isFavorited('123');
      
      // 应该返回false
      expect(result).toBe(false);
    });
  });
}); 