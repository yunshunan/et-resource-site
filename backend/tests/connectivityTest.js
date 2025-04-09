const { leancloud, AV } = require('../config/leancloud');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, generateToken, verifyToken } = require('../config/jwt');

// 测试 LeanCloud 连接
const testLeanCloud = async () => {
  console.log('开始测试 LeanCloud 连接...');
  try {
    // 检查 LeanCloud SDK 是否正确加载
    if (!leancloud || !AV) {
      throw new Error('LeanCloud SDK 未正确初始化');
    }
    
    // 测试创建一个对象并保存
    const TestObject = AV.Object.extend('BackendConnectivityTest');
    const testObject = new TestObject();
    testObject.set('source', 'backend');
    testObject.set('testKey', 'testValue');
    testObject.set('timestamp', new Date().toISOString());
    
    const savedObject = await testObject.save();
    console.log('LeanCloud 连接测试成功，对象 ID:', savedObject.id);
    
    return {
      success: true,
      objectId: savedObject.id,
      message: 'LeanCloud 连接测试成功'
    };
  } catch (error) {
    console.error('LeanCloud 连接测试失败:', error);
    return {
      success: false,
      error: error.message,
      message: 'LeanCloud 连接测试失败'
    };
  }
};

// 测试 JWT 功能
const testJWT = async () => {
  console.log('开始测试 JWT 功能...');
  try {
    // 测试生成 token
    const payload = { 
      userId: 'test-user-id', 
      username: 'testuser', 
      role: 'user' 
    };
    
    const token = generateToken(payload);
    if (!token) {
      throw new Error('JWT 令牌生成失败');
    }
    
    // 测试验证 token
    const verified = verifyToken(token);
    if (!verified.valid) {
      throw new Error('JWT 令牌验证失败');
    }
    
    console.log('JWT 功能测试成功');
    return {
      success: true,
      message: 'JWT 功能测试成功',
      payload: verified.decoded
    };
  } catch (error) {
    console.error('JWT 功能测试失败:', error);
    return {
      success: false,
      error: error.message,
      message: 'JWT 功能测试失败'
    };
  }
};

// 测试 bcrypt 功能
const testBcrypt = async () => {
  console.log('开始测试 bcrypt 功能...');
  try {
    // 测试密码哈希
    const password = 'test-password-123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    if (!hash) {
      throw new Error('bcrypt 哈希生成失败');
    }
    
    // 测试密码验证
    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      throw new Error('bcrypt 密码验证失败');
    }
    
    console.log('bcrypt 功能测试成功');
    return {
      success: true,
      message: 'bcrypt 功能测试成功'
    };
  } catch (error) {
    console.error('bcrypt 功能测试失败:', error);
    return {
      success: false,
      error: error.message,
      message: 'bcrypt 功能测试失败'
    };
  }
};

// 运行所有测试
const runAllTests = async () => {
  console.log('开始运行所有连接测试...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // 测试 LeanCloud
  results.tests.leanCloud = await testLeanCloud();
  
  // 测试 JWT
  results.tests.jwt = await testJWT();
  
  // 测试 bcrypt
  results.tests.bcrypt = await testBcrypt();
  
  // 计算总体结果
  results.overallSuccess = 
    results.tests.leanCloud.success && 
    results.tests.jwt.success && 
    results.tests.bcrypt.success;
  
  console.log('所有测试完成，结果:', results);
  return results;
};

// 直接运行测试
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log('测试结果摘要:');
      console.log('- LeanCloud:', results.tests.leanCloud.success ? '成功' : '失败');
      console.log('- JWT:', results.tests.jwt.success ? '成功' : '失败');
      console.log('- bcrypt:', results.tests.bcrypt.success ? '成功' : '失败');
      console.log('总体结果:', results.overallSuccess ? '成功' : '失败');
      
      // 根据测试结果设置退出码
      process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('测试运行出错:', error);
      process.exit(1);
    });
}

module.exports = {
  testLeanCloud,
  testJWT,
  testBcrypt,
  runAllTests
}; 