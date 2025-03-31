const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../index');
const Resource = require('../models/Resource');
const User = require('../models/User');

let testUser;
let authToken;

// 创建测试数据库连接
beforeAll(async () => {
  // 使用内存数据库进行测试
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/et-resource-site-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // 创建测试用户
  testUser = await User.create({
    username: 'resourcetester',
    email: 'resource@test.com',
    password: 'password123'
  });

  // 登录获取token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'resource@test.com',
      password: 'password123'
    });
  
  authToken = loginResponse.body.accessToken;
});

// 清理测试数据
afterEach(async () => {
  await Resource.deleteMany({});
});

// 关闭数据库连接
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('资源API', () => {
  // 测试资源创建
  it('已认证用户应能创建资源', async () => {
    const resourceData = {
      title: '测试资源',
      description: '这是一个测试资源',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      downloadLink: 'https://example.com/file.zip'
    };
    
    const response = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${authToken}`)
      .send(resourceData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.title).toBe(resourceData.title);
    expect(response.body.data.user).toBe(testUser.id);
  });
  
  // 测试未认证用户不能创建资源
  it('未认证用户不应能创建资源', async () => {
    const resourceData = {
      title: '测试资源',
      description: '这是一个测试资源',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg'
    };
    
    const response = await request(app)
      .post('/api/resources')
      .send(resourceData);
    
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
  
  // 测试获取资源列表
  it('应能获取资源列表', async () => {
    // 创建多个测试资源
    await Resource.create([
      {
        title: '资源1',
        description: '描述1',
        category: '开发资源',
        imageUrl: 'https://example.com/image1.jpg',
        user: testUser.id
      },
      {
        title: '资源2',
        description: '描述2',
        category: '设计资源',
        imageUrl: 'https://example.com/image2.jpg',
        user: testUser.id
      }
    ]);
    
    const response = await request(app).get('/api/resources');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.total).toBe(2);
  });
  
  // 测试获取资源详情
  it('应能获取单个资源详情', async () => {
    const resource = await Resource.create({
      title: '详情资源',
      description: '详情描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: testUser.id
    });
    
    const response = await request(app).get(`/api/resources/${resource.id}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.title).toBe('详情资源');
  });
  
  // 测试更新资源
  it('资源拥有者应能更新资源', async () => {
    const resource = await Resource.create({
      title: '原始资源',
      description: '原始描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: testUser.id
    });
    
    const updateData = {
      title: '更新后的资源',
      description: '更新后的描述'
    };
    
    const response = await request(app)
      .put(`/api/resources/${resource.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(updateData.title);
    expect(response.body.data.description).toBe(updateData.description);
  });
  
  // 测试非拥有者不能更新资源
  it('非资源拥有者不应能更新资源', async () => {
    // 创建另一个用户
    const otherUser = await User.create({
      username: 'otheruser',
      email: 'other@test.com',
      password: 'password123'
    });
    
    // 创建属于其他用户的资源
    const resource = await Resource.create({
      title: '其他用户的资源',
      description: '描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: otherUser.id
    });
    
    const updateData = {
      title: '尝试更新',
      description: '尝试更新描述'
    };
    
    const response = await request(app)
      .put(`/api/resources/${resource.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);
    
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
  
  // 测试删除资源
  it('资源拥有者应能删除资源', async () => {
    const resource = await Resource.create({
      title: '要删除的资源',
      description: '描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: testUser.id
    });
    
    const response = await request(app)
      .delete(`/api/resources/${resource.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    
    // 验证数据库中已删除
    const deletedResource = await Resource.findById(resource.id);
    expect(deletedResource).toBeNull();
  });
  
  // 测试收藏功能
  it('用户应能收藏资源', async () => {
    const resource = await Resource.create({
      title: '收藏测试资源',
      description: '描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: testUser.id
    });
    
    const response = await request(app)
      .put(`/api/resources/${resource.id}/favorite`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.favorites).toContain(testUser.id.toString());
    
    // 再次调用应取消收藏
    const unfavoriteResponse = await request(app)
      .put(`/api/resources/${resource.id}/favorite`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(unfavoriteResponse.statusCode).toBe(200);
    expect(unfavoriteResponse.body.success).toBe(true);
    expect(unfavoriteResponse.body.data.favorites).not.toContain(testUser.id.toString());
  });
  
  // 测试评分功能
  it('用户应能对资源进行评分', async () => {
    const resource = await Resource.create({
      title: '评分测试资源',
      description: '描述',
      category: '开发资源',
      imageUrl: 'https://example.com/image.jpg',
      user: testUser.id
    });
    
    const response = await request(app)
      .post(`/api/resources/${resource.id}/rating`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ rating: 4 });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.averageRating).toBe(4);
    expect(response.body.data.ratingCount).toBe(1);
  });
  
  // 测试按分类筛选
  it('应能按分类筛选资源', async () => {
    // 创建不同分类的资源
    await Resource.create([
      {
        title: '开发资源1',
        description: '描述',
        category: '开发资源',
        imageUrl: 'https://example.com/dev1.jpg',
        user: testUser.id
      },
      {
        title: '开发资源2',
        description: '描述',
        category: '开发资源',
        imageUrl: 'https://example.com/dev2.jpg',
        user: testUser.id
      },
      {
        title: '设计资源',
        description: '描述',
        category: '设计资源',
        imageUrl: 'https://example.com/design.jpg',
        user: testUser.id
      }
    ]);
    
    const response = await request(app)
      .get('/api/resources')
      .query({ category: '开发资源' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].category).toBe('开发资源');
    expect(response.body.data[1].category).toBe('开发资源');
  });

  // 测试用户资源列表
  it('应能获取用户上传的资源', async () => {
    // 创建测试资源
    await Resource.create([
      {
        title: '用户资源1',
        description: '描述',
        category: '开发资源',
        imageUrl: 'https://example.com/user1.jpg',
        user: testUser.id
      },
      {
        title: '用户资源2',
        description: '描述',
        category: '设计资源',
        imageUrl: 'https://example.com/user2.jpg',
        user: testUser.id
      }
    ]);
    
    const response = await request(app)
      .get('/api/resources/user')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].user).toBe(testUser.id.toString());
    expect(response.body.data[1].user).toBe(testUser.id.toString());
  });
}); 