import { detectBrowser, getBrowserReport } from './browserDetector'
import performanceTests, { getTestSummary } from './performanceTests'

// 运行完整的兼容性测试
const runCompatibilityTests = async () => {
  const startTime = Date.now()
  
  // 获取浏览器报告
  const browserReport = getBrowserReport()
  
  // 收集性能测试结果
  const performanceResults = []
  
  // 执行内存测试
  if (performanceTests.memoryTest.enabled) {
    try {
      const result = performanceTests.memoryTest.execute()
      performanceResults.push({
        name: performanceTests.memoryTest.name,
        category: 'Memory',
        duration: 0,
        status: result.message ? 'skipped' : 'success',
        details: result
      })
    } catch (error) {
      performanceResults.push({
        name: performanceTests.memoryTest.name,
        category: 'Memory',
        status: 'failed',
        error: error.message
      })
    }
  }
  
  // 执行网络测试
  if (performanceTests.networkTest.enabled) {
    try {
      const result = await performanceTests.networkTest.execute('/api/test')
      performanceResults.push({
        name: performanceTests.networkTest.name,
        category: 'Network',
        duration: result.responseTime,
        status: result.error ? 'failed' : 'success',
        details: result
      })
    } catch (error) {
      performanceResults.push({
        name: performanceTests.networkTest.name,
        category: 'Network',
        status: 'failed',
        error: error.message
      })
    }
  }
  
  const performanceSummary = getTestSummary(performanceResults)
  
  // 生成完整报告
  const report = {
    timestamp: startTime,
    duration: Date.now() - startTime,
    browser: browserReport.browser,
    compatibility: browserReport.compatibility,
    performance: {
      results: performanceResults,
      summary: performanceSummary
    },
    issues: []
  }
  
  // 收集所有问题
  report.issues = [
    ...browserReport.compatibility.issues.map(issue => ({
      type: 'compatibility',
      ...issue
    })),
    ...performanceResults
      .filter(result => result.status === 'failed')
      .map(result => ({
        type: 'performance',
        category: result.category,
        feature: result.name,
        severity: result.error ? 'error' : 'warning',
        details: result.error || `性能未达标`
      }))
  ]
  
  return report
}

// 获取测试结果
const getTestResults = () => {
  return {
    browser: detectBrowser(),
    timestamp: Date.now()
  }
}

export {
  runCompatibilityTests,
  getTestResults
} 