import { defineStore } from 'pinia'
import axios from '@/services/api'
import AV from '@/config/leancloud'; // 修正导入路径：从 config 目录导入
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
    // 获取资源列表 (Public)
    async fetchResources(page = 1, filters = {}) {
      try {
        const queryParams = {
          page,
          ...this.filters,
          ...filters
        };
        if (filters.category !== undefined) this.filters.category = filters.category;
        if (filters.search !== undefined) this.filters.search = filters.search;

        const response = await wrapApiCall(
          () => axios.get('/api/resources', { params: queryParams }),
          this,
          '获取资源列表失败'
        );
        
        // Check if response has data and pagination
        if (response && response.data) {
          this.resources = response.data;
          if (response.pagination) {
             this.pagination = response.pagination;
          } else {
            // Handle case where pagination might be missing
            this.pagination = { currentPage: 1, totalPages: 1, totalCount: response.data.length }; 
          }
        } else {
          this.resources = [];
          this.pagination = { currentPage: 1, totalPages: 1, totalCount: 0 };
        }
        
        // Return the actual data part for potential component use
        return response?.data;
      } catch (error) {
        return null;
      }
    },

    // 获取当前用户上传的资源列表 (Private)
    async fetchUserResources(page = 1) {
      this.loading = true;
      this.error = null;
      try {
        // 使用正确的路径前缀
        const response = await axios.get('/api/resources/user', { 
          params: { page } 
        });

        // Assuming response structure is { success: true, data: [], pagination: {...} }
        if (response && response.success && response.data) {
          this.resources = response.data;
          if (response.pagination) {
            this.pagination = response.pagination;
          } else {
             // Fallback if pagination is missing
            this.pagination = { currentPage: page, totalPages: 1, totalCount: response.data.length };
          }
        } else {
           this.resources = [];
           this.pagination = { currentPage: 1, totalPages: 1, totalCount: 0 };
           // Consider setting an error if response.success is false
           if (response && !response.success) {
             this.error = response.message || '获取用户资源失败';
           }
        }
        
        // Return data for component use
        return response?.data;

      } catch (error) {
        console.error("Error fetching user resources:", error);
        this.error = extractErrorMessage(error, '获取用户资源时出错');
        this.resources = [];
        this.pagination = { currentPage: 1, totalPages: 1, totalCount: 0 };
        return null; // Return null on error
      } finally {
        this.loading = false;
      }
    },

    // 获取资源详情
    async fetchResourceById(id) {
     // Keep existing implementation, ensure wrapApiCall is used if needed
     // or refactor similarly to fetchUserResources if direct axios call is preferred
      try {
        const response = await wrapApiCall(
          () => axios.get(`/api/resources/${id}`),
          this,
          '获取资源详情失败'
        );
        // Assuming response has the resource data directly or in a data field
        this.resource = response?.data || response || null;
        return this.resource;
      } catch (error) {
        return null;
      }
    },
    
    // 创建资源 (修改后的逻辑)
    async createResource(formDataObj) { // 接收 FormData 对象
      this.loading = true; 
      this.error = null;
      let imageUrl = '';
      let downloadLink = '';
      
      try {
        // 1. 提取文件对象
        const imageFile = formDataObj.get('image');
        const resourceFile = formDataObj.get('resource');
        
        // 2. 上传封面图片 (如果存在)
        if (imageFile instanceof File) {
          console.log('Uploading image...');
          const avImageFile = new AV.File(imageFile.name, imageFile);
          const savedImage = await avImageFile.save();
          imageUrl = savedImage.url(); // 获取图片 URL
          console.log('Image uploaded:', imageUrl);
        } else {
           // 封面图片是必填项
           throw new Error('未提供封面图片文件对象');
        }
        
        // 3. 上传资源文件 (如果存在)
        if (resourceFile instanceof File) {
          console.log('Uploading resource file...');
          const avResourceFile = new AV.File(resourceFile.name, resourceFile);
          // 可以添加上传进度处理 (可选)
          // avResourceFile.save({ onprogress: (progress) => console.log(progress.percent) })
          const savedResource = await avResourceFile.save();
          downloadLink = savedResource.url(); // 获取文件 URL
          console.log('Resource file uploaded:', downloadLink);
        } else {
           // 资源文件是必填项
           throw new Error('未提供资源文件文件对象');
        }
        
        // 4. 准备发送到后端 API 的数据 (普通对象)
        const finalResourceData = {
          title: formDataObj.get('title'),
          description: formDataObj.get('description'),
          category: formDataObj.get('category'),
          tags: JSON.parse(formDataObj.get('tags') || '[]'), // 解析 tags JSON 字符串
          imageUrl: imageUrl,
          downloadLink: downloadLink,
          fileSize: formDataObj.get('fileSize'), // 从 FormData 获取
          fileType: formDataObj.get('fileType') // 从 FormData 获取
        };
        
        console.log('Submitting final data to backend:', finalResourceData);
        
        // 5. 调用后端 API 创建资源 (使用普通对象)
        // 不再直接使用 wrapApiCall，因为文件上传已分开处理，错误处理也需要调整
        const response = await axios.post('/api/resources', finalResourceData); 
        
        // 检查后端响应是否表示成功
        if (response && (response.success === true || response._id)) { // 假设成功响应包含 success: true 或 _id
           console.log('Backend resource creation successful:', response);
           return response.data || response; // 返回后端创建的资源数据
        } else {
          // 如果后端返回了非成功状态或错误信息
          console.error('Backend resource creation failed:', response);
          this.error = response?.message || '后端创建资源失败';
          return null;
        }

      } catch (error) {
        console.error('创建资源过程中出错 (文件上传或API调用):', error);
        // 使用 extractErrorMessage 处理 LeanCloud 上传错误或其他错误
        this.error = extractErrorMessage(error, '创建资源失败');
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新资源 (也需要类似修改，先省略)
    async updateResource(id, resourceData) {
       // TODO: Implement file upload logic similar to createResource if files can be updated.
       // For now, keep the existing logic which might only update text fields.
       console.warn('updateResource needs refactoring for file updates');
       try {
         const result = await wrapApiCall(
           () => axios.put(`/resources/${id}`, resourceData), // Assuming resourceData is appropriate for update without files
           this,
           '更新资源失败'
         );
         if (result && this.resource && this.resource._id === id) {
           this.resource = { ...this.resource, ...result }; // Merge updates
         }
         return result;
       } catch (error) { 
         return null;
       }
    },
    
    // 删除资源 (修改：不再使用 wrapApiCall)
    async deleteResource(id) {
      this.loading = true; // 手动设置 loading
      this.error = null;   // 手动清除错误
      try {
        // 直接调用 axios.delete
        const response = await axios.delete(`/api/resources/${id}`);
        
        // 检查状态码是否表示成功 (通常是 200 或 204)
        if (response.status === 200 || response.status === 204) {
          // 从本地列表中移除
          this.resources = this.resources.filter(r => r._id !== id);
          console.log(`Resource ${id} deleted successfully.`);
          return true;
        } else {
          // 如果状态码不是 200/204，视为后端错误
          console.error(`Failed to delete resource ${id}, status: ${response.status}`, response);
          // 尝试从响应中获取错误消息
          this.error = response.data?.message || response.data?.error || `删除资源失败 (状态码: ${response.status})`;
          return false;
        }
      } catch (error) {
        // 处理 axios 请求本身的错误 (网络错误等)
        console.error(`Error deleting resource ${id}:`, error);
        this.error = extractErrorMessage(error, '删除资源时出错');
        return false;
      } finally {
        this.loading = false; // 手动重置 loading
      }
    },
    
    // 收藏/取消收藏
    async toggleFavorite(id) {
      try {
        // 使用包装的API调用
        const result = await wrapApiCall(
          () => axios.put(`/api/resources/${id}/favorite`),
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
          () => axios.post(`/api/resources/${id}/rating`, { rating }),
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
          () => axios.get('/api/resources/user/favorites', { params: { page } }),
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