import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import { rest } from 'msw'

// 创建MSW服务器
export const server = setupServer(...handlers)

// 默认的请求处理程序
server.restoreHandlers = () => {
  server.resetHandlers()
  server.use(...handlers)
}

// 导出处理各种测试场景的辅助函数
export const authMock = {
  // 模拟登录失败
  mockLoginFail: () => {
    return server.use(
      rest.post('*/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: '用户名或密码错误' }))
      })
    )
  },
  
  // 模拟401未授权错误
  mockUnauthorized: () => {
    return server.use(
      rest.get('*/auth/me', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }))
      })
    )
  },
  
  // 模拟网络错误
  mockNetworkError: (endpoint) => {
    return server.use(
      rest.post(`*${endpoint}`, (req, res) => {
        return res.networkError('Network error')
      })
    )
  }
}

// 专门用于API服务测试的模拟
export const apiServiceMock = {
  // 模拟请求成功
  mockRequestSuccess: (method, endpoint, responseData) => {
    const restMethod = rest[method.toLowerCase()]
    if (!restMethod) throw new Error(`不支持的HTTP方法: ${method}`)
    
    return server.use(
      restMethod(`*${endpoint}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(responseData))
      })
    )
  },
  
  // 模拟请求失败
  mockRequestFailure: (method, endpoint, status = 500, message = 'Server Error') => {
    const restMethod = rest[method.toLowerCase()]
    if (!restMethod) throw new Error(`不支持的HTTP方法: ${method}`)
    
    return server.use(
      restMethod(`*${endpoint}`, (req, res, ctx) => {
        return res(ctx.status(status), ctx.json({ message }))
      })
    )
  },
  
  // 模拟请求超时
  mockRequestTimeout: (method, endpoint) => {
    const restMethod = rest[method.toLowerCase()]
    if (!restMethod) throw new Error(`不支持的HTTP方法: ${method}`)
    
    return server.use(
      restMethod(`*${endpoint}`, (req, res, ctx) => {
        return res.delay('infinite')
      })
    )
  },
  
  // 模拟请求网络错误
  mockNetworkError: (method, endpoint) => {
    const restMethod = rest[method.toLowerCase()]
    if (!restMethod) throw new Error(`不支持的HTTP方法: ${method}`)
    
    return server.use(
      restMethod(`*${endpoint}`, (req, res) => {
        return res.networkError('Network error')
      })
    )
  }
} 