import { leancloud, LeanCloudServices } from '../services/leancloud';
import { FirebaseAuth } from '../services/firebase';
import * as Sentry from '@sentry/vue';

// 测试 LeanCloud 连接
const testLeanCloud = async () => {
  console.log('开始测试 LeanCloud 连接...');
  try {
    // 测试 LeanCloud SDK 是否正确加载
    if (!leancloud) {
      throw new Error('LeanCloud SDK 未正确初始化');
    }
    
    // 测试创建一个 LeanCloud 对象并保存（使用 Test 类）
    const TestObject = leancloud.Object.extend('ConnectivityTest');
    const testObject = new TestObject();
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

// 测试 Firebase Auth 连接
const testFirebaseAuth = async () => {
  console.log('开始测试 Firebase Auth 连接...');
  try {
    // 测试 Firebase Auth SDK 是否正确加载
    if (!FirebaseAuth) {
      throw new Error('Firebase Auth SDK 未正确初始化');
    }
    
    // 无需实际创建用户，只检查 SDK 是否可用
    const currentUser = FirebaseAuth.getCurrentUser();
    console.log('Firebase Auth 连接测试成功，当前用户:', currentUser ? '已登录' : '未登录');
    
    return {
      success: true,
      isLoggedIn: !!currentUser,
      message: 'Firebase Auth 连接测试成功'
    };
  } catch (error) {
    console.error('Firebase Auth 连接测试失败:', error);
    return {
      success: false,
      error: error.message,
      message: 'Firebase Auth 连接测试失败'
    };
  }
};

// 测试 Sentry 连接
const testSentry = async () => {
  console.log('开始测试 Sentry 连接...');
  try {
    // 测试 Sentry SDK 是否正确加载
    if (!Sentry) {
      throw new Error('Sentry SDK 未正确初始化');
    }
    
    // 发送测试事件到 Sentry
    Sentry.captureMessage('这是一个 Sentry 连接测试事件', 'info');
    console.log('Sentry 测试事件已发送');
    
    return {
      success: true,
      message: 'Sentry 连接测试成功，已发送测试事件'
    };
  } catch (error) {
    console.error('Sentry 连接测试失败:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sentry 连接测试失败'
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
  
  // 测试 Firebase Auth
  results.tests.firebaseAuth = await testFirebaseAuth();
  
  // 测试 Sentry
  results.tests.sentry = await testSentry();
  
  // 计算总体结果
  results.overallSuccess = 
    results.tests.leanCloud.success && 
    results.tests.firebaseAuth.success && 
    results.tests.sentry.success;
  
  console.log('所有测试完成，结果:', results);
  return results;
};

export {
  testLeanCloud,
  testFirebaseAuth,
  testSentry,
  runAllTests
}; 