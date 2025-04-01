/**
 * 性能监控工具
 * 用于收集和报告Web Vitals指标
 */
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

// 用于报告Web Vitals指标的默认函数
const defaultReportHandler = ({ name, delta, id, navigationType }) => {
  // 将数据发送到控制台
  console.log(`性能指标 [${name}]: `, {
    value: delta,
    id: id,
    navigationType: navigationType
  });
  
  // 可以添加发送到分析服务的逻辑
  // 例如 Google Analytics 4
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }
};

/**
 * 初始化性能监控
 * @param {Function} reportHandler - 自定义报告处理函数
 */
export function initPerformanceMonitoring(reportHandler = defaultReportHandler) {
  // 监控累计布局偏移 (CLS)
  onCLS(reportHandler);
  
  // 监控首次输入延迟 (FID)
  onFID(reportHandler);
  
  // 监控最大内容绘制 (LCP)
  onLCP(reportHandler);
  
  // 监控首次内容绘制 (FCP)
  onFCP(reportHandler);
  
  // 监控首字节时间 (TTFB)
  onTTFB(reportHandler);
}

/**
 * 创建自定义性能标记并测量
 * @param {string} markName - 标记名称
 */
export function startMeasure(markName) {
  if (window.performance && window.performance.mark) {
    window.performance.mark(`${markName}_start`);
  }
}

/**
 * 结束性能测量并报告
 * @param {string} markName - 标记名称
 * @param {Function} reportHandler - 报告处理函数
 */
export function endMeasure(markName, reportHandler = defaultReportHandler) {
  if (window.performance && window.performance.mark && window.performance.measure) {
    // 创建结束标记
    window.performance.mark(`${markName}_end`);
    
    // 计算两个标记之间的测量值
    window.performance.measure(
      markName,
      `${markName}_start`,
      `${markName}_end`
    );
    
    // 获取测量结果
    const measures = window.performance.getEntriesByName(markName);
    const measure = measures[0];
    
    // 报告测量结果
    reportHandler({
      name: markName,
      delta: measure.duration,
      id: `custom_${Date.now()}`,
    });
    
    // 清理性能条目
    window.performance.clearMarks(`${markName}_start`);
    window.performance.clearMarks(`${markName}_end`);
    window.performance.clearMeasures(markName);
  }
}

/**
 * 监控资源加载性能
 * @param {Function} reportHandler - 报告处理函数
 */
export function monitorResourcePerformance(reportHandler = defaultReportHandler) {
  if (window.performance && window.performance.getEntriesByType) {
    // 获取资源加载信息
    const resources = window.performance.getEntriesByType('resource');
    
    // 分析关键资源
    const criticalResources = resources.filter(resource => {
      const url = resource.name.toLowerCase();
      return (
        url.endsWith('.js') || 
        url.endsWith('.css') || 
        url.includes('api') ||
        url.includes('fonts')
      );
    });
    
    // 报告关键资源性能
    criticalResources.forEach(resource => {
      reportHandler({
        name: 'ResourceTiming',
        delta: resource.responseEnd - resource.startTime,
        id: resource.name,
        resourceType: resource.initiatorType
      });
    });
  }
}

export default {
  initPerformanceMonitoring,
  startMeasure,
  endMeasure,
  monitorResourcePerformance
}; 