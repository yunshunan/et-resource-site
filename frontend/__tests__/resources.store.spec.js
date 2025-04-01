/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// 必须先创建模拟，再导入其他模块
vi.mock('@/services/api', async () => {
  // 创建mock函数
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  // 返回模拟对象
  return {
    default: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete
    },
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete
  };
});

// 导入必须在模拟之后
import { useResourceStore } from '../src/stores/resources';
import axios from '@/services/api';

describe('Resource Store', () => {
  beforeEach(() => {
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia());
    
    // 重置所有模拟
    vi.clearAllMocks();
  });

  it('初始状态应该正确', () => {
    const resourceStore = useResourceStore();
    expect(resourceStore.resources).toEqual([]);
    expect(resourceStore.resource).toBeNull();
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
    expect(resourceStore.pagination).toEqual({
      currentPage: 1,
      totalPages: 1,
      total: 0
    });
    expect(resourceStore.favorites).toEqual([]);
    expect(resourceStore.filters).toEqual({
      category: '',
      search: ''
    });
  });

  // 测试getter方法
  describe('Getters', () => {
    it('getResources应返回资源列表', () => {
      const resourceStore = useResourceStore();
      const testResources = [
        { _id: '1', title: '资源1' },
        { _id: '2', title: '资源2' }
      ];
      resourceStore.resources = testResources;
      
      expect(resourceStore.getResources).toEqual(testResources);
    });
    
    it('getPagination应返回分页信息', () => {
      const resourceStore = useResourceStore();
      const testPagination = {
        currentPage: 2,
        totalPages: 5,
        total: 50
      };
      resourceStore.pagination = testPagination;
      
      expect(resourceStore.getPagination).toEqual(testPagination);
    });
    
    it('getCurrentResource应返回当前资源', () => {
      const resourceStore = useResourceStore();
      const testResource = { _id: '1', title: '资源1' };
      resourceStore.resource = testResource;
      
      expect(resourceStore.getCurrentResource).toEqual(testResource);
    });
    
    it('getFavorites应返回收藏列表', () => {
      const resourceStore = useResourceStore();
      const testFavorites = [
        { _id: '1', title: '收藏资源1' },
        { _id: '2', title: '收藏资源2' }
      ];
      resourceStore.favorites = testFavorites;
      
      expect(resourceStore.getFavorites).toEqual(testFavorites);
    });
  });

  it('fetchResources应正确获取资源列表', async () => {
    const resourceStore = useResourceStore();
    const mockResponse = {
      success: true,
      data: [
        { _id: '1', title: '资源1' },
        { _id: '2', title: '资源2' }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 2
      }
    };
    
    axios.get.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.fetchResources();
    
    expect(axios.get).toHaveBeenCalledWith('/resources', { params: { page: 1, category: '', search: '' } });
    expect(resourceStore.resources).toEqual(mockResponse.data);
    expect(resourceStore.pagination).toEqual(mockResponse.pagination);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('fetchResources应使用自定义过滤条件', async () => {
    const resourceStore = useResourceStore();
    const mockResponse = {
      success: true,
      data: [
        { _id: '1', title: '办公资源1' }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 1
      }
    };
    
    axios.get.mockResolvedValueOnce(mockResponse);
    
    const filters = {
      category: '办公资源',
      search: '资源1'
    };
    
    await resourceStore.fetchResources(1, filters);
    
    // 验证API调用使用了正确的过滤参数
    expect(axios.get).toHaveBeenCalledWith('/resources', { 
      params: { 
        page: 1, 
        category: '办公资源', 
        search: '资源1' 
      } 
    });
    
    // 验证过滤条件已更新到store
    expect(resourceStore.filters).toEqual(filters);
    expect(resourceStore.resources).toEqual(mockResponse.data);
  });

  it('fetchResources应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    const errorMessage = '获取资源列表失败';
    
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    
    await resourceStore.fetchResources();
    
    expect(resourceStore.resources).toEqual([]);
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
  });

  it('fetchResourceById应正确获取资源详情', async () => {
    const resourceStore = useResourceStore();
    const mockResource = { 
      _id: '1', 
      title: '资源1',
      description: '描述',
      favorites: ['user1']
    };
    
    axios.get.mockResolvedValueOnce({
      success: true,
      data: mockResource
    });
    
    await resourceStore.fetchResourceById('1');
    
    expect(axios.get).toHaveBeenCalledWith('/resources/1');
    expect(resourceStore.resource).toEqual(mockResource);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('fetchResourceById应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    const errorMessage = '获取资源详情失败';
    
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    
    await resourceStore.fetchResourceById('1');
    
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
  });

  it('createResource应正确创建资源', async () => {
    const resourceStore = useResourceStore();
    const newResource = { 
      title: '新资源',
      description: '描述',
      category: '办公资源',
      imageUrl: 'image.jpg'
    };
    const mockResponse = {
      success: true,
      data: { _id: '3', ...newResource }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const result = await resourceStore.createResource(newResource);
    
    expect(axios.post).toHaveBeenCalledWith('/resources', newResource);
    expect(result).toEqual(mockResponse.data);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('createResource应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    const newResource = { title: '新资源', description: '描述' };
    const errorMessage = '创建资源失败';
    
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    
    const result = await resourceStore.createResource(newResource);
    
    expect(result).toBeNull();
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
  });

  it('updateResource应正确更新资源', async () => {
    const resourceStore = useResourceStore();
    const resourceId = '1';
    const updateData = { 
      title: '更新的资源',
      description: '更新的描述'
    };
    const mockResponse = {
      success: true,
      data: { _id: resourceId, ...updateData }
    };
    
    // 设置当前资源以测试本地更新
    resourceStore.resource = { _id: resourceId, title: '原始资源', description: '原始描述' };
    
    axios.put.mockResolvedValueOnce(mockResponse);
    
    const result = await resourceStore.updateResource(resourceId, updateData);
    
    expect(axios.put).toHaveBeenCalledWith(`/resources/${resourceId}`, updateData);
    expect(result).toEqual(mockResponse.data);
    // 验证当前资源被更新
    expect(resourceStore.resource).toEqual(mockResponse.data);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('updateResource应处理当前资源不匹配的情况', async () => {
    const resourceStore = useResourceStore();
    const resourceId = '1';
    const updateData = { title: '更新的资源' };
    const mockResponse = {
      success: true,
      data: { _id: resourceId, ...updateData }
    };
    
    // 设置不同ID的当前资源
    resourceStore.resource = { _id: '2', title: '其他资源' };
    
    axios.put.mockResolvedValueOnce(mockResponse);
    
    const result = await resourceStore.updateResource(resourceId, updateData);
    
    expect(result).toEqual(mockResponse.data);
    // 当前资源不应被更新，因为ID不匹配
    expect(resourceStore.resource._id).toBe('2');
  });

  it('updateResource应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    const resourceId = '1';
    const updateData = { title: '更新的资源' };
    const errorMessage = '更新资源失败';
    
    axios.put.mockRejectedValueOnce(new Error(errorMessage));
    
    const result = await resourceStore.updateResource(resourceId, updateData);
    
    expect(result).toBeNull();
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
  });

  it('deleteResource应正确删除资源', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resources = [
      { _id: '1', title: '资源1' },
      { _id: '2', title: '资源2' }
    ];
    
    axios.delete.mockResolvedValueOnce({
      success: true
    });
    
    const result = await resourceStore.deleteResource('1');
    
    expect(axios.delete).toHaveBeenCalledWith('/resources/1');
    expect(result).toBe(true);
    expect(resourceStore.resources).toEqual([{ _id: '2', title: '资源2' }]);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('deleteResource应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resources = [
      { _id: '1', title: '资源1' },
      { _id: '2', title: '资源2' }
    ];
    const errorMessage = '删除资源失败';
    
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));
    
    const result = await resourceStore.deleteResource('1');
    
    expect(result).toBe(false);
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
    // 资源列表应保持不变
    expect(resourceStore.resources).toHaveLength(2);
  });

  it('toggleFavorite应正确切换收藏状态', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      favorites: ['user1'],
      favoriteCount: 1
    };
    
    const mockResponse = {
      success: true,
      data: {
        favorites: ['user1', 'user2'],
        favoriteCount: 2
      }
    };
    
    axios.put.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.toggleFavorite('1');
    
    expect(axios.put).toHaveBeenCalledWith('/resources/1/favorite');
    expect(resourceStore.resource.favorites).toEqual(mockResponse.data.favorites);
    expect(resourceStore.resource.favoriteCount).toEqual(mockResponse.data.favoriteCount);
    expect(resourceStore.error).toBeNull();
  });

  it('toggleFavorite应处理当前资源不匹配的情况', async () => {
    const resourceStore = useResourceStore();
    // 设置不同ID的当前资源
    resourceStore.resource = { 
      _id: '2', 
      title: '其他资源',
      favorites: ['user1'],
      favoriteCount: 1
    };
    
    const mockResponse = {
      success: true,
      data: {
        favorites: ['user1', 'user2'],
        favoriteCount: 2
      }
    };
    
    axios.put.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.toggleFavorite('1');
    
    // 当前资源不应被更新，因为ID不匹配
    expect(resourceStore.resource.favorites).toEqual(['user1']);
    expect(resourceStore.resource.favoriteCount).toBe(1);
  });

  it('toggleFavorite应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      favorites: ['user1'],
      favoriteCount: 1
    };
    const errorMessage = '操作收藏失败';
    
    axios.put.mockRejectedValueOnce(new Error(errorMessage));
    
    const result = await resourceStore.toggleFavorite('1');
    
    expect(result).toBeNull();
    expect(resourceStore.error).toBe(errorMessage);
    // 收藏数据应保持不变
    expect(resourceStore.resource.favorites).toEqual(['user1']);
    expect(resourceStore.resource.favoriteCount).toBe(1);
  });

  it('rateResource应正确进行评分', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      averageRating: 3.5,
      ratingCount: 2
    };
    
    const mockResponse = {
      success: true,
      data: {
        averageRating: 4.0,
        ratingCount: 3
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.rateResource('1', 5);
    
    expect(axios.post).toHaveBeenCalledWith('/resources/1/rating', { rating: 5 });
    expect(resourceStore.resource.averageRating).toEqual(4.0);
    expect(resourceStore.resource.ratingCount).toEqual(3);
    expect(resourceStore.error).toBeNull();
  });

  it('rateResource应处理当前资源不匹配的情况', async () => {
    const resourceStore = useResourceStore();
    // 设置不同ID的当前资源
    resourceStore.resource = { 
      _id: '2', 
      title: '其他资源',
      averageRating: 3.5,
      ratingCount: 2
    };
    
    const mockResponse = {
      success: true,
      data: {
        averageRating: 4.0,
        ratingCount: 3
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.rateResource('1', 5);
    
    // 当前资源不应被更新，因为ID不匹配
    expect(resourceStore.resource.averageRating).toBe(3.5);
    expect(resourceStore.resource.ratingCount).toBe(2);
  });

  it('rateResource应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      averageRating: 3.5,
      ratingCount: 2
    };
    const errorMessage = '评分失败';
    
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    
    const result = await resourceStore.rateResource('1', 5);
    
    expect(result).toBeNull();
    expect(resourceStore.error).toBe(errorMessage);
    // 评分数据应保持不变
    expect(resourceStore.resource.averageRating).toBe(3.5);
    expect(resourceStore.resource.ratingCount).toBe(2);
  });

  it('fetchFavorites应正确获取收藏列表', async () => {
    const resourceStore = useResourceStore();
    const mockResponse = {
      success: true,
      data: [
        { _id: '1', title: '收藏资源1' },
        { _id: '2', title: '收藏资源2' }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 2
      }
    };
    
    axios.get.mockResolvedValueOnce(mockResponse);
    
    await resourceStore.fetchFavorites();
    
    expect(axios.get).toHaveBeenCalledWith('/resources/user/favorites', { params: { page: 1 } });
    expect(resourceStore.favorites).toEqual(mockResponse.data);
    expect(resourceStore.pagination).toEqual(mockResponse.pagination);
    expect(resourceStore.loading).toBe(false);
    expect(resourceStore.error).toBeNull();
  });

  it('fetchFavorites应处理错误情况', async () => {
    const resourceStore = useResourceStore();
    const errorMessage = '获取收藏列表失败';
    
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    
    await resourceStore.fetchFavorites();
    
    expect(resourceStore.error).toBe(errorMessage);
    expect(resourceStore.loading).toBe(false);
  });
}); 