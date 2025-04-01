/**
 * 性能监控测试工具
 * 用于测试通知和同步功能的稳定性
 */

import * as performanceMonitor from './performanceMonitor'
import * as performanceSync from './performanceSync'
import * as notificationService from './notificationService'

// 测试配置
const testConfig = {
  // 测试持续时间（毫秒）
  duration: 300000, // 5分钟
  // 测试间隔（毫秒）
  interval: 60000, // 1分钟
  // 模拟性能数据
  mockData: {
    fcp: [1500, 2000, 2500, 3000],
    lcp: [2000, 2500, 3000, 3500],
    fid: [50, 100, 150, 200],
    cls: [0.05, 0.1, 0.15, 0.2]
  },
  // 边缘测试数据
  edgeCases: {
    fcp: [100, 5000, 10000, 30000],
    lcp: [200, 6000, 12000, 40000],
    fid: [10, 400, 800, 1000],
    cls: [0.01, 0.3, 0.5, 1.0]
  },
  // 并发测试配置
  concurrency: {
    maxConcurrent: 5,
    interval: 1000
  }
}

// 压力测试配置
const stressTestConfig = {
  duration: 300000, // 5分钟
  interval: 1000,   // 1秒
  maxConcurrent: 50,
  rampUpTime: 60000, // 1分钟
  rampDownTime: 60000, // 1分钟
  targetMetrics: {
    responseTime: 1000, // 目标响应时间(ms)
    errorRate: 0.01,    // 目标错误率
    throughput: 100     // 目标吞吐量(请求/秒)
  }
}

// 内存泄漏检测配置
const memoryLeakConfig = {
  duration: 600000, // 10分钟
  interval: 30000,  // 30秒
  threshold: 50,    // 内存增长阈值(MB)
  maxIterations: 20 // 最大迭代次数
}

// 测试日志
let testLogs = []
let testStats = {
  startTime: null,
  endTime: null,
  totalTests: 0,
  successfulTests: 0,
  failedTests: 0,
  testDuration: 0,
  notifications: {
    total: 0,
    success: 0,
    failed: 0
  },
  syncs: {
    total: 0,
    success: 0,
    failed: 0
  }
}

/**
 * 记录测试日志
 * @param {string} type 日志类型
 * @param {string} message 日志消息
 * @param {Object} data 相关数据
 */
function logTest(type, message, data = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data
  }
  testLogs.push(log)
  console.log(`[Performance Test] ${type}: ${message}`, data)
}

/**
 * 生成模拟性能数据
 * @param {boolean} isEdgeCase 是否生成边缘数据
 * @returns {Object} 性能数据
 */
function generateMockData(isEdgeCase = false) {
  const dataSource = isEdgeCase ? testConfig.edgeCases : testConfig.mockData
  const data = {
    coreMetrics: {
      fcp: dataSource.fcp[Math.floor(Math.random() * dataSource.fcp.length)],
      lcp: dataSource.lcp[Math.floor(Math.random() * dataSource.lcp.length)],
      fid: dataSource.fid[Math.floor(Math.random() * dataSource.fid.length)],
      cls: dataSource.cls[Math.floor(Math.random() * dataSource.cls.length)]
    }
  }
  return data
}

/**
 * 模拟网络错误
 * @returns {Promise} 模拟的网络错误
 */
async function simulateNetworkError() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('模拟网络错误'))
    }, 1000)
  })
}

/**
 * 模拟服务器错误
 * @param {number} statusCode HTTP状态码
 * @returns {Promise} 模拟的服务器错误
 */
async function simulateServerError(statusCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`模拟服务器错误: ${statusCode}`))
    }, 1000)
  })
}

/**
 * 测试通知功能
 */
async function testNotifications() {
  logTest('notification', '开始测试通知功能')
  
  // 测试控制台通知
  try {
    notificationService.configure({
      console: { enabled: true },
      email: { enabled: false },
      slack: { enabled: false }
    })
    const mockWarning = {
      metric: 'FCP',
      value: 2500,
      threshold: 1800,
      level: 'warning'
    }
    await notificationService.sendPerformanceWarning(mockWarning)
    testStats.notifications.success++
    logTest('notification', '控制台通知测试成功')
  } catch (error) {
    testStats.notifications.failed++
    logTest('notification', '控制台通知测试失败', { error: error.message })
  }
  
  // 测试邮件通知
  try {
    notificationService.configure({
      console: { enabled: false },
      email: { enabled: true, address: 'test@example.com' },
      slack: { enabled: false }
    })
    const mockCritical = {
      metric: 'LCP',
      value: 4500,
      threshold: 4000,
      level: 'critical'
    }
    await notificationService.sendPerformanceWarning(mockCritical)
    testStats.notifications.success++
    logTest('notification', '邮件通知测试成功')
  } catch (error) {
    testStats.notifications.failed++
    logTest('notification', '邮件通知测试失败', { error: error.message })
  }
  
  // 测试Slack通知
  try {
    notificationService.configure({
      console: { enabled: false },
      email: { enabled: false },
      slack: { enabled: true, webhook: 'https://hooks.slack.com/test' }
    })
    const mockWarning = {
      metric: 'FID',
      value: 250,
      threshold: 300,
      level: 'warning'
    }
    await notificationService.sendPerformanceWarning(mockWarning)
    testStats.notifications.success++
    logTest('notification', 'Slack通知测试成功')
  } catch (error) {
    testStats.notifications.failed++
    logTest('notification', 'Slack通知测试失败', { error: error.message })
  }
  
  testStats.notifications.total = testStats.notifications.success + testStats.notifications.failed
}

/**
 * 测试数据同步功能
 */
async function testSync() {
  logTest('sync', '开始测试数据同步功能')
  
  try {
    // 生成测试数据
    const testData = generateMockData()
    
    // 添加到同步队列
    performanceSync.queuePerformanceData(testData)
    logTest('sync', '测试数据已添加到同步队列', { data: testData })
    
    // 获取同步状态
    const status = performanceSync.getSyncStatus()
    logTest('sync', '当前同步状态', { status })
    
    // 触发同步
    await performanceSync.triggerSync()
    testStats.syncs.success++
    logTest('sync', '同步触发成功')
    
    // 再次检查状态
    const newStatus = performanceSync.getSyncStatus()
    logTest('sync', '同步后状态', { status: newStatus })
  } catch (error) {
    testStats.syncs.failed++
    logTest('sync', '同步测试失败', { error: error.message })
  }
  
  testStats.syncs.total = testStats.syncs.success + testStats.syncs.failed
}

/**
 * 测试边缘情况
 */
async function testEdgeCases() {
  logTest('test', '开始测试边缘情况')
  
  // 测试极端性能数据
  try {
    const edgeData = generateMockData(true)
    performanceSync.queuePerformanceData(edgeData)
    logTest('test', '边缘性能数据测试', { data: edgeData })
  } catch (error) {
    logTest('test', '边缘性能数据测试失败', { error: error.message })
  }
  
  // 测试网络错误
  try {
    await simulateNetworkError()
    logTest('test', '网络错误测试失败')
  } catch (error) {
    logTest('test', '网络错误测试成功', { error: error.message })
  }
  
  // 测试服务器错误
  try {
    await simulateServerError(500)
    logTest('test', '服务器错误测试失败')
  } catch (error) {
    logTest('test', '服务器错误测试成功', { error: error.message })
  }
}

/**
 * 测试并发情况
 */
async function testConcurrency() {
  logTest('test', '开始测试并发情况')
  
  const promises = []
  for (let i = 0; i < testConfig.concurrency.maxConcurrent; i++) {
    promises.push(
      new Promise(async (resolve) => {
        const testData = generateMockData()
        try {
          await performanceSync.queuePerformanceData(testData)
          logTest('test', `并发测试 ${i + 1} 成功`, { data: testData })
          resolve(true)
        } catch (error) {
          logTest('test', `并发测试 ${i + 1} 失败`, { error: error.message })
          resolve(false)
        }
      })
    )
    await new Promise(resolve => setTimeout(resolve, testConfig.concurrency.interval))
  }
  
  const results = await Promise.all(promises)
  const successCount = results.filter(Boolean).length
  logTest('test', '并发测试完成', { 
    total: results.length,
    success: successCount,
    failed: results.length - successCount
  })
}

/**
 * 生成测试报告
 * @returns {Object} 测试报告
 */
function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    duration: testStats.endTime - testStats.startTime,
    stats: testStats,
    summary: {
      notifications: {
        successRate: (testStats.notifications.success / testStats.notifications.total * 100).toFixed(2) + '%',
        total: testStats.notifications.total,
        success: testStats.notifications.success,
        failed: testStats.notifications.failed
      },
      syncs: {
        successRate: (testStats.syncs.success / testStats.syncs.total * 100).toFixed(2) + '%',
        total: testStats.syncs.total,
        success: testStats.syncs.success,
        failed: testStats.syncs.failed
      }
    },
    logs: testLogs
  }
  
  return report
}

/**
 * 运行压力测试
 */
async function runStressTest() {
  logTest('stress', '开始压力测试')
  
  const startTime = Date.now()
  const metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    memoryUsage: []
  }
  
  // 创建并发请求
  const requests = Array(stressTestConfig.maxConcurrent).fill().map(() => 
    makeConcurrentRequest(metrics)
  )
  
  // 定期记录内存使用情况
  const memoryInterval = setInterval(() => {
    const usage = process.memoryUsage()
    metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    })
  }, stressTestConfig.interval)
  
  // 等待测试完成
  await new Promise(resolve => setTimeout(resolve, stressTestConfig.duration))
  
  // 清理
  clearInterval(memoryInterval)
  
  // 计算测试结果
  const results = calculateStressTestResults(metrics)
  
  // 验证结果
  const validation = validateStressTestResults(results)
  
  logTest('stress', '压力测试完成', {
    results,
    validation
  })
  
  return {
    metrics,
    results,
    validation
  }
}

/**
 * 执行并发请求
 * @param {Object} metrics 测试指标
 */
async function makeConcurrentRequest(metrics) {
  while (true) {
    const startTime = Date.now()
    try {
      // 模拟API请求
      await simulateApiRequest()
      metrics.successfulRequests++
      const responseTime = Date.now() - startTime
      metrics.totalResponseTime += responseTime
      metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime)
      metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime)
    } catch (error) {
      metrics.failedRequests++
    }
    metrics.totalRequests++
  }
}

/**
 * 模拟API请求
 */
async function simulateApiRequest() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
  
  // 模拟随机错误
  if (Math.random() < 0.01) {
    throw new Error('模拟请求失败')
  }
}

/**
 * 计算压力测试结果
 * @param {Object} metrics 测试指标
 * @returns {Object} 测试结果
 */
function calculateStressTestResults(metrics) {
  const duration = (Date.now() - metrics.memoryUsage[0].timestamp) / 1000
  const throughput = metrics.totalRequests / duration
  const errorRate = metrics.failedRequests / metrics.totalRequests
  const avgResponseTime = metrics.totalResponseTime / metrics.totalRequests
  
  return {
    throughput,
    errorRate,
    avgResponseTime,
    maxResponseTime: metrics.maxResponseTime,
    minResponseTime: metrics.minResponseTime,
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    memoryUsage: metrics.memoryUsage
  }
}

/**
 * 验证压力测试结果
 * @param {Object} results 测试结果
 * @returns {Object} 验证结果
 */
function validateStressTestResults(results) {
  const validation = {
    success: true,
    details: {}
  }
  
  // 验证响应时间
  if (results.avgResponseTime > stressTestConfig.targetMetrics.responseTime) {
    validation.success = false
    validation.details.responseTime = {
      actual: results.avgResponseTime,
      target: stressTestConfig.targetMetrics.responseTime,
      message: '平均响应时间超过目标值'
    }
  }
  
  // 验证错误率
  if (results.errorRate > stressTestConfig.targetMetrics.errorRate) {
    validation.success = false
    validation.details.errorRate = {
      actual: results.errorRate,
      target: stressTestConfig.targetMetrics.errorRate,
      message: '错误率超过目标值'
    }
  }
  
  // 验证吞吐量
  if (results.throughput < stressTestConfig.targetMetrics.throughput) {
    validation.success = false
    validation.details.throughput = {
      actual: results.throughput,
      target: stressTestConfig.targetMetrics.throughput,
      message: '吞吐量低于目标值'
    }
  }
  
  return validation
}

/**
 * 运行内存泄漏检测
 */
async function runMemoryLeakTest() {
  logTest('memory', '开始内存泄漏检测')
  
  const startTime = Date.now()
  const metrics = {
    iterations: [],
    memoryUsage: []
  }
  
  for (let i = 0; i < memoryLeakConfig.maxIterations; i++) {
    const iterationStart = Date.now()
    
    // 执行测试迭代
    await runTestIteration()
    
    // 记录内存使用情况
    const usage = process.memoryUsage()
    metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    })
    
    // 计算内存增长
    if (i > 0) {
      const growth = (usage.heapUsed - metrics.memoryUsage[i - 1].heapUsed) / (1024 * 1024)
      metrics.iterations.push({
        iteration: i + 1,
        duration: Date.now() - iterationStart,
        memoryGrowth: growth
      })
    }
    
    // 检查是否超过阈值
    if (i > 0 && metrics.iterations[i - 1].memoryGrowth > memoryLeakConfig.threshold) {
      logTest('memory', '检测到可能的内存泄漏', {
        iteration: i + 1,
        growth: metrics.iterations[i - 1].memoryGrowth
      })
    }
    
    // 等待下一次迭代
    await new Promise(resolve => setTimeout(resolve, memoryLeakConfig.interval))
  }
  
  // 分析内存使用趋势
  const analysis = analyzeMemoryUsage(metrics.memoryUsage)
  
  logTest('memory', '内存泄漏检测完成', {
    metrics,
    analysis
  })
  
  return {
    metrics,
    analysis
  }
}

/**
 * 执行测试迭代
 */
async function runTestIteration() {
  // 模拟用户操作
  await simulateUserActions()
  
  // 触发垃圾回收
  if (global.gc) {
    global.gc()
  }
}

/**
 * 模拟用户操作
 */
async function simulateUserActions() {
  // 模拟页面导航
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟数据加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟用户交互
  await new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * 分析内存使用趋势
 * @param {Array} memoryUsage 内存使用记录
 * @returns {Object} 分析结果
 */
function analyzeMemoryUsage(memoryUsage) {
  const analysis = {
    hasLeak: false,
    growthRate: 0,
    details: {}
  }
  
  // 计算内存增长率
  const growths = memoryUsage.slice(1).map((usage, i) => 
    (usage.heapUsed - memoryUsage[i].heapUsed) / (1024 * 1024)
  )
  
  analysis.growthRate = growths.reduce((a, b) => a + b, 0) / growths.length
  
  // 判断是否存在内存泄漏
  analysis.hasLeak = analysis.growthRate > memoryLeakConfig.threshold
  
  // 记录详细信息
  analysis.details = {
    averageGrowth: analysis.growthRate,
    maxGrowth: Math.max(...growths),
    minGrowth: Math.min(...growths),
    totalGrowth: growths.reduce((a, b) => a + b, 0)
  }
  
  return analysis
}

/**
 * 运行完整测试
 */
export async function runPerformanceTests() {
  testStats.startTime = Date.now()
  logTest('test', '开始性能监控系统测试')
  
  // 运行基础测试
  await testNotifications()
  await testSync()
  await testEdgeCases()
  await testConcurrency()
  
  // 运行压力测试
  const stressTestResults = await runStressTest()
  
  // 运行内存泄漏检测
  const memoryLeakResults = await runMemoryLeakTest()
  
  // 定期生成测试数据
  const testInterval = setInterval(() => {
    const testData = generateMockData()
    performanceSync.queuePerformanceData(testData)
    logTest('test', '生成新的测试数据', { data: testData })
  }, testConfig.interval)
  
  // 测试结束后清理
  setTimeout(() => {
    clearInterval(testInterval)
    testStats.endTime = Date.now()
    const report = generateTestReport()
    report.stressTest = stressTestResults
    report.memoryLeakTest = memoryLeakResults
    logTest('test', '测试完成', { report })
  }, testConfig.duration)
  
  return testLogs
}

/**
 * 获取测试日志
 * @returns {Array} 测试日志
 */
export function getTestLogs() {
  return testLogs
}

/**
 * 获取测试报告
 * @returns {Object} 测试报告
 */
export function getTestReport() {
  return generateTestReport()
}

/**
 * 清除测试日志
 */
export function clearTestLogs() {
  testLogs = []
  testStats = {
    startTime: null,
    endTime: null,
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    testDuration: 0,
    notifications: {
      total: 0,
      success: 0,
      failed: 0
    },
    syncs: {
      total: 0,
      success: 0,
      failed: 0
    }
  }
} 