/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// 导入模拟响应
import { 
  mockLoginSuccess, 
  mockLoginFailure, 
  mockRegisterSuccess, 
  mockRegisterFailure,
  mockGetUserSuccess,
  mockRefreshTokenSuccess,
  mockRefreshTokenFailure,
  mockAdminLoginSuccess
} from './mock/authApiMock';

// 模拟API必须在导入存储前定义
vi.mock('../src/services/api', async () => {
  // 创建模拟API函数
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();
  const mockGetMe = vi.fn();
  const mockLogout = vi.fn();
  const mockRefreshToken = vi.fn();
  
  return {
    authApi: {
      login: mockLogin,
      register: mockRegister,
      getMe: mockGetMe,
      logout: mockLogout,
      refreshToken: mockRefreshToken
    }
  };
});

// 导入必须在模拟之后
import { useAuthStore } from '../src/stores/auth';
import { authApi } from '../src/services/api';

describe('Auth Store', () => {
  let authStore;
  let originalLocalStorage;

  beforeEach(() => {
    // 保存原始localStorage
    originalLocalStorage = global.localStorage;
    
    // 创建一个新的Pinia实例并使其处于激活状态
    const pinia = createPinia();
    pinia.use(createPersistedState());
    setActivePinia(pinia);
    
    // 获取auth store实例
    authStore = useAuthStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始localStorage
    global.localStorage = originalLocalStorage;
  });

  // 测试初始状态
  it('初始状态应该为未登录', () => {
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  // 测试getters
  describe('Getters', () => {
    it('currentUser应返回当前用户', () => {
      const testUser = { id: '1', name: '测试用户', email: 'test@example.com' };
      authStore.user = testUser;
      
      expect(authStore.currentUser).toEqual(testUser);
    });
    
    it('isLoggedIn应在已认证且有token时返回true', () => {
      authStore.isAuthenticated = true;
      authStore.token = 'valid-token';
      
      expect(authStore.isLoggedIn).toBe(true);
    });
    
    it('isLoggedIn应在认证状态不完整时返回false', () => {
      // 只设置认证标志但没有token
      authStore.isAuthenticated = true;
      authStore.token = null;
      
      expect(authStore.isLoggedIn).toBe(false);
      
      // 只设置token但认证标志为false
      authStore.isAuthenticated = false;
      authStore.token = 'valid-token';
      
      expect(authStore.isLoggedIn).toBe(false);
    });
    
    it('isAdmin应在用户具有admin角色时返回true', () => {
      authStore.user = { id: '1', name: '管理员', role: 'admin' };
      
      expect(authStore.isAdmin).toBe(true);
    });
    
    it('isAdmin应在用户不具有admin角色时返回false', () => {
      authStore.user = { id: '1', name: '普通用户', role: 'user' };
      
      expect(authStore.isAdmin).toBe(false);
    });
    
    it('isAdmin应在用户为null时返回false', () => {
      authStore.user = null;
      
      // 简化测试，直接检查isAdmin是否为false
      expect(authStore.isAdmin).toBe(false);
    });
  });

  // 测试登录成功
  it('登录成功后应更新状态', async () => {
    // 设置模拟函数的返回值
    authApi.login.mockResolvedValue(mockLoginSuccess);
    
    // 执行登录操作
    const result = await authStore.login('test@example.com', 'password123');
    
    // 验证登录函数被调用
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // 验证登录结果
    expect(result).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toEqual(mockLoginSuccess.user);
    expect(authStore.token).toBe(mockLoginSuccess.accessToken);
    expect(authStore.refreshToken).toBe(mockLoginSuccess.refreshToken);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  // 测试登录失败
  it('登录失败时应设置错误信息', async () => {
    // 设置模拟函数的返回值
    authApi.login.mockResolvedValue(mockLoginFailure);
    
    // 执行登录操作
    const result = await authStore.login('wrong@example.com', 'wrongpassword');
    
    // 验证登录结果
    expect(result).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe(mockLoginFailure.message);
  });

  // 测试API返回带有response对象的错误
  it('登录API响应错误时应正确提取错误消息', async () => {
    // 模拟API响应错误
    const apiError = new Error('API Error');
    apiError.response = {
      data: {
        message: '服务器端验证错误'
      }
    };
    authApi.login.mockRejectedValue(apiError);
    
    // 执行登录操作
    const result = await authStore.login('test@example.com', 'password123');
    
    // 验证登录结果
    expect(result).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe('服务器端验证错误');
  });

  // 测试网络错误处理
  it('网络错误时应正确处理并设置错误信息', async () => {
    // 模拟网络错误
    const networkError = new Error('Network Error');
    authApi.login.mockRejectedValue(networkError);
    
    // 执行登录操作
    const result = await authStore.login('test@example.com', 'password123');
    
    // 验证登录结果
    expect(result).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe('Network Error');
  });

  // 测试注销功能
  it('注销后应清除状态', async () => {
    // 先登录
    authApi.login.mockResolvedValue(mockLoginSuccess);
    await authStore.login('test@example.com', 'password123');
    
    // 设置注销的模拟返回
    authApi.logout.mockResolvedValue({ success: true });
    
    // 执行注销
    await authStore.logout();
    
    // 验证注销API被调用
    expect(authApi.logout).toHaveBeenCalled();
    
    // 验证状态被清除
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.refreshToken).toBeNull();
    expect(authStore.error).toBeNull();
  });

  // 测试注销时未登录的情况
  it('未登录时注销不应调用API', async () => {
    // 确保未登录状态
    authStore.isAuthenticated = false;
    
    // 执行注销
    await authStore.logout();
    
    // 验证注销API未被调用
    expect(authApi.logout).not.toHaveBeenCalled();
    
    // 验证状态保持未登录
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.refreshToken).toBeNull();
  });

  // 测试注销时的网络错误
  it('注销时发生错误也应清除状态', async () => {
    // 先登录
    authApi.login.mockResolvedValue(mockLoginSuccess);
    await authStore.login('test@example.com', 'password123');
    
    // 模拟注销时网络错误
    authApi.logout.mockRejectedValue(new Error('网络错误'));
    
    // 执行注销
    await authStore.logout();
    
    // 验证尽管有错误，状态依然被清除
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.refreshToken).toBeNull();
    expect(authStore.error).toBeNull();
  });

  // 测试注册成功
  it('注册成功后应更新状态', async () => {
    // 设置模拟函数的返回值
    authApi.register.mockResolvedValue(mockRegisterSuccess);
    
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: '新用户'
    };
    
    // 执行注册操作
    const result = await authStore.register(userData);
    
    // 验证注册函数被调用
    expect(authApi.register).toHaveBeenCalledWith(userData);
    
    // 验证注册结果
    expect(result).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toEqual(mockRegisterSuccess.user);
    expect(authStore.token).toBe(mockRegisterSuccess.accessToken);
    expect(authStore.refreshToken).toBe(mockRegisterSuccess.refreshToken);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  // 测试注册失败
  it('注册失败时应设置错误信息', async () => {
    // 设置模拟函数的返回值
    authApi.register.mockResolvedValue(mockRegisterFailure);
    
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      name: '已存在用户'
    };
    
    // 执行注册操作
    const result = await authStore.register(userData);
    
    // 验证注册结果
    expect(result).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe(mockRegisterFailure.message);
  });

  // 测试获取当前用户信息
  it('获取当前用户信息成功', async () => {
    // 先设置token
    authStore.token = 'some-token';
    
    // 设置模拟函数的返回值
    authApi.getMe.mockResolvedValue(mockGetUserSuccess);
    
    // 执行获取用户信息操作
    await authStore.fetchCurrentUser();
    
    // 验证API被调用
    expect(authApi.getMe).toHaveBeenCalled();
    
    // 验证结果
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toEqual(mockGetUserSuccess.data);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  // 测试没有token时获取用户信息
  it('没有token时不应获取用户信息', async () => {
    // 确保没有token
    authStore.token = null;
    
    // 执行获取用户信息操作
    await authStore.fetchCurrentUser();
    
    // 验证API未被调用
    expect(authApi.getMe).not.toHaveBeenCalled();
  });

  // 测试获取用户信息返回401
  it('获取用户信息返回401时应执行注销', async () => {
    // 设置token
    authStore.token = 'expired-token';
    
    // 模拟401错误
    const unauthorizedError = new Error('Unauthorized');
    unauthorizedError.response = { status: 401 };
    authApi.getMe.mockRejectedValue(unauthorizedError);
    
    // 设置注销的模拟返回
    authApi.logout.mockResolvedValue({ success: true });
    
    // 执行获取用户信息操作
    await authStore.fetchCurrentUser();
    
    // 验证用户被注销
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.token).toBeNull();
    expect(authStore.user).toBeNull();
  });

  // 测试获取用户信息失败（非401错误）
  it('获取用户信息失败时应设置错误信息', async () => {
    // 设置token
    authStore.token = 'valid-token';
    
    // 模拟API错误
    const apiError = new Error('API Error');
    apiError.response = { 
      status: 500,
      data: { message: '服务器错误' }
    };
    authApi.getMe.mockRejectedValue(apiError);
    
    // 执行获取用户信息操作
    await authStore.fetchCurrentUser();
    
    // 验证错误状态
    expect(authStore.error).toBe('服务器错误');
    expect(authStore.loading).toBe(false);
  });

  // 测试刷新token成功
  it('刷新token成功时应更新token', async () => {
    // 设置初始token和refreshToken
    authStore.token = 'old-token';
    authStore.refreshToken = 'valid-refresh-token';
    
    // 设置模拟函数的返回值
    authApi.refreshToken.mockResolvedValue(mockRefreshTokenSuccess);
    
    // 执行刷新token操作
    const result = await authStore.refreshAccessToken();
    
    // 验证refreshToken函数被调用
    expect(authApi.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    
    // 验证结果
    expect(result).toBe(true);
    expect(authStore.token).toBe(mockRefreshTokenSuccess.accessToken);
  });

  // 测试刷新token失败
  it('刷新token失败时应返回false', async () => {
    // 设置初始token和refreshToken
    authStore.token = 'old-token';
    authStore.refreshToken = 'invalid-refresh-token';
    
    // 设置模拟函数的返回值
    authApi.refreshToken.mockResolvedValue(mockRefreshTokenFailure);
    
    // 执行刷新token操作
    const result = await authStore.refreshAccessToken();
    
    // 验证结果
    expect(result).toBe(false);
    // token不应被更新
    expect(authStore.token).toBe('old-token');
  });

  // 测试无refreshToken时的行为
  it('没有refreshToken时不应尝试刷新token', async () => {
    // 设置token但不设置refreshToken
    authStore.token = 'some-token';
    authStore.refreshToken = null;
    
    // 执行刷新token操作
    const result = await authStore.refreshAccessToken();
    
    // 验证API未被调用
    expect(authApi.refreshToken).not.toHaveBeenCalled();
    
    // 验证结果
    expect(result).toBe(false);
  });

  // 测试刷新token网络错误
  it('刷新token网络错误应执行注销', async () => {
    // 设置初始token和refreshToken
    authStore.token = 'old-token';
    authStore.refreshToken = 'valid-refresh-token';
    authStore.isAuthenticated = true;
    authStore.user = { id: '1', name: '测试用户' };
    
    // 模拟刷新token时网络错误
    authApi.refreshToken.mockRejectedValue(new Error('网络错误'));
    
    // 设置注销的模拟返回
    authApi.logout.mockResolvedValue({ success: true });
    
    // 执行刷新token操作
    const result = await authStore.refreshAccessToken();
    
    // 验证执行了注销
    expect(result).toBe(false);
    expect(authStore.token).toBeNull();
    expect(authStore.refreshToken).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
  });

  // 测试持久化存储相关功能
  it('登录成功后应能保持状态', async () => {
    // 设置模拟函数的返回值
    authApi.login.mockResolvedValue(mockLoginSuccess);
    
    // 执行登录操作
    await authStore.login('test@example.com', 'password123');
    
    // 验证状态已设置
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.token).toBe(mockLoginSuccess.accessToken);
    
    // 创建新的store实例，检查状态是否保持
    const newStore = useAuthStore();
    expect(newStore.isAuthenticated).toBe(true);
    expect(newStore.token).toBe(mockLoginSuccess.accessToken);
  });
  
  // 测试持久化存储 - 注销后清除
  it('注销后状态应被清除', async () => {
    // 设置初始状态
    authStore.isAuthenticated = true;
    authStore.token = 'test-token';
    authStore.refreshToken = 'test-refresh';
    authStore.user = { id: '1', name: '测试用户' };
    
    // 设置注销的模拟返回
    authApi.logout.mockResolvedValue({ success: true });
    
    // 执行注销
    await authStore.logout();
    
    // 验证状态被清除
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.token).toBeNull();
    expect(authStore.refreshToken).toBeNull();
    expect(authStore.user).toBeNull();
    
    // 创建新的store实例，检查状态是否仍被清除
    const newStore = useAuthStore();
    expect(newStore.isAuthenticated).toBe(false);
    expect(newStore.token).toBeNull();
  });

  // 测试持久化存储 - localStorage不可用
  it('localStorage不可用时应正常运行', async () => {
    // 模拟localStorage不可用
    global.localStorage = {
      setItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      }),
      getItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      }),
      removeItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      })
    };
    
    // 创建带持久化的Pinia实例
    const pinia = createPinia();
    pinia.use(createPersistedState());
    setActivePinia(pinia);
    authStore = useAuthStore();
    
    // 尝试执行登录
    authApi.login.mockResolvedValue(mockLoginSuccess);
    const result = await authStore.login('test@example.com', 'password123');
    
    // 验证登录依然成功，尽管localStorage不可用
    expect(result).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
  });

  // 测试管理员登录
  it('管理员用户登录成功后isAdmin应为true', async () => {
    // 设置模拟函数的返回值
    authApi.login.mockResolvedValue(mockAdminLoginSuccess);
    
    // 执行登录操作
    await authStore.login('admin@example.com', 'adminpass');
    
    // 验证isAdmin getter
    expect(authStore.isAdmin).toBe(true);
  });
}); 