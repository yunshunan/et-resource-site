const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../index');
const User = require('../models/User');

// 创建测试数据库连接
beforeAll(async () => {
  // 使用内存数据库进行测试
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/et-resource-site-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// 清理测试数据
afterEach(async () => {
  await User.deleteMany({});
});

// 关闭数据库连接
afterAll(async () => {
  await mongoose.connection.close();
});

describe('身份验证API', () => {
  // 测试用户注册
  it('应该能够注册新用户', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.user.email).toBe(userData.email);
  });
  
  // 测试重复注册
  it('不应该允许使用重复的邮箱注册', async () => {
    // 先创建一个用户
    await User.create({
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'password123'
    });
    
    // 尝试使用相同的邮箱注册
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'existing@example.com',
        password: 'newpassword'
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('已被注册');
  });
  
  // 测试用户登录
  it('应该能够使用有效凭据登录', async () => {
    // 创建测试用户
    const password = 'password123';
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password
    });
    
    // 尝试登录
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
  });
  
  // 测试无效登录
  it('不应该使用无效凭据登录', async () => {
    // 创建测试用户
    await User.create({
      username: 'invaliduser',
      email: 'invalid@example.com',
      password: 'correctpassword'
    });
    
    // 尝试使用错误密码登录
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
}); 