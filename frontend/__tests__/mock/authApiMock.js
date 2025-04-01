// 模拟认证API的响应
import { vi } from 'vitest'

// 模拟用户数据
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '测试用户',
  role: 'user'
}

// 模拟管理员用户数据
const mockAdminUser = {
  id: '2',
  email: 'admin@example.com',
  name: '管理员',
  role: 'admin'
}

// 模拟token
const mockToken = 'mock-jwt-token-xyz123'
const mockRefreshToken = 'mock-refresh-token-abc789'

// 模拟登录成功响应
export const mockLoginSuccess = {
  success: true,
  user: mockUser,
  accessToken: mockToken,
  refreshToken: mockRefreshToken,
  message: '登录成功'
}

// 模拟登录失败响应
export const mockLoginFailure = {
  success: false,
  message: '用户名或密码错误'
}

// 模拟注册成功响应
export const mockRegisterSuccess = {
  success: true,
  user: mockUser,
  accessToken: mockToken,
  refreshToken: mockRefreshToken,
  message: '注册成功'
}

// 模拟注册失败响应
export const mockRegisterFailure = {
  success: false,
  message: '该邮箱已被注册'
}

// 模拟获取用户信息成功响应
export const mockGetUserSuccess = {
  success: true,
  data: mockUser
}

// 模拟刷新token成功响应
export const mockRefreshTokenSuccess = {
  success: true,
  accessToken: 'new-access-token-xyz456'
}

// 模拟刷新token失败响应
export const mockRefreshTokenFailure = {
  success: false,
  message: '刷新token失败'
}

// 创建authApi模拟
export const createAuthApiMock = () => {
  return {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  }
}

export const mockAdminLoginSuccess = {
  success: true,
  user: mockAdminUser,
  accessToken: mockToken,
  refreshToken: mockRefreshToken,
  message: '登录成功'
} 