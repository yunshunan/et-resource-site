// API Connector
// A flexible connector that can switch between different data sources
import axios from 'axios';
import AV from '../config/leancloud';
import { auth } from '../config/firebase';
import mockData from './mockData';

// Constants
const API_MODE = {
  MOCK: 'mock',       // Use local mock data for development
  LEANCLOUD: 'leancloud', // Use LeanCloud for quick backend setup
  FIREBASE: 'firebase',  // Use Firebase for authentication and Firestore
  CUSTOM_API: 'custom_api' // Use custom backend API
};

// Get the configured API mode from environment variables, default to MOCK
const DEFAULT_API_MODE = API_MODE.MOCK;
const apiMode = import.meta.env.VITE_API_MODE || DEFAULT_API_MODE;

console.log(`API Mode: ${apiMode}`);

// Create custom axios instance for custom API
const customApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token if available
customApi.interceptors.request.use(
  config => {
    // If using Firebase auth, get the token and add it to headers
    const user = auth.currentUser;
    if (user) {
      return user.getIdToken().then(token => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * API Connector - provides a unified interface to different data sources
 */
class ApiConnector {
  constructor(mode = DEFAULT_API_MODE) {
    this.mode = mode;
    this.mockDelay = 300; // Simulate network delay for mock data
  }

  /**
   * Set the API mode
   * @param {string} mode - API_MODE value
   */
  setMode(mode) {
    if (Object.values(API_MODE).includes(mode)) {
      this.mode = mode;
      console.log(`API Mode changed to: ${mode}`);
    } else {
      console.error(`Invalid API mode: ${mode}`);
    }
  }

  /**
   * Get the current API mode
   * @returns {string} Current API mode
   */
  getMode() {
    return this.mode;
  }

  /**
   * Execute a request based on the current API mode
   * @param {Object} options - Request options
   * @param {string} options.resource - Resource name (e.g., 'users', 'posts')
   * @param {string} options.action - Action to perform (e.g., 'list', 'get', 'create')
   * @param {Object} options.params - Request parameters
   * @param {Object} options.data - Request data (for POST/PUT)
   * @param {string} options.id - Resource ID (for single resource operations)
   * @returns {Promise<any>} Response data
   */
  async request(options) {
    const { resource, action, params, data, id } = options;

    try {
      switch (this.mode) {
        case API_MODE.MOCK:
          return await this._mockRequest(resource, action, params, data, id);
        
        case API_MODE.LEANCLOUD:
          return await this._leanCloudRequest(resource, action, params, data, id);
        
        case API_MODE.FIREBASE:
          return await this._firebaseRequest(resource, action, params, data, id);
          
        case API_MODE.CUSTOM_API:
          return await this._customApiRequest(resource, action, params, data, id);
          
        default:
          throw new Error(`Unsupported API mode: ${this.mode}`);
      }
    } catch (error) {
      console.error(`API request failed for ${resource}/${action}:`, error);
      throw error;
    }
  }

  /**
   * Handle mock data requests
   * @private
   */
  async _mockRequest(resource, action, params, data, id) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));

    if (!mockData[resource]) {
      throw new Error(`Mock resource not found: ${resource}`);
    }

    const resourceHandler = mockData[resource];
    
    if (typeof resourceHandler[action] !== 'function') {
      throw new Error(`Mock action not implemented: ${resource}/${action}`);
    }

    return resourceHandler[action]({ params, data, id });
  }

  /**
   * Handle LeanCloud requests
   * @private
   */
  async _leanCloudRequest(resource, action, params, data, id) {
    // Map common actions to LeanCloud SDK methods
    switch (action) {
      case 'list':
        const query = new AV.Query(resource);
        if (params) {
          // Apply filters from params
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              query.equalTo(key, value);
            }
          });
        }
        return await query.find();
        
      case 'get':
        if (!id) throw new Error('ID is required for get action');
        return await new AV.Query(resource).get(id);
        
      case 'create':
        const newObject = new AV.Object(resource);
        Object.entries(data).forEach(([key, value]) => {
          newObject.set(key, value);
        });
        return await newObject.save();
        
      case 'update':
        if (!id) throw new Error('ID is required for update action');
        const object = AV.Object.createWithoutData(resource, id);
        Object.entries(data).forEach(([key, value]) => {
          object.set(key, value);
        });
        return await object.save();
        
      case 'delete':
        if (!id) throw new Error('ID is required for delete action');
        const objectToDelete = AV.Object.createWithoutData(resource, id);
        return await objectToDelete.destroy();
        
      default:
        throw new Error(`Unsupported action for LeanCloud: ${action}`);
    }
  }

  /**
   * Handle Firebase requests
   * @private
   */
  async _firebaseRequest(resource, action, params, data, id) {
    // Firebase implementation would go here
    // This is a placeholder - you would need to implement Firestore operations
    throw new Error('Firebase implementation not yet available');
  }

  /**
   * Handle custom API requests
   * @private
   */
  async _customApiRequest(resource, action, params, data, id) {
    // Map common actions to RESTful HTTP methods
    switch (action) {
      case 'list':
        const response = await customApi.get(`/${resource}`, { params });
        return response.data;
        
      case 'get':
        if (!id) throw new Error('ID is required for get action');
        const getResponse = await customApi.get(`/${resource}/${id}`, { params });
        return getResponse.data;
        
      case 'create':
        const createResponse = await customApi.post(`/${resource}`, data);
        return createResponse.data;
        
      case 'update':
        if (!id) throw new Error('ID is required for update action');
        const updateResponse = await customApi.put(`/${resource}/${id}`, data);
        return updateResponse.data;
        
      case 'delete':
        if (!id) throw new Error('ID is required for delete action');
        const deleteResponse = await customApi.delete(`/${resource}/${id}`);
        return deleteResponse.data;
        
      default:
        throw new Error(`Unsupported action for custom API: ${action}`);
    }
  }
}

// Export a singleton instance
export default new ApiConnector(apiMode);

// Also export API_MODE for reference
export { API_MODE }; 