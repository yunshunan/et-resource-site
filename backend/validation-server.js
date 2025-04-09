/**
 * 简化版API服务器
 * 仅用于验证连接性和配置测试
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { leancloud } = require('./config/leancloud');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/jwt');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running'
    }
  });
});

// 环境变量检查
app.get('/api/config-check', (req, res) => {
  // 检查必要的环境变量
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'LEANCLOUD_APP_ID'
  ];
  
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('your_') || value === 'undefined') {
      placeholderVars.push(varName);
    }
  });
  
  res.json({
    success: missingVars.length === 0,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    missing: missingVars,
    placeholder: placeholderVars,
    message: missingVars.length === 0 
      ? '配置检查通过' 
      : '部分配置缺失，请检查.env文件'
  });
});

// JWT测试
app.get('/api/jwt-test', (req, res) => {
  try {
    // 创建测试令牌
    const payload = { userId: 'test-user', role: 'guest' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      token,
      decoded,
      message: 'JWT测试通过'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'JWT测试失败'
    });
  }
});

// LeanCloud测试
app.get('/api/leancloud-test', async (req, res) => {
  try {
    // 如果缺少真实凭证，返回占位符检查结果
    if (process.env.LEANCLOUD_APP_ID.includes('your_')) {
      return res.json({
        success: false,
        placeholder: true,
        message: '使用了LeanCloud占位符凭证，请在.env中配置真实凭证'
      });
    }
    
    // 测试对象
    const TestObject = leancloud.Object.extend('ValidationTest');
    const testObj = new TestObject();
    testObj.set('source', 'backend-validation');
    testObj.set('timestamp', new Date().toISOString());
    
    await testObj.save();
    
    res.json({
      success: true,
      objectId: testObj.id,
      message: 'LeanCloud测试通过'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'LeanCloud测试失败'
    });
  }
});

// 首页测试路由
app.get('/', (req, res) => {
  res.send('验证服务器正在运行');
});

// 启动服务器
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`验证服务器运行在 http://localhost:${PORT}`);
  console.log('可用测试端点:');
  console.log('- GET /api/health-check - 健康检查');
  console.log('- GET /api/config-check - 配置检查');
  console.log('- GET /api/jwt-test - JWT测试');
  console.log('- GET /api/leancloud-test - LeanCloud测试');
}); 