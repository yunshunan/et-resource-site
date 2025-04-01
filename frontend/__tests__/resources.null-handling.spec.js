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

describe('Resource Store Null处理测试', () => {
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
  
  describe('isFavorited getter', () => {
    it('当resource为null时应返回false', () => {
      resourceStore.resource = null;
      const result = resourceStore.isFavorited('123');
      expect(result).toBe(false);
    });
    
    it('当resource存在但favorites不存在时应返回false', () => {
      resourceStore.resource = { title: 'Test Resource' };
      const result = resourceStore.isFavorited('123');
      expect(result).toBe(false);
    });
    
    it('当resource和favorites存在但不包含指定ID时应返回false', () => {
      resourceStore.resource = { 
        title: 'Test Resource',
        favorites: ['456', '789']
      };
      const result = resourceStore.isFavorited('123');
      expect(result).toBe(false);
    });
    
    it('当resource和favorites存在且包含指定ID时应返回true', () => {
      resourceStore.resource = { 
        title: 'Test Resource',
        favorites: ['123', '456']
      };
      const result = resourceStore.isFavorited('123');
      expect(result).toBe(true);
    });
  });
  
  describe('API响应处理', () => {
    it('fetchResources - 应处理响应为undefined的情况', async () => {
      axios.get.mockResolvedValue(undefined);
      
      await resourceStore.fetchResources();
      
      expect(resourceStore.error).toBe('获取资源列表失败');
      expect(resourceStore.loading).toBe(false);
    });
    
    it('fetchResources - 应处理响应data为undefined的情况', async () => {
      axios.get.mockResolvedValue({
        success: true
      });
      
      await resourceStore.fetchResources();
      
      expect(resourceStore.resources).toEqual([]);
      expect(resourceStore.loading).toBe(false);
    });
    
    it('fetchResources - 应处理响应pagination为undefined的情况', async () => {
      axios.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', title: 'Test' }]
      });
      
      await resourceStore.fetchResources();
      
      expect(resourceStore.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        total: 0
      });
    });
    
    it('fetchResourceById - 应处理响应为undefined的情况', async () => {
      axios.get.mockResolvedValue(undefined);
      
      await resourceStore.fetchResourceById('123');
      
      expect(resourceStore.error).toBe('获取资源详情失败');
      expect(resourceStore.loading).toBe(false);
    });
    
    it('fetchResourceById - 应处理响应data为undefined的情况', async () => {
      axios.get.mockResolvedValue({
        success: true
      });
      
      await resourceStore.fetchResourceById('123');
      
      expect(resourceStore.resource).toBeNull();
    });
  });
}); 