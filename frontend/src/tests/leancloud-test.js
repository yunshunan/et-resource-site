// LeanCloud连接测试
import AV from '../config/leancloud';

console.log('正在测试LeanCloud连接...');

// 测试类创建
async function testClassExists(className) {
  try {
    const query = new AV.Query(className);
    query.limit(1);
    await query.find();
    console.log(`✅ 数据类 ${className} 检查成功`);
    return true;
  } catch (error) {
    console.error(`❌ 数据类 ${className} 检查失败:`, error.message);
    return false;
  }
}

// 创建数据类
async function createClass(className, sampleData) {
  try {
    const exists = await testClassExists(className);
    if (exists) {
      console.log(`数据类 ${className} 已存在，跳过创建`);
      return true;
    }

    const TestObject = AV.Object.extend(className);
    const testObject = new TestObject();
    for (const [key, value] of Object.entries(sampleData)) {
      testObject.set(key, value);
    }
    await testObject.save();
    console.log(`✅ 数据类 ${className} 创建成功`);
    return true;
  } catch (error) {
    console.error(`❌ 数据类 ${className} 创建失败:`, error.message);
    return false;
  }
}

// 测试用户注册
async function testUserRegistration(email, password, username) {
  try {
    // 检查用户是否已存在
    const query = new AV.Query(AV.User);
    query.equalTo('email', email);
    const existingUser = await query.first();
    
    if (existingUser) {
      console.log(`用户 ${email} 已存在，跳过注册`);
      return true;
    }
    
    // 创建新用户
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    
    await user.signUp();
    console.log(`✅ 用户 ${email} 注册成功`);
    return true;
  } catch (error) {
    console.error(`❌ 用户注册失败:`, error.message);
    return false;
  }
}

// 创建默认数据模型
async function setupDataModels() {
  // 1. 资源类
  await createClass('Resource', {
    title: '示例资源',
    description: '这是一个示例资源描述',
    price: 0,
    category: '示例分类',
    tags: ['示例', '测试'],
    fileUrl: 'https://example.com/sample.zip',
    thumbnailUrl: 'https://example.com/sample.jpg',
    author: AV.User.current() ? AV.User.current().id : 'system',
    downloads: 0,
    views: 0,
    rating: 5,
    isActive: true,
    isFeatured: false
  });

  // 2. 评论类
  await createClass('Comment', {
    content: '这是一个示例评论',
    resourceId: 'sample-resource-id',
    author: AV.User.current() ? AV.User.current().id : 'system',
    rating: 5
  });

  // 3. 分类类
  await createClass('Category', {
    name: '示例分类',
    description: '这是一个示例分类',
    icon: 'sample-icon',
    order: 1,
    isActive: true
  });

  // 4. 新闻类
  await createClass('News', {
    title: '示例新闻',
    content: '这是一个示例新闻内容',
    author: AV.User.current() ? AV.User.current().id : 'system',
    tags: ['新闻', '公告'],
    thumbnailUrl: 'https://example.com/news.jpg',
    isPublished: true
  });
}

// 执行测试
async function runTests() {
  try {
    // 测试创建一个测试用户
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    const testUsername = 'testuser';
    
    await testUserRegistration(testEmail, testPassword, testUsername);
    
    // 登录测试用户
    try {
      const user = await AV.User.logIn(testEmail, testPassword);
      console.log(`✅ 用户 ${testEmail} 登录成功`);
    } catch (error) {
      console.error('❌ 用户登录失败:', error.message);
    }
    
    // 设置数据模型
    await setupDataModels();
    
    console.log('✅ LeanCloud测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
runTests();

export default {
  testClassExists,
  createClass,
  testUserRegistration,
  setupDataModels,
  runTests
}; 