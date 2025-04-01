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
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    // 模拟验证逻辑
    if (email === 'test@example.com' && password === 'password123') {
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
    } else if (email === 'wrong@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: '邮箱或密码错误'
        })
      );
    } else {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: '登录失败，请检查您的账号和密码'
        })
      );
    }
  }),
  
  // 用户注册
  rest.post('/api/auth/register', (req, res, ctx) => {
    const userData = req.body;
    
    if (userData.email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: '该邮箱已被注册'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '注册成功',
        data: {
          user: {
            _id: 'new-user',
            username: userData.username || 'newuser',
            email: userData.email,
            role: 'user'
          },
          tokens: mockTokens
        }
      })
    );
  }),
  
  // 用户注销
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '已成功注销'
      })
    );
  }),
  
  // 获取当前用户信息
  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: '未授权，请先登录'
        })
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token === 'expired-token') {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: 'Token已过期，请重新登录'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUsers[0]
      })
    );
  }),
  
  // 刷新token
  rest.post('/api/auth/refresh-token', (req, res, ctx) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken || refreshToken === 'invalid-refresh-token') {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: 'Refresh token无效或已过期'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }
      })
    );
  })
];

export default authHandlers; 