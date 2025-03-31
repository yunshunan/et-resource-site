/**
 * @jest-environment jsdom
 */

import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '../src/stores/resources'
import axios from '@/services/api'

// 模拟axios
jest.mock('@/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}))

describe('Resource Store', () => {
  beforeEach(() => {
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 重置所有模拟
    jest.clearAllMocks()
  })

  it('初始状态应该正确', () => {
    const resourceStore = useResourceStore()
    expect(resourceStore.resources).toEqual([])
    expect(resourceStore.resource).toBeNull()
    expect(resourceStore.loading).toBe(false)
    expect(resourceStore.error).toBeNull()
    expect(resourceStore.pagination).toEqual({
      currentPage: 1,
      totalPages: 1,
      total: 0
    })
    expect(resourceStore.favorites).toEqual([])
    expect(resourceStore.filters).toEqual({
      category: '',
      search: ''
    })
  })

  it('fetchResources应正确获取资源列表', async () => {
    const resourceStore = useResourceStore()
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
    }
    
    axios.get.mockResolvedValueOnce(mockResponse)
    
    await resourceStore.fetchResources()
    
    expect(axios.get).toHaveBeenCalledWith('/resources', { params: { page: 1, category: '', search: '' } })
    expect(resourceStore.resources).toEqual(mockResponse.data)
    expect(resourceStore.pagination).toEqual(mockResponse.pagination)
    expect(resourceStore.loading).toBe(false)
    expect(resourceStore.error).toBeNull()
  })

  it('fetchResources应处理错误情况', async () => {
    const resourceStore = useResourceStore()
    const errorMessage = '获取资源列表失败'
    
    axios.get.mockRejectedValueOnce(new Error(errorMessage))
    
    await resourceStore.fetchResources()
    
    expect(resourceStore.resources).toEqual([])
    expect(resourceStore.error).toBe(errorMessage)
    expect(resourceStore.loading).toBe(false)
  })

  it('fetchResourceById应正确获取资源详情', async () => {
    const resourceStore = useResourceStore()
    const mockResource = { 
      _id: '1', 
      title: '资源1',
      description: '描述',
      favorites: ['user1']
    }
    
    axios.get.mockResolvedValueOnce({
      success: true,
      data: mockResource
    })
    
    await resourceStore.fetchResourceById('1')
    
    expect(axios.get).toHaveBeenCalledWith('/resources/1')
    expect(resourceStore.resource).toEqual(mockResource)
    expect(resourceStore.loading).toBe(false)
    expect(resourceStore.error).toBeNull()
  })

  it('createResource应正确创建资源', async () => {
    const resourceStore = useResourceStore()
    const newResource = { 
      title: '新资源',
      description: '描述',
      category: '办公资源',
      imageUrl: 'image.jpg'
    }
    const mockResponse = {
      success: true,
      data: { _id: '3', ...newResource }
    }
    
    axios.post.mockResolvedValueOnce(mockResponse)
    
    const result = await resourceStore.createResource(newResource)
    
    expect(axios.post).toHaveBeenCalledWith('/resources', newResource)
    expect(result).toEqual(mockResponse.data)
    expect(resourceStore.loading).toBe(false)
    expect(resourceStore.error).toBeNull()
  })

  it('deleteResource应正确删除资源', async () => {
    const resourceStore = useResourceStore()
    resourceStore.resources = [
      { _id: '1', title: '资源1' },
      { _id: '2', title: '资源2' }
    ]
    
    axios.delete.mockResolvedValueOnce({
      success: true
    })
    
    const result = await resourceStore.deleteResource('1')
    
    expect(axios.delete).toHaveBeenCalledWith('/resources/1')
    expect(result).toBe(true)
    expect(resourceStore.resources).toEqual([{ _id: '2', title: '资源2' }])
    expect(resourceStore.loading).toBe(false)
    expect(resourceStore.error).toBeNull()
  })

  it('toggleFavorite应正确切换收藏状态', async () => {
    const resourceStore = useResourceStore()
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      favorites: ['user1'],
      favoriteCount: 1
    }
    
    const mockResponse = {
      success: true,
      data: {
        favorites: ['user1', 'user2'],
        favoriteCount: 2
      }
    }
    
    axios.put.mockResolvedValueOnce(mockResponse)
    
    await resourceStore.toggleFavorite('1')
    
    expect(axios.put).toHaveBeenCalledWith('/resources/1/favorite')
    expect(resourceStore.resource.favorites).toEqual(mockResponse.data.favorites)
    expect(resourceStore.resource.favoriteCount).toEqual(mockResponse.data.favoriteCount)
    expect(resourceStore.error).toBeNull()
  })

  it('rateResource应正确进行评分', async () => {
    const resourceStore = useResourceStore()
    resourceStore.resource = { 
      _id: '1', 
      title: '资源1',
      averageRating: 3.5,
      ratingCount: 2
    }
    
    const mockResponse = {
      success: true,
      data: {
        averageRating: 4.0,
        ratingCount: 3
      }
    }
    
    axios.post.mockResolvedValueOnce(mockResponse)
    
    await resourceStore.rateResource('1', 5)
    
    expect(axios.post).toHaveBeenCalledWith('/resources/1/rating', { rating: 5 })
    expect(resourceStore.resource.averageRating).toEqual(4.0)
    expect(resourceStore.resource.ratingCount).toEqual(3)
    expect(resourceStore.error).toBeNull()
  })
}) 