// 存储配置
const storageConfig = {
  maxHistoryDays: 30, // 保留30天的历史数据
  maxResultsPerDay: 100, // 每天最多保存100条测试结果
  storageKey: 'compatibility_test_history'
}

// 获取存储的测试历史
const getTestHistory = () => {
  try {
    const history = localStorage.getItem(storageConfig.storageKey)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('获取测试历史失败:', error)
    return []
  }
}

// 保存测试结果
const saveTestResult = (result) => {
  try {
    const history = getTestHistory()
    const today = new Date().toISOString().split('T')[0]
    
    // 获取今天的测试结果
    const todayResults = history.filter(r => 
      new Date(r.timestamp).toISOString().split('T')[0] === today
    )
    
    // 如果今天的测试结果超过限制，删除最旧的
    if (todayResults.length >= storageConfig.maxResultsPerDay) {
      const oldestIndex = history.findIndex(r => 
        new Date(r.timestamp).toISOString().split('T')[0] === today
      )
      history.splice(oldestIndex, 1)
    }
    
    // 添加新的测试结果
    history.push(result)
    
    // 清理过期的历史数据
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - storageConfig.maxHistoryDays)
    
    const filteredHistory = history.filter(r => 
      new Date(r.timestamp) > cutoffDate
    )
    
    localStorage.setItem(storageConfig.storageKey, JSON.stringify(filteredHistory))
    return true
  } catch (error) {
    console.error('保存测试结果失败:', error)
    return false
  }
}

// 获取指定时间范围内的测试结果
const getTestResultsByDateRange = (startDate, endDate) => {
  try {
    const history = getTestHistory()
    return history.filter(r => {
      const resultDate = new Date(r.timestamp)
      return resultDate >= startDate && resultDate <= endDate
    })
  } catch (error) {
    console.error('获取时间范围内的测试结果失败:', error)
    return []
  }
}

// 获取测试结果统计信息
const getTestStatistics = (days = 7) => {
  try {
    const history = getTestHistory()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentResults = history.filter(r => 
      new Date(r.timestamp) > cutoffDate
    )
    
    const stats = {
      totalTests: recentResults.length,
      passedTests: 0,
      failedTests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      successRate: 0,
      dailyStats: {}
    }
    
    let totalResponseTime = 0
    let responseTimeCount = 0
    
    recentResults.forEach(result => {
      // 更新每日统计
      const date = new Date(result.timestamp).toISOString().split('T')[0]
      if (!stats.dailyStats[date]) {
        stats.dailyStats[date] = {
          total: 0,
          passed: 0,
          failed: 0,
          averageResponseTime: 0
        }
      }
      
      stats.dailyStats[date].total++
      if (result.success) {
        stats.passedTests++
        stats.dailyStats[date].passed++
      } else {
        stats.failedTests++
        stats.dailyStats[date].failed++
      }
      
      // 更新响应时间统计
      if (result.metrics?.averageResponseTime) {
        const responseTime = result.metrics.averageResponseTime
        totalResponseTime += responseTime
        responseTimeCount++
        
        stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime)
        stats.minResponseTime = Math.min(stats.minResponseTime, responseTime)
        
        stats.dailyStats[date].averageResponseTime = 
          (stats.dailyStats[date].averageResponseTime * (stats.dailyStats[date].total - 1) + responseTime) / 
          stats.dailyStats[date].total
      }
    })
    
    stats.averageResponseTime = responseTimeCount > 0 
      ? totalResponseTime / responseTimeCount 
      : 0
    
    stats.successRate = stats.totalTests > 0 
      ? (stats.passedTests / stats.totalTests) * 100 
      : 0
    
    return stats
  } catch (error) {
    console.error('获取测试统计信息失败:', error)
    return null
  }
}

// 导出测试历史数据
const exportTestHistory = (format = 'json') => {
  try {
    const history = getTestHistory()
    
    if (format === 'json') {
      return JSON.stringify(history, null, 2)
    } else if (format === 'csv') {
      const headers = ['timestamp', 'name', 'success', 'averageResponseTime', 'totalRequests', 'successfulRequests', 'failedRequests']
      const rows = history.map(result => [
        new Date(result.timestamp).toISOString(),
        result.name,
        result.success ? 'true' : 'false',
        result.metrics?.averageResponseTime || '',
        result.metrics?.totalRequests || '',
        result.metrics?.successfulRequests || '',
        result.metrics?.failedRequests || ''
      ])
      
      return [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
    }
    
    return null
  } catch (error) {
    console.error('导出测试历史失败:', error)
    return null
  }
}

// 清理过期的测试历史数据
const cleanupTestHistory = () => {
  try {
    const history = getTestHistory()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - storageConfig.maxHistoryDays)
    
    const filteredHistory = history.filter(r => 
      new Date(r.timestamp) > cutoffDate
    )
    
    localStorage.setItem(storageConfig.storageKey, JSON.stringify(filteredHistory))
    return true
  } catch (error) {
    console.error('清理测试历史失败:', error)
    return false
  }
}

export {
  storageConfig,
  getTestHistory,
  saveTestResult,
  getTestResultsByDateRange,
  getTestStatistics,
  exportTestHistory,
  cleanupTestHistory
} 