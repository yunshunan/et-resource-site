import { defineStore } from 'pinia'
import axios from '@/services/api'

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
      if (!state.resource) return false;
      return state.resource.favorites && 
             state.resource.favorites.includes(state.user?.id);
    }
  },
  
  actions: {
    // 获取资源列表
    async fetchResources(page = 1, filters = {}) {
      this.loading = true;
      this.error = null;
      
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
        
        const response = await axios.get('/resources', { params: queryParams });
        
        if (response.success) {
          this.resources = response.data;
          this.pagination = response.pagination;
        } else {
          throw new Error(response.message || '获取资源列表失败');
        }
      } catch (error) {
        console.error('获取资源列表失败:', error);
        this.error = error.message || '获取资源列表失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    },
    
    // 获取资源详情
    async fetchResourceById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`/resources/${id}`);
        
        if (response.success) {
          this.resource = response.data;
        } else {
          throw new Error(response.message || '获取资源详情失败');
        }
      } catch (error) {
        console.error('获取资源详情失败:', error);
        this.error = error.message || '获取资源详情失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    },
    
    // 创建资源
    async createResource(resourceData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/resources', resourceData);
        
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || '创建资源失败');
        }
      } catch (error) {
        console.error('创建资源失败:', error);
        this.error = error.message || '创建资源失败，请稍后再试';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新资源
    async updateResource(id, resourceData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`/resources/${id}`, resourceData);
        
        if (response.success) {
          // 如果当前正在查看的是这个资源，更新本地数据
          if (this.resource && this.resource._id === id) {
            this.resource = response.data;
          }
          return response.data;
        } else {
          throw new Error(response.message || '更新资源失败');
        }
      } catch (error) {
        console.error('更新资源失败:', error);
        this.error = error.message || '更新资源失败，请稍后再试';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除资源
    async deleteResource(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.delete(`/resources/${id}`);
        
        if (response.success) {
          // 从本地列表中移除
          this.resources = this.resources.filter(r => r._id !== id);
          return true;
        } else {
          throw new Error(response.message || '删除资源失败');
        }
      } catch (error) {
        console.error('删除资源失败:', error);
        this.error = error.message || '删除资源失败，请稍后再试';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 收藏/取消收藏
    async toggleFavorite(id) {
      this.error = null;
      
      try {
        const response = await axios.put(`/resources/${id}/favorite`);
        
        if (response.success) {
          // 如果当前正在查看的是这个资源，更新收藏状态
          if (this.resource && this.resource._id === id) {
            this.resource.favorites = response.data.favorites;
            this.resource.favoriteCount = response.data.favoriteCount;
          }
          return response.data;
        } else {
          throw new Error(response.message || '操作收藏失败');
        }
      } catch (error) {
        console.error('操作收藏失败:', error);
        this.error = error.message || '操作收藏失败，请稍后再试';
        return null;
      }
    },
    
    // 评分
    async rateResource(id, rating) {
      this.error = null;
      
      try {
        const response = await axios.post(`/resources/${id}/rating`, { rating });
        
        if (response.success) {
          // 如果当前正在查看的是这个资源，更新评分
          if (this.resource && this.resource._id === id) {
            this.resource.averageRating = response.data.averageRating;
            this.resource.ratingCount = response.data.ratingCount;
          }
          return response.data;
        } else {
          throw new Error(response.message || '评分失败');
        }
      } catch (error) {
        console.error('评分失败:', error);
        this.error = error.message || '评分失败，请稍后再试';
        return null;
      }
    },
    
    // 获取用户收藏的资源
    async fetchFavorites(page = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/resources/user/favorites', { 
          params: { page } 
        });
        
        if (response.success) {
          this.favorites = response.data;
          this.pagination = response.pagination;
        } else {
          throw new Error(response.message || '获取收藏列表失败');
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error);
        this.error = error.message || '获取收藏列表失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    }
  }
}) 