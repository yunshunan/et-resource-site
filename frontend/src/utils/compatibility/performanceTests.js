// 使用浏览器兼容的performance API
// import { performance } from 'perf_hooks'

// 性能测试配置
export const performanceTests = {
  // 基准测试
  memoryTest: {
    name: '内存使用测试',
    description: '测试应用程序内存消耗',
    frequency: 60000, // 每分钟执行一次
    enabled: false,
    execute: () => {
      if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
        return {
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          totalJSHeapSize: window.performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
        };
      }
      return { message: '当前环境不支持内存性能测试' };
    }
  },

  // 渲染性能测试
  renderTest: {
    name: '渲染性能测试',
    description: '测试组件渲染时间',
    frequency: 30000, // 每30秒执行一次
    enabled: false,
    execute: (component) => {
      if (typeof window !== 'undefined' && window.performance) {
        const start = window.performance.now();
        // 模拟组件渲染 (实际项目中替换为真实逻辑)
        // render(component);
        const end = window.performance.now();
        return {
          component: component.name || 'Unknown',
          renderTime: end - start
        };
      }
      return { message: '当前环境不支持渲染性能测试' };
    }
  },

  // 网络请求测试
  networkTest: {
    name: '网络请求测试',
    description: '测试API请求响应时间',
    frequency: 120000, // 每2分钟执行一次
    enabled: false,
    execute: async (url) => {
      if (typeof window !== 'undefined' && window.performance) {
        const start = window.performance.now();
        try {
          const response = await fetch(url);
          const end = window.performance.now();
          return {
            url,
            status: response.status,
            responseTime: end - start
          };
        } catch (error) {
          return {
            url,
            error: error.message,
            responseTime: window.performance.now() - start
          };
        }
      }
      return { message: '当前环境不支持网络性能测试' };
    }
  }
};

// 浏览器兼容性检查
export const checkPerformanceCompatibility = () => {
  const report = {
    performanceAPI: false,
    memoryAPI: false,
    timingAPI: false
  };

  if (typeof window !== 'undefined') {
    report.performanceAPI = !!window.performance;
    report.memoryAPI = !!(window.performance && window.performance.memory);
    report.timingAPI = !!(window.performance && window.performance.timing);
  }

  return report;
};

// 获取测试结果摘要 - 添加此函数以兼容旧代码
export const getTestSummary = (results) => {
  if (!results || !Array.isArray(results)) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      averageDuration: 0,
      categories: {}
    };
  }
  
  const summary = {
    total: results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    averageDuration: 0,
    categories: {}
  };
  
  let totalDuration = 0;
  let durationCount = 0;
  
  results.forEach(result => {
    if (result.status === 'success') {
      summary.passed++;
    } else if (result.status === 'failed') {
      summary.failed++;
    } else {
      summary.skipped++;
    }
    
    if (typeof result.duration === 'number') {
      totalDuration += result.duration;
      durationCount++;
      
      const category = result.category || 'default';
      
      if (!summary.categories[category]) {
        summary.categories[category] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          averageDuration: 0
        };
      }
      
      const categoryData = summary.categories[category];
      categoryData.total++;
      
      if (result.status === 'success') categoryData.passed++;
      else if (result.status === 'failed') categoryData.failed++;
      else categoryData.skipped++;
    }
  });
  
  summary.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;
  
  // 计算每个类别的平均持续时间
  Object.values(summary.categories).forEach(category => {
    category.averageDuration = category.total > 0 ? 
      totalDuration / category.total : 0;
  });
  
  return summary;
};

export default performanceTests; 