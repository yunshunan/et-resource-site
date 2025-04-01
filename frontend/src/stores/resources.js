import { defineStore } from 'pinia'
import axios from '@/services/api'
// eslint-disable-next-line no-unused-vars
import { wrapApiCall, extractErrorMessage } from '@/utils/errorHandler'

export const useResourceStore = defineStore('resources', {
  state: () => ({
    resources: [],
    resource: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0
    },
    favorites: [],
    filters: {
      category: '',
      search: ''
    }
  }),
  
  getters: {
    // 获取资源列表
    getResources: (state) => state.resources,
    
    // 获取分页信息
    getPagination: (state) => state.pagination,
    
    // 获取当前资源
    getCurrentResource: (state) => state.resource,
    
    // 获取收藏列表
    getFavorites: (state) => state.favorites,
    
    // 检查指定资源是否已收藏
    isFavorited: (state) => (resourceId) => {
      // 确保资源存在
      if (!state.resource) return false;
      
      // 确保资源有favorites属性
      return Boolean(state.resource.favorites && 
               state.resource.favorites.includes(resourceId));
    }
  },
  
  actions: {
    // 获取资源列表
    async fetchResources(page = 1, filters = {}) {
      try {
        // 合并过滤条件
        const queryParams = {
          page,
          ...this.filters,
          ...filters
        };
        
        // 更新过滤条件
        if (filters.category !== undefined) this.filters.category = filters.category;
        if (filters.search !== undefined) this.filters.search = filters.search;
        
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.get('/resources', { params: queryParams }),
          this,
          '获取资源列表失败'
        );
        
        // 更新状态
        this.resources = result || [];
        
        // 更新分页信息
        if (result && result.pagination) {
          this.pagination = result.pagination;
        }
        
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 获取资源详情
    async fetchResourceById(id) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.get(`/resources/${id}`),
          this,
          '获取资源详情失败'
        );
        
        // 更新状态
        this.resource = result || null;
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 创建资源
    async createResource(resourceData) {
      try {
        // 使用包装的API调用
        return await wrapApiCall(
          () => axios.post('/resources', resourceData),
          this,
          '创建资源失败'
        );
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 更新资源
    async updateResource(id, resourceData) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.put(`/resources/${id}`, resourceData),
          this,
          '更新资源失败'
        );
        
        // 如果当前正在查看的是这个资源，更新本地数据
        if (result && this.resource && this.resource._id === id) {
          this.resource = result;
        }
        
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 删除资源
    async deleteResource(id) {
      try {
        // 使用包装的API调用
        await wrapApiCall(
          () => axios.delete(`/resources/${id}`),
          this,
          '删除资源失败'
        );
        
        // 从本地列表中移除
        this.resources = this.resources.filter(r => r._id !== id);
        return true;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回false
        return false;
      }
    },
    
    // 收藏/取消收藏
    async toggleFavorite(id) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.put(`/resources/${id}/favorite`),
          this,
          '操作收藏失败'
        );
        
        // 如果当前正在查看的是这个资源，更新收藏状态
        if (result && this.resource && this.resource._id === id) {
          this.resource.favorites = result.favorites || [];
          this.resource.favoriteCount = result.favoriteCount || 0;
        }
        
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 评分
    async rateResource(id, rating) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.post(`/resources/${id}/rating`, { rating }),
          this,
          '评分失败'
        );
        
        // 如果当前正在查看的是这个资源，更新评分
        if (result && this.resource && this.resource._id === id) {
          this.resource.averageRating = result.averageRating || 0;
          this.resource.ratingCount = result.ratingCount || 0;
        }
        
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    },
    
    // 获取用户收藏的资源
    async fetchFavorites(page = 1) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.get('/resources/user/favorites', { params: { page } }),
          this,
          '获取收藏列表失败'
        );
        
        // 更新状态
        this.favorites = result || [];
        
        // 更新分页信息
        if (result && result.pagination) {
          this.pagination = result.pagination;
        }
        
        return result;
      } catch (error) {
        // 错误已经由wrapApiCall处理，这里只需要返回null
        return null;
      }
    }
  }
}) 