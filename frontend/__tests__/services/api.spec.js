/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setActivePinia, createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { useAuthStore } from '../../src/stores/auth';
import api, { authApi } from '../../src/services/api';

// 模拟axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: {
            use: vi.fn()
          },
          response: {
            use: vi.fn()
          }
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
      }))
    }
  };
});

describe('API Service', () => {
  let authStore;
  let requestInterceptor;
  let responseInterceptor;
  let mockAxiosInstance;

  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    pinia.use(createPersistedState());
    setActivePinia(pinia);
    
    // 获取认证store
    authStore = useAuthStore();
    
    // 重置模拟
    vi.clearAllMocks();
    
    // 创建模拟的axios实例
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    // 模拟axios.create返回我们的模拟实例
    axios.create.mockReturnValue(mockAxiosInstance);
    
    // 重新导入api模块以使用我们的模拟
    vi.resetModules();
  });

  it('创建的axios实例应具有正确的配置', async () => {
    const { default: apiModule } = await import('../../src/services/api');
    
    // 验证axios.create被调用并具有正确的配置
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        timeout: expect.any(Number),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('请求拦截器应在请求中添加认证token', async () => {
    // 模拟拦截器调用
    let requestCallback;
    mockAxiosInstance.interceptors.request.use.mockImplementation((callback) => {
      requestCallback = callback;
      return 0; // 返回拦截器ID
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 设置认证状态
    authStore.token = 'test-token';
    
    // 创建一个请求配置对象
    const config = { headers: {} };
    
    // 调用请求拦截器
    const result = requestCallback(config);
    
    // 验证token被添加到请求头
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('请求拦截器在没有token时不应修改请求头', async () => {
    // 模拟拦截器调用
    let requestCallback;
    mockAxiosInstance.interceptors.request.use.mockImplementation((callback) => {
      requestCallback = callback;
      return 0;
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 确保认证状态为null
    authStore.token = null;
    
    // 创建一个请求配置对象
    const config = { headers: {} };
    
    // 调用请求拦截器
    const result = requestCallback(config);
    
    // 验证请求头中没有Authorization
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('响应拦截器应直接返回响应数据', async () => {
    // 模拟拦截器调用
    let responseCallback;
    mockAxiosInstance.interceptors.response.use.mockImplementation((callback) => {
      responseCallback = callback;
      return 0;
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 创建一个响应对象
    const response = { data: { success: true, message: 'ok' } };
    
    // 调用响应拦截器
    const result = responseCallback(response);
    
    // 验证返回的是响应中的data属性
    expect(result).toEqual(response.data);
  });

  it('响应拦截器应处理401错误并尝试刷新token', async () => {
    // 模拟拦截器调用
    let errorCallback;
    mockAxiosInstance.interceptors.response.use.mockImplementation((successCb, errorCb) => {
      errorCallback = errorCb;
      return 0;
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 模拟认证store的refreshAccessToken方法
    authStore.refreshAccessToken = vi.fn().mockResolvedValue(true);
    authStore.token = 'new-token';
    
    // 创建一个401错误
    const error = {
      response: { status: 401 },
      config: { headers: {} }
    };
    
    // 调用错误处理器
    try {
      await errorCallback(error);
    } catch (e) {
      // 忽略错误
    }
    
    // 验证刷新token被调用
    expect(authStore.refreshAccessToken).toHaveBeenCalled();
    
    // 验证请求被重试，并更新了token
    expect(error.config.headers.Authorization).toBe('Bearer new-token');
  });

  it('响应拦截器应处理非401错误', async () => {
    // 模拟拦截器调用
    let errorCallback;
    mockAxiosInstance.interceptors.response.use.mockImplementation((successCb, errorCb) => {
      errorCallback = errorCb;
      return 0;
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 创建一个非401错误
    const error = {
      response: { status: 500 },
      message: 'Server Error'
    };
    
    // 调用错误处理器
    try {
      await errorCallback(error);
      fail('应该抛出错误');
    } catch (e) {
      // 验证错误被传递
      expect(e).toBe(error);
    }
  });

  it('响应拦截器在token刷新失败时应抛出原始错误', async () => {
    // 模拟拦截器调用
    let errorCallback;
    mockAxiosInstance.interceptors.response.use.mockImplementation((successCb, errorCb) => {
      errorCallback = errorCb;
      return 0;
    });
    
    // 重新导入api模块
    const { default: apiModule } = await import('../../src/services/api');
    
    // 模拟认证store的refreshAccessToken方法失败
    authStore.refreshAccessToken = vi.fn().mockResolvedValue(false);
    
    // 创建一个401错误
    const error = {
      response: { status: 401 },
      message: 'Unauthorized'
    };
    
    // 调用错误处理器
    try {
      await errorCallback(error);
      fail('应该抛出错误');
    } catch (e) {
      // 验证错误被传递
      expect(e).toBe(error);
    }
  });

  it('应该提供正确的API接口方法', async () => {
    // 重新导入api模块
    const { authApi, resourceApi, homeApi, newsApi } = await import('../../src/services/api');
    
    // 验证API接口存在
    expect(authApi).toBeDefined();
    expect(resourceApi).toBeDefined();
    expect(homeApi).toBeDefined();
    expect(newsApi).toBeDefined();
    
    // 验证认证API方法
    expect(authApi.login).toBeDefined();
    expect(authApi.register).toBeDefined();
    expect(authApi.getMe).toBeDefined();
    expect(authApi.logout).toBeDefined();
    expect(authApi.refreshToken).toBeDefined();
  });
}); 