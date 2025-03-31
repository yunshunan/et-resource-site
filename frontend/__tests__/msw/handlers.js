import { rest } from 'msw'
import {
  mockLoginSuccess,
  mockLoginFailure,
  mockRegisterSuccess,
  mockRegisterFailure,
  mockGetUserSuccess,
  mockRefreshTokenSuccess,
  mockRefreshTokenFailure
} from '../mock/authApiMock'

// API基础URL
const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

// 模拟认证API
export const handlers = [
  // 登录处理
  rest.post(`${baseUrl}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body
    
    // 简单的模拟验证
    if (email === 'test@example.com' && password === 'password123') {
      return res(ctx.json(mockLoginSuccess))
    } else if (email === 'admin@example.com' && password === 'adminpass') {
      return res(ctx.json(mockLoginSuccess))
    } else {
      return res(ctx.json(mockLoginFailure))
    }
  }),
  
  // 注册处理
  rest.post(`${baseUrl}/auth/register`, (req, res, ctx) => {
    const { email } = req.body
    
    // 检查邮箱是否已存在
    if (email === 'existing@example.com') {
      return res(ctx.json(mockRegisterFailure))
    } else {
      return res(ctx.json(mockRegisterSuccess))
    }
  }),
  
  // 获取当前用户信息
  rest.get(`${baseUrl}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }))
    }
    
    const token = authHeader.split(' ')[1]
    
    // 检查token是否有效
    if (token === 'expired-token') {
      return res(ctx.status(401), ctx.json({ message: 'Token expired' }))
    } else {
      return res(ctx.json(mockGetUserSuccess))
    }
  }),
  
  // 注销
  rest.post(`${baseUrl}/auth/logout`, (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),
  
  // 刷新token
  rest.post(`${baseUrl}/auth/refresh-token`, (req, res, ctx) => {
    const { refreshToken } = req.body
    
    if (refreshToken === 'invalid-refresh-token') {
      return res(ctx.json(mockRefreshTokenFailure))
    } else {
      return res(ctx.json(mockRefreshTokenSuccess))
    }
  })
] 