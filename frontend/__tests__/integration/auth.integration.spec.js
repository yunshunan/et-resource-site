/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth'
import { server } from '../msw/server'
import { apiServiceMock } from '../msw/mockHelpers'

// 在所有测试开始前启动MSW服务器
beforeAll(() => server.listen())

// 每个测试之后重置处理程序
afterEach(() => server.resetHandlers())

// 所有测试结束后关闭服务器
afterAll(() => server.close())

describe('Auth Store 集成测试', () => {
  let authStore

  beforeEach(() => {
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 获取auth store实例
    authStore = useAuthStore()
    
    // 清空localStorage
    localStorage.clear()
  })

  it('登录成功流程', async () => {
    // 执行登录操作
    const result = await authStore.login('test@example.com', 'password123')
    
    // 验证登录结果
    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user).toBeTruthy()
    expect(authStore.token).toBeTruthy()
    expect(authStore.refreshToken).toBeTruthy()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('登录失败流程', async () => {
    // 执行登录操作（使用错误的凭证）
    const result = await authStore.login('wrong@example.com', 'wrongpassword')
    
    // 验证登录结果
    expect(result).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeTruthy()
  })

  it('登录网络错误处理', async () => {
    // 设置登录接口返回网络错误
    apiServiceMock.mockNetworkError('POST', '/auth/login')
    
    // 执行登录操作
    const result = await authStore.login('test@example.com', 'password123')
    
    // 验证登录结果
    expect(result).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeTruthy()
  })

  it('注册成功流程', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: '新用户'
    }
    
    // 执行注册操作
    const result = await authStore.register(userData)
    
    // 验证注册结果
    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user).toBeTruthy()
    expect(authStore.token).toBeTruthy()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('获取用户信息并处理过期Token', async () => {
    // 先设置一个过期的token
    authStore.token = 'expired-token'
    authStore.error = null // 确保初始状态error为null
    
    try {
      // 执行获取用户信息操作
      await authStore.fetchCurrentUser()
    } catch (e) {
      // 这里可能会抛出错误，但我们不关心
    }
    
    // 验证自动登出
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
  })

  it('完整登录-获取用户信息-登出流程', async () => {
    // 1. 登录
    await authStore.login('test@example.com', 'password123')
    expect(authStore.isAuthenticated).toBe(true)
    
    // 2. 获取用户信息
    await authStore.fetchCurrentUser()
    expect(authStore.user).toBeTruthy()
    
    // 3. 登出
    await authStore.logout()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
  })
  
  it('刷新token并使用新token', async () => {
    // 设置初始token和refreshToken
    authStore.token = 'old-token'
    authStore.refreshToken = 'valid-refresh-token'
    
    // 执行刷新token操作
    const result = await authStore.refreshAccessToken()
    
    // 验证刷新结果
    expect(result).toBe(true)
    expect(authStore.token).not.toBe('old-token')
    expect(authStore.token).toBeTruthy()
  })
}) 