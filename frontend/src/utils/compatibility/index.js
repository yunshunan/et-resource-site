import { detectBrowser, getBrowserReport } from './browserDetector'
import { runPerformanceTests, getTestSummary } from './performanceTests'

// 运行完整的兼容性测试
const runCompatibilityTests = async () => {
  const startTime = Date.now()
  
  // 获取浏览器报告
  const browserReport = getBrowserReport()
  
  // 运行性能测试
  const performanceResults = await runPerformanceTests()
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
      .filter(result => !result.passed)
      .map(result => ({
        type: 'performance',
        category: result.category,
        feature: result.name,
        severity: result.error ? 'error' : 'warning',
        details: result.error || `性能未达标 (${result.duration}ms > ${result.threshold}ms)`
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