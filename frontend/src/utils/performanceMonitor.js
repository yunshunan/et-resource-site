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

// 标记初始化状态
let isInitialized = false;

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
  // 避免重复初始化
  if (isInitialized) return;
  
  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      console.warn('性能监控初始化失败: 不在浏览器环境中');
      return;
    }
    
    console.log('[Performance] 初始化性能监控');
    
    // 注册性能观察者
    initPerformanceObservers();
    
    // 计算TTFB (如果可用)
    try {
      if (performance.timing) {
        metrics.TTFB = performance.timing.responseStart - performance.timing.navigationStart;
      } else {
        metrics.TTFB = null;
      }
    } catch (e) {
      console.warn('无法计算TTFB指标:', e);
    }
    
    // 启动同步服务 (延迟启动，避免在应用初始化阶段干扰)
    setTimeout(() => {
      try {
        performanceSync.startSyncService();
      } catch (e) {
        console.warn('性能同步服务启动失败:', e);
      }
    }, 5000);
    
    // 定期保存和分析性能数据
    setInterval(() => {
      try {
        const analysis = analyzePerformance();
        
        // 保存到本地存储
        performanceStorage.savePerformanceData(analysis);
        
        // 同步到服务器
        performanceSync.queuePerformanceData(analysis);
        
        // 检查性能阈值
        const warnings = performanceStorage.checkThresholds(analysis.coreMetrics);
        if (warnings && warnings.length > 0) {
          handlePerformanceWarnings(warnings);
        }
      } catch (e) {
        console.warn('性能数据处理失败:', e);
      }
    }, 60000); // 每分钟执行一次
    
    isInitialized = true;
    
  } catch (error) {
    console.error('性能监控初始化失败:', error);
  }
}

/**
 * 初始化性能观察者
 */
function initPerformanceObservers() {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('PerformanceObserver API 不可用');
    return;
  }
  
  try {
    // 监控FCP
    if ('paint' in PerformanceObserver.supportedEntryTypes) {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.FCP = entry.startTime;
            console.log(`[Performance] FCP: ${metrics.FCP}ms`);
          }
        }
      }).observe({ entryTypes: ['paint'] });
    }
    
    // 监控LCP
    if ('largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          metrics.LCP = lastEntry.startTime;
          console.log(`[Performance] LCP: ${metrics.LCP}ms`);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    // 监控FID
    if ('first-input' in PerformanceObserver.supportedEntryTypes) {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const firstInput = entries[0];
          metrics.FID = firstInput.processingStart - firstInput.startTime;
          console.log(`[Performance] FID: ${metrics.FID}ms`);
        }
      }).observe({ entryTypes: ['first-input'] });
    }
    
    // 监控CLS
    if ('layout-shift' in PerformanceObserver.supportedEntryTypes) {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            metrics.CLS = clsValue;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
  } catch (error) {
    console.warn('性能观察者初始化失败:', error);
  }
}

/**
 * 处理性能警告
 * @param {Array} warnings 警告列表
 */
function handlePerformanceWarnings(warnings) {
  try {
    warnings.forEach(warning => {
      notificationService.sendPerformanceWarning(warning);
    });
  } catch (e) {
    console.warn('性能警告处理失败:', e);
  }
}

/**
 * 记录路由变化性能
 * @param {string} from 来源路由
 * @param {string} to 目标路由
 * @param {number} duration 持续时间
 */
export function recordRouteChange(from, to, duration) {
  try {
    metrics.routeChanges.push({
      from,
      to,
      duration,
      timestamp: Date.now()
    });
    
    // 限制记录数量
    if (metrics.routeChanges.length > 100) {
      metrics.routeChanges = metrics.routeChanges.slice(-100);
    }
  } catch (e) {
    console.warn('路由性能记录失败:', e);
  }
}

/**
 * 记录资源加载性能
 * @param {string} resourceUrl 资源URL
 * @param {string} resourceType 资源类型
 * @param {number} loadTime 加载时间
 */
export function recordResourceLoad(resourceUrl, resourceType, loadTime) {
  try {
    metrics.resourceLoads.push({
      url: resourceUrl,
      type: resourceType,
      loadTime,
      timestamp: Date.now()
    });
    
    // 限制记录数量
    if (metrics.resourceLoads.length > 100) {
      metrics.resourceLoads = metrics.resourceLoads.slice(-100);
    }
  } catch (e) {
    console.warn('资源加载性能记录失败:', e);
  }
}

/**
 * 记录API调用性能
 * @param {string} endpoint API端点
 * @param {string} method 请求方法
 * @param {number} duration 持续时间
 * @param {number} status 状态码
 */
export function recordApiCall(endpoint, method, duration, status) {
  try {
    metrics.apiCalls.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    });
    
    // 限制记录数量
    if (metrics.apiCalls.length > 100) {
      metrics.apiCalls = metrics.apiCalls.slice(-100);
    }
  } catch (e) {
    console.warn('API调用性能记录失败:', e);
  }
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
  try {
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
    try {
      analysis.trends = performanceStorage.analyzePerformanceTrends();
    } catch (e) {
      console.warn('性能趋势分析失败:', e);
      analysis.trends = null;
    }
    
    return analysis;
  } catch (error) {
    console.error('性能分析失败:', error);
    return {
      coreMetrics: {},
      routePerformance: {},
      resourcePerformance: {},
      apiPerformance: {},
      trends: null,
      error: error.message
    };
  }
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