// 使用浏览器兼容的performance API
// import { performance } from 'perf_hooks'  

// 测试场景配置
export const testScenarios = {
  login: {
    name: '登录场景',
    steps: [
      { action: 'navigate', target: '/login' },
      { action: 'fillField', target: '#username', value: 'testuser' },
      { action: 'fillField', target: '#password', value: 'password123' },
      { action: 'click', target: '#loginButton' },
      { action: 'waitForNavigation', target: '/dashboard' }
    ]
  },
  
  search: {
    name: '搜索功能',
    steps: [
      { action: 'navigate', target: '/resources' },
      { action: 'fillField', target: '#searchInput', value: 'test query' },
      { action: 'click', target: '#searchButton' },
      { action: 'waitForElement', target: '.search-results' }
    ]
  },
  
  resourceCreation: {
    name: '资源创建',
    steps: [
      { action: 'navigate', target: '/resources/new' },
      { action: 'fillField', target: '#resourceTitle', value: '测试资源' },
      { action: 'fillField', target: '#resourceDescription', value: '这是一个测试资源描述' },
      { action: 'select', target: '#resourceType', value: '文档' },
      { action: 'click', target: '#saveButton' },
      { action: 'waitForElement', target: '.success-message' }
    ]
  }
};

// 测试运行器
export const runTest = async (scenario) => {
  if (!scenario || !scenario.steps) {
    throw new Error('无效的测试场景');
  }
  
  const results = [];
  let totalDuration = 0;
  
  console.log(`开始执行场景: ${scenario.name}`);
  
  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i];
    console.log(`执行步骤 ${i+1}/${scenario.steps.length}: ${step.action} ${step.target}`);
    
    const startTime = typeof window !== 'undefined' && window.performance 
      ? window.performance.now() 
      : Date.now();
      
    try {
      // 这里实际项目中实现步骤执行逻辑
      await simulateStep(step);
      
      const endTime = typeof window !== 'undefined' && window.performance 
        ? window.performance.now() 
        : Date.now();
      const duration = endTime - startTime;
      totalDuration += duration;
      
      results.push({
        step: i+1,
        action: step.action,
        target: step.target,
        duration,
        status: 'success'
      });
      
      console.log(`步骤完成，耗时: ${duration.toFixed(2)}ms`);
    } catch (error) {
      const endTime = typeof window !== 'undefined' && window.performance 
        ? window.performance.now() 
        : Date.now();
      const duration = endTime - startTime;
      
      results.push({
        step: i+1,
        action: step.action,
        target: step.target,
        duration,
        status: 'failed',
        error: error.message
      });
      
      console.error(`步骤失败: ${error.message}`);
      break;
    }
  }
  
  return {
    scenarioName: scenario.name,
    results,
    totalDuration,
    status: results.some(r => r.status === 'failed') ? 'failed' : 'success'
  };
};

// 模拟步骤执行
const simulateStep = async (step) => {
  // 实际项目中替换为真实的步骤执行逻辑
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
};

export default testScenarios; 