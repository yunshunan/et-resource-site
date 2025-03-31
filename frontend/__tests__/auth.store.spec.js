/**
 * @jest-environment jsdom
 */

import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia())
  })

  it('初始状态应该为未登录', () => {
    const authStore = useAuthStore()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('登录成功后应更新状态', async () => {
    const authStore = useAuthStore()
    
    // 模拟登录操作
    const result = await authStore.login('test@example.com', 'password123')
    
    // 验证登录结果
    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user).not.toBeNull()
    expect(authStore.user.email).toBe('test@example.com')
    expect(authStore.token).not.toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('注销后应清除状态', async () => {
    const authStore = useAuthStore()
    
    // 先登录
    await authStore.login('test@example.com', 'password123')
    
    // 执行注销
    authStore.logout()
    
    // 验证状态被清除
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.error).toBeNull()
  })
}) 