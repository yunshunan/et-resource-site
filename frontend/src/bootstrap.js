/**
 * 应用初始化辅助函数
 * 确保所有必要条件满足后再初始化Vue应用
 */

// 标记初始化状态
export const initState = {
  resourcesLoaded: false,
  performanceInitialized: false,
  domReady: false
}

/**
 * 等待DOM就绪
 * @returns {Promise} 当DOM就绪时resolve的Promise
 */
export const waitForDomReady = () => {
  return new Promise(resolve => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('[Bootstrap] DOM已就绪')
      initState.domReady = true
      resolve()
    } else {
      console.log('[Bootstrap] 等待DOM就绪...')
      window.addEventListener('DOMContentLoaded', () => {
        console.log('[Bootstrap] DOM事件触发')
        initState.domReady = true
        resolve()
      })
    }
  })
}

/**
 * 初始化性能监控
 * @returns {Promise} 当性能监控初始化完成时resolve的Promise
 */
export const initPerformanceMonitoring = () => {
  return new Promise(resolve => {
    // 添加性能标记
    if (window.performance && window.performance.mark) {
      window.performance.mark('app-init-start')
    }
    
    try {
      // 如果没有依赖外部性能监控，简单地标记为完成即可
      console.log('[Bootstrap] 性能监控初始化完成')
      initState.performanceInitialized = true
      resolve()
    } catch (error) {
      console.warn('[Bootstrap] 性能监控初始化失败:', error)
      // 即使失败也继续，不要阻塞应用初始化
      initState.performanceInitialized = false
      resolve()
    }
  })
}

/**
 * 预加载必要资源
 * @returns {Promise} 当资源加载完成时resolve的Promise
 */
export const preloadResources = () => {
  return new Promise(resolve => {
    // 这里可以添加各种资源的预加载逻辑
    // 例如：字体、关键图片等
    
    console.log('[Bootstrap] 资源预加载完成')
    initState.resourcesLoaded = true
    resolve()
  })
}

/**
 * 初始化应用
 * 执行所有必要的启动步骤
 * @returns {Promise} 当应用初始化完成时resolve的Promise
 */
export const initializeApp = async () => {
  console.log('[Bootstrap] 开始初始化应用...')
  
  // 并行执行初始化任务
  await Promise.all([
    waitForDomReady(),
    initPerformanceMonitoring(),
    preloadResources()
  ])
  
  console.log('[Bootstrap] 应用初始化完成，准备挂载Vue实例')
  
  // 添加性能标记
  if (window.performance && window.performance.mark) {
    window.performance.mark('app-init-end')
    window.performance.measure('app-initialization', 'app-init-start', 'app-init-end')
    
    const measures = window.performance.getEntriesByName('app-initialization')
    if (measures.length > 0) {
      console.log(`[Bootstrap] 应用初始化耗时: ${measures[0].duration.toFixed(2)}ms`)
    }
  }
  
  return initState
}

export default {
  initState,
  waitForDomReady,
  initPerformanceMonitoring,
  preloadResources,
  initializeApp
} 