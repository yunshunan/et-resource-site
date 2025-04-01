#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { performanceTest } = require('../src/utils/performanceTest')

// 测试配置
const config = {
  // 测试阈值配置
  thresholds: {
    notifications: {
      successRate: 90, // 通知成功率阈值
      maxLatency: 1000 // 最大延迟(ms)
    },
    syncs: {
      successRate: 95, // 同步成功率阈值
      maxLatency: 2000 // 最大延迟(ms)
    },
    performance: {
      fcp: 1800, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100,  // First Input Delay
      cls: 0.1   // Cumulative Layout Shift
    }
  },
  // 测试报告配置
  report: {
    outputDir: path.join(__dirname, '../reports/performance'),
    filename: `performance-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  }
}

/**
 * 运行性能测试
 */
async function runTests() {
  console.log('开始性能测试...')
  
  try {
    // 运行测试
    const report = await performanceTest.runPerformanceTests()
    
    // 保存测试报告
    saveReport(report)
    
    // 验证测试结果
    const validationResult = validateResults(report)
    
    // 输出测试结果
    console.log('\n测试结果:')
    console.log(JSON.stringify(validationResult, null, 2))
    
    // 如果测试失败，退出码为1
    if (!validationResult.success) {
      process.exit(1)
    }
    
  } catch (error) {
    console.error('测试执行失败:', error)
    process.exit(1)
  }
}

/**
 * 保存测试报告
 * @param {Object} report 测试报告
 */
function saveReport(report) {
  // 确保输出目录存在
  if (!fs.existsSync(config.report.outputDir)) {
    fs.mkdirSync(config.report.outputDir, { recursive: true })
  }
  
  // 保存报告文件
  const reportPath = path.join(config.report.outputDir, config.report.filename)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`测试报告已保存: ${reportPath}`)
}

/**
 * 验证测试结果
 * @param {Object} report 测试报告
 * @returns {Object} 验证结果
 */
function validateResults(report) {
  const result = {
    success: true,
    details: {
      notifications: validateNotifications(report.summary.notifications),
      syncs: validateSyncs(report.summary.syncs),
      performance: validatePerformance(report.stats.performance)
    }
  }
  
  // 检查是否有任何验证失败
  result.success = Object.values(result.details).every(detail => detail.success)
  
  return result
}

/**
 * 验证通知结果
 * @param {Object} notifications 通知统计
 * @returns {Object} 验证结果
 */
function validateNotifications(notifications) {
  const successRate = parseFloat(notifications.successRate)
  const result = {
    success: true,
    message: '通知测试通过',
    details: {
      successRate,
      threshold: config.thresholds.notifications.successRate
    }
  }
  
  if (successRate < config.thresholds.notifications.successRate) {
    result.success = false
    result.message = `通知成功率(${successRate}%)低于阈值(${config.thresholds.notifications.successRate}%)`
  }
  
  return result
}

/**
 * 验证同步结果
 * @param {Object} syncs 同步统计
 * @returns {Object} 验证结果
 */
function validateSyncs(syncs) {
  const successRate = parseFloat(syncs.successRate)
  const result = {
    success: true,
    message: '同步测试通过',
    details: {
      successRate,
      threshold: config.thresholds.syncs.successRate
    }
  }
  
  if (successRate < config.thresholds.syncs.successRate) {
    result.success = false
    result.message = `同步成功率(${successRate}%)低于阈值(${config.thresholds.syncs.successRate}%)`
  }
  
  return result
}

/**
 * 验证性能指标
 * @param {Object} performance 性能指标
 * @returns {Object} 验证结果
 */
function validatePerformance(performance) {
  const result = {
    success: true,
    message: '性能指标测试通过',
    details: {}
  }
  
  // 验证每个性能指标
  for (const [metric, threshold] of Object.entries(config.thresholds.performance)) {
    const value = performance[metric]
    result.details[metric] = {
      value,
      threshold,
      success: value <= threshold
    }
    
    if (value > threshold) {
      result.success = false
      result.message = `${metric}(${value})超过阈值(${threshold})`
    }
  }
  
  return result
}

// 运行测试
runTests() 