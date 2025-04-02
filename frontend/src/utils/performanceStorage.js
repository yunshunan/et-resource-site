/**
 * 性能存储工具
 * 用于存储和分析性能数据
 */

// 本地存储键名
const STORAGE_KEY = 'et-performance-data';

// 性能阈值配置
const PERFORMANCE_THRESHOLDS = {
  FCP: 2000, // 首次内容绘制阈值(ms)
  LCP: 2500, // 最大内容绘制阈值(ms)
  FID: 100,  // 首次输入延迟阈值(ms)
  CLS: 0.1,  // 累积布局偏移阈值
  TTFB: 600, // 首字节时间阈值(ms)
  API_RESPONSE: 1000 // API响应时间阈值(ms)
};

/**
 * 保存性能数据到本地存储
 * @param {Object} data 性能数据
 */
export function savePerformanceData(data) {
  try {
    // 获取现有数据
    const existingData = getPerformanceData();
    
    // 添加新数据
    existingData.push({
      ...data,
      timestamp: Date.now()
    });
    
    // 限制存储数量，只保留最近100条记录
    const limitedData = existingData.slice(-100);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedData));
    
    return true;
  } catch (error) {
    console.error('保存性能数据失败:', error);
    return false;
  }
}

/**
 * 从本地存储获取性能数据
 * @returns {Array} 性能数据列表
 */
export function getPerformanceData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取性能数据失败:', error);
    return [];
  }
}

/**
 * 清除本地存储的性能数据
 * @returns {boolean} 是否成功清除
 */
export function clearPerformanceData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清除性能数据失败:', error);
    return false;
  }
}

/**
 * 检查性能指标是否超过阈值
 * @param {Object} metrics 性能指标
 * @returns {Array} 警告列表
 */
export function checkThresholds(metrics) {
  const warnings = [];
  
  if (metrics.fcp > PERFORMANCE_THRESHOLDS.FCP) {
    warnings.push({
      metric: 'FCP',
      value: metrics.fcp,
      threshold: PERFORMANCE_THRESHOLDS.FCP,
      message: `首次内容绘制时间(${metrics.fcp}ms)超过阈值(${PERFORMANCE_THRESHOLDS.FCP}ms)`
    });
  }
  
  if (metrics.lcp > PERFORMANCE_THRESHOLDS.LCP) {
    warnings.push({
      metric: 'LCP',
      value: metrics.lcp,
      threshold: PERFORMANCE_THRESHOLDS.LCP,
      message: `最大内容绘制时间(${metrics.lcp}ms)超过阈值(${PERFORMANCE_THRESHOLDS.LCP}ms)`
    });
  }
  
  if (metrics.fid > PERFORMANCE_THRESHOLDS.FID) {
    warnings.push({
      metric: 'FID',
      value: metrics.fid,
      threshold: PERFORMANCE_THRESHOLDS.FID,
      message: `首次输入延迟(${metrics.fid}ms)超过阈值(${PERFORMANCE_THRESHOLDS.FID}ms)`
    });
  }
  
  if (metrics.cls > PERFORMANCE_THRESHOLDS.CLS) {
    warnings.push({
      metric: 'CLS',
      value: metrics.cls,
      threshold: PERFORMANCE_THRESHOLDS.CLS,
      message: `累积布局偏移(${metrics.cls})超过阈值(${PERFORMANCE_THRESHOLDS.CLS})`
    });
  }
  
  if (metrics.ttfb > PERFORMANCE_THRESHOLDS.TTFB) {
    warnings.push({
      metric: 'TTFB',
      value: metrics.ttfb,
      threshold: PERFORMANCE_THRESHOLDS.TTFB,
      message: `首字节时间(${metrics.ttfb}ms)超过阈值(${PERFORMANCE_THRESHOLDS.TTFB}ms)`
    });
  }
  
  return warnings;
}

/**
 * 分析性能趋势
 * @returns {Object} 趋势分析结果
 */
export function analyzePerformanceTrends() {
  const data = getPerformanceData();
  
  // 如果数据不足，无法分析趋势
  if (data.length < 2) {
    return null;
  }
  
  // 获取最近7天的数据
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentData = data.filter(item => item.timestamp >= sevenDaysAgo);
  
  // 计算趋势
  const trends = {
    fcp: calculateTrend(recentData.map(item => item.coreMetrics.fcp)),
    lcp: calculateTrend(recentData.map(item => item.coreMetrics.lcp)),
    fid: calculateTrend(recentData.map(item => item.coreMetrics.fid)),
    cls: calculateTrend(recentData.map(item => item.coreMetrics.cls)),
    ttfb: calculateTrend(recentData.map(item => item.coreMetrics.ttfb)),
    apiResponseTime: calculateTrend(recentData.map(item => 
      item.apiPerformance?.averageResponseTime || 0
    ))
  };
  
  return trends;
}

/**
 * 计算趋势
 * @param {Array} values 数值数组
 * @returns {Object} 趋势信息
 */
function calculateTrend(values) {
  if (!values.length) return null;
  
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length < 2) return null;
  
  const first = validValues[0];
  const last = validValues[validValues.length - 1];
  const change = last - first;
  const percentChange = (change / first) * 100;
  
  return {
    first,
    last,
    change,
    percentChange,
    direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
  };
}

// 导出性能存储工具
export default {
  savePerformanceData,
  getPerformanceData,
  clearPerformanceData,
  checkThresholds,
  analyzePerformanceTrends,
  PERFORMANCE_THRESHOLDS
}; 