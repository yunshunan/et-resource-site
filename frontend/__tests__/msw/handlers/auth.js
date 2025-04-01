import { rest } from 'msw';

// 模拟用户数据
const mockUsers = [
  {
    _id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  },
  {
    _id: 'admin1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  }
];

// 模拟令牌
const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token'
};

// 认证处理程序
const authHandlers = [
  // 用户登录
  rest.post('/api/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '登录成功',
        data: {
          user: mockUsers[0],
          tokens: mockTokens
        }
      })
    );
  }),
  
  // 用户注销
  rest.post('/api/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '已成功注销'
      })
    );
  }),
  
  // 获取当前用户信息
  rest.get('/api/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUsers[0]
      })
    );
  })
];

export default authHandlers; 