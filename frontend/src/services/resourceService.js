// Resource Service
// Provides methods for interacting with resource data
import apiConnector from '../api/connector'; // <--- 保持导入 apiConnector
import axios from './api'; // <--- 同时导入 axios 供 getResourceById 使用

/**
 * Resource service for managing resource-related operations
 */
class ResourceService {
  /**
   * Get a list of all resource categories
   * @returns {Promise<Array>} List of resource categories
   */
  async getCategories() {
    try {
      // 保持使用 apiConnector
      return await apiConnector.request({
        resource: 'categories',
        action: 'list'
      });
    } catch (error) {
      console.error('Failed to fetch resource categories:', error);
      throw error;
    }
  }

  /**
   * Get a list of all resources
   * @param {Object} params - Filter parameters
   * @returns {Promise<Array>} List of resources
   */
  async getResources(params = {}) {
    try {
      // 保持使用 apiConnector
      return await apiConnector.request({
        resource: 'resources',
        action: 'list',
        params
      });
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      throw error;
    }
  }

  /**
   * Get resources by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} List of resources in the specified category
   */
  async getResourcesByCategory(category) {
    if (!category) {
      return this.getResources();
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'list',
        params: { category }
      });
    } catch (error) {
      console.error(`Failed to fetch resources in category "${category}":`, error);
      throw error;
    }
  }

  /**
   * Search for resources
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of resources matching the search query
   */
  async searchResources(query) {
    if (!query || !query.trim()) {
      return this.getResources();
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'list',
        params: { search: query.trim() }
      });
    } catch (error) {
      console.error(`Failed to search resources with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get a specific resource by ID
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} Resource
   */
  async getResourceById(id) {
    if (!id) {
      throw new Error('Resource ID is required');
    }
    try {
      console.log(`[resourceService] Fetching resource with ID ${id}`);
      // *** 修改这里：使用正确的 API 路径，添加 /api 前缀 ***
      const responseData = await axios.get(`/api/resources/${id}`); 
      console.log(`[resourceService] Response received for ID ${id}:`, responseData);
      
      // 检查后端返回的数据结构
      if (responseData && responseData.success === true && responseData.data) {
        return responseData.data; // 返回资源数据
      } else if (responseData) {
        // 这里处理成功响应但没有预期结构的情况 - 可能直接返回数据本身
        console.log('[resourceService] Direct data response, returning responseData directly');
        return responseData; 
      } else if (responseData && responseData.success === false) {
         throw new Error(responseData.message || `获取资源 ${id} 失败`);
      } else {
        // 如果响应结构不符合预期，也视为错误
        console.warn('Unexpected response structure for getResourceById:', responseData);
        // 可以返回 null 或抛出更具体的错误
        // return null; 
        throw new Error('获取资源时收到无效的响应格式');
      }
    } catch (error) {
      console.error(`Failed to fetch resource with ID ${id}:`, error);
      // 重新抛出错误，让调用者处理
      throw error; 
    }
  }

  /**
   * Get resources by author
   * @param {string} authorId - Author ID
   * @returns {Promise<Array>} List of resources by the specified author
   */
  async getResourcesByAuthor(authorId) {
    if (!authorId) {
      throw new Error('Author ID is required');
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'list',
        params: { author: authorId }
      });
    } catch (error) {
      console.error(`Failed to fetch resources by author ${authorId}:`, error);
      throw error;
    }
  }

  /**
   * Get resources by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} List of resources with the specified tag
   */
  async getResourcesByTag(tag) {
    if (!tag) {
      throw new Error('Tag is required');
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'list',
        params: { tags: [tag] }
      });
    } catch (error) {
      console.error(`Failed to fetch resources with tag ${tag}:`, error);
      throw error;
    }
  }

  /**
   * Create a new resource
   * @param {Object} resourceData - Resource data
   * @returns {Promise<Object>} Created resource
   */
  async createResource(resourceData) {
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'create',
        data: resourceData
      });
    } catch (error) {
      console.error('Failed to create resource:', error);
      throw error;
    }
  }

  /**
   * Update an existing resource
   * @param {string} id - Resource ID
   * @param {Object} resourceData - Updated resource data
   * @returns {Promise<Object>} Updated resource
   */
  async updateResource(id, resourceData) {
    if (!id) {
      throw new Error('Resource ID is required');
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'update',
        id,
        data: resourceData
      });
    } catch (error) {
      console.error(`Failed to update resource with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a resource
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} Result of the delete operation
   */
  async deleteResource(id) {
    if (!id) {
      throw new Error('Resource ID is required');
    }
    try {
      return await apiConnector.request({
        resource: 'resources',
        action: 'delete',
        id
      });
    } catch (error) {
      console.error(`Failed to delete resource with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the most popular resources
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} List of most popular resources
   */
  async getPopularResources(limit = 5) {
    try {
      const resources = await this.getResources();
      const sortedResources = [...resources].sort((a, b) => b.views - a.views);
      return sortedResources.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch popular resources:', error);
      throw error;
    }
  }

  /**
   * Get the most recently added resources
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} List of most recent resources
   */
  async getRecentResources(limit = 5) {
    try {
      const resources = await this.getResources();
      const sortedResources = [...resources].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      return sortedResources.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch recent resources:', error);
      throw error;
    }
  }

  /**
   * Get free resources
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} List of free resources
   */
  async getFreeResources(limit = 10) {
    try {
      const resources = await this.getResources();
      const freeResources = resources
        .filter(resource => resource.price === 0)
        .sort((a, b) => b.rating - a.rating);
      return freeResources.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch free resources:', error);
      throw error;
    }
  }
}

export default new ResourceService(); 