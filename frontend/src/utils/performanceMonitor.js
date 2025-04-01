/**
 * 性能监控工具
 * 用于收集和分析Web性能指标
 */

import * as performanceStorage from './performanceStorage'
import * as notificationService from './notificationService'
import * as performanceSync from './performanceSync'

// 性能指标存储
let metrics = {
  FCP: null,  // First Contentful Paint
  LCP: null,  // Largest Contentful Paint
  FID: null,  // First Input Delay
  CLS: null,  // Cumulative Layout Shift
  TTFB: null, // Time to First Byte
  routeChanges: [], // 路由切换性能记录
  resourceLoads: [], // 资源加载性能记录
  apiCalls: []      // API调用性能记录
};

// 观察者配置
const observerOptions = {
  entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
};

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
  // 注册性能观察者
  if ('PerformanceObserver' in window) {
    // 监控FCP
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.FCP = entry.startTime;
          console.log(`[Performance] FCP: ${metrics.FCP}ms`);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // 监控LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.LCP = lastEntry.startTime;
      console.log(`[Performance] LCP: ${metrics.LCP}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // 监控FID
    new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0];
      metrics.FID = firstInput.processingStart - firstInput.startTime;
      console.log(`[Performance] FID: ${metrics.FID}ms`);
    }).observe({ entryTypes: ['first-input'] });

    // 监控CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metrics.CLS = clsValue;
          console.log(`[Performance] CLS: ${metrics.CLS}`);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // 计算TTFB
  metrics.TTFB = performance.timing.responseStart - performance.timing.navigationStart;
  
  // 启动同步服务
  performanceSync.startSyncService();
  
  // 定期保存和同步性能数据
  setInterval(() => {
    const analysis = analyzePerformance();
    
    // 保存到本地存储
    performanceStorage.savePerformanceData(analysis);
    
    // 同步到服务器
    performanceSync.queuePerformanceData(analysis);
    
    // 检查性能阈值
    const warnings = performanceStorage.checkThresholds(analysis.coreMetrics);
    if (warnings.length > 0) {
      handlePerformanceWarnings(warnings);
    }
  }, 60000); // 每分钟执行一次
}

/**
 * 处理性能警告
 * @param {Array} warnings 警告列表
 */
function handlePerformanceWarnings(warnings) {
  warnings.forEach(warning => {
    notificationService.sendPerformanceWarning(warning);
  });
}

/**
 * 记录路由变化性能
 * @param {string} from 来源路由
 * @param {string} to 目标路由
 * @param {number} duration 持续时间
 */
export function recordRouteChange(from, to, duration) {
  metrics.routeChanges.push({
    from,
    to,
    duration,
    timestamp: Date.now()
  });
}

/**
 * 记录资源加载性能
 * @param {string} resourceUrl 资源URL
 * @param {string} resourceType 资源类型
 * @param {number} loadTime 加载时间
 */
export function recordResourceLoad(resourceUrl, resourceType, loadTime) {
  metrics.resourceLoads.push({
    url: resourceUrl,
    type: resourceType,
    loadTime,
    timestamp: Date.now()
  });
}

/**
 * 记录API调用性能
 * @param {string} endpoint API端点
 * @param {string} method 请求方法
 * @param {number} duration 持续时间
 * @param {number} status 状态码
 */
export function recordApiCall(endpoint, method, duration, status) {
  metrics.apiCalls.push({
    endpoint,
    method,
    duration,
    status,
    timestamp: Date.now()
  });
}

/**
 * 获取当前性能指标
 * @returns {Object} 性能指标数据
 */
export function getPerformanceMetrics() {
  return { ...metrics };
}

/**
 * 分析性能数据
 * @returns {Object} 性能分析结果
 */
export function analyzePerformance() {
  const analysis = {
    coreMetrics: {
      fcp: metrics.FCP,
      lcp: metrics.LCP,
      fid: metrics.FID,
      cls: metrics.CLS,
      ttfb: metrics.TTFB
    },
    routePerformance: {
      averageTransitionTime: 0,
      slowestRoutes: []
    },
    resourcePerformance: {
      averageLoadTime: 0,
      slowestResources: []
    },
    apiPerformance: {
      averageResponseTime: 0,
      slowestEndpoints: []
    },
    trends: null
  };

  // 分析路由性能
  if (metrics.routeChanges.length > 0) {
    const totalTime = metrics.routeChanges.reduce((sum, change) => sum + change.duration, 0);
    analysis.routePerformance.averageTransitionTime = totalTime / metrics.routeChanges.length;
    analysis.routePerformance.slowestRoutes = [...metrics.routeChanges]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  // 分析资源加载性能
  if (metrics.resourceLoads.length > 0) {
    const totalTime = metrics.resourceLoads.reduce((sum, load) => sum + load.loadTime, 0);
    analysis.resourcePerformance.averageLoadTime = totalTime / metrics.resourceLoads.length;
    analysis.resourcePerformance.slowestResources = [...metrics.resourceLoads]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);
  }

  // 分析API调用性能
  if (metrics.apiCalls.length > 0) {
    const totalTime = metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    analysis.apiPerformance.averageResponseTime = totalTime / metrics.apiCalls.length;
    analysis.apiPerformance.slowestEndpoints = [...metrics.apiCalls]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  // 添加趋势分析
  analysis.trends = performanceStorage.analyzePerformanceTrends();

  return analysis;
}

// 导出性能监控工具
export default {
  initPerformanceMonitoring,
  recordRouteChange,
  recordResourceLoad,
  recordApiCall,
  getPerformanceMetrics,
  analyzePerformance
}; 