// 极端场景测试配置
const extremeScenarios = {
  scenarios: [
    {
      name: '高并发负载测试',
      description: '模拟大量并发请求和操作',
      test: async () => {
        const startTime = performance.now()
        const results = {
          success: true,
          metrics: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            maxResponseTime: 0,
            minResponseTime: Infinity
          }
        }

        // 创建并发请求
        const requests = Array(100).fill().map(() => 
          fetch('/api/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
          })
        )

        try {
          const responses = await Promise.all(requests)
          results.metrics.totalRequests = requests.length
          results.metrics.successfulRequests = responses.filter(r => r.ok).length
          results.metrics.failedRequests = responses.filter(r => !r.ok).length
        } catch (error) {
          results.success = false
          results.error = error.message
        }

        results.metrics.averageResponseTime = (performance.now() - startTime) / requests.length
        return results
      },
      threshold: {
        averageResponseTime: 1000, // ms
        successRate: 0.95
      }
    },
    {
      name: '网络延迟测试',
      description: '模拟高延迟网络环境下的性能表现',
      test: async () => {
        const startTime = performance.now()
        const results = {
          success: true,
          metrics: {
            latency: 0,
            timeoutCount: 0,
            successCount: 0
          }
        }

        // 模拟网络延迟
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        
        try {
          // 测试不同延迟下的响应
          const delays = [100, 500, 1000, 2000]
          for (const d of delays) {
            await delay(d)
            const response = await fetch('/api/test')
            if (response.ok) {
              results.metrics.successCount++
            } else {
              results.metrics.timeoutCount++
            }
          }
          
          results.metrics.latency = (performance.now() - startTime) / delays.length
        } catch (error) {
          results.success = false
          results.error = error.message
        }

        return results
      },
      threshold: {
        maxLatency: 2000, // ms
        successRate: 0.8
      }
    },
    {
      name: '内存压力测试',
      description: '测试在内存压力下的性能表现',
      test: async () => {
        const startTime = performance.now()
        const results = {
          success: true,
          metrics: {
            initialMemory: 0,
            finalMemory: 0,
            memoryGrowth: 0,
            operationsPerSecond: 0
          }
        }

        try {
          // 记录初始内存使用
          results.metrics.initialMemory = performance.memory?.usedJSHeapSize || 0

          // 创建大量对象
          const objects = []
          for (let i = 0; i < 1000000; i++) {
            objects.push({
              id: i,
              data: Array(100).fill('test').join(''),
              timestamp: Date.now()
            })
          }

          // 执行一些操作
          const operations = objects.map(obj => 
            Promise.resolve(obj.id * obj.timestamp)
          )

          await Promise.all(operations)

          // 记录最终内存使用
          results.metrics.finalMemory = performance.memory?.usedJSHeapSize || 0
          results.metrics.memoryGrowth = results.metrics.finalMemory - results.metrics.initialMemory
          results.metrics.operationsPerSecond = objects.length / ((performance.now() - startTime) / 1000)

          // 清理
          objects.length = 0
        } catch (error) {
          results.success = false
          results.error = error.message
        }

        return results
      },
      threshold: {
        maxMemoryGrowth: 100 * 1024 * 1024, // 100MB
        minOperationsPerSecond: 1000
      }
    },
    {
      name: '边缘数据测试',
      description: '测试处理边界值和异常数据的情况',
      test: async () => {
        const startTime = performance.now()
        const results = {
          success: true,
          metrics: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            averageProcessingTime: 0
          }
        }

        const testCases = [
          { input: null, expected: 'error' },
          { input: undefined, expected: 'error' },
          { input: '', expected: 'empty' },
          { input: ' '.repeat(1000), expected: 'trimmed' },
          { input: { length: 1000000 }, expected: 'truncated' },
          { input: new Array(1000000).fill('test'), expected: 'array' }
        ]

        try {
          for (const testCase of testCases) {
            results.metrics.totalTests++
            const start = performance.now()

            try {
              const response = await fetch('/api/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase.input)
              })

              if (response.ok) {
                results.metrics.passedTests++
              } else {
                results.metrics.failedTests++
              }
            } catch (error) {
              results.metrics.failedTests++
            }

            results.metrics.averageProcessingTime += performance.now() - start
          }

          results.metrics.averageProcessingTime /= testCases.length
        } catch (error) {
          results.success = false
          results.error = error.message
        }

        return results
      },
      threshold: {
        successRate: 0.8,
        maxProcessingTime: 1000 // ms
      }
    }
  ]
}

// 运行极端场景测试
const runExtremeScenarios = async () => {
  const results = []
  
  for (const scenario of extremeScenarios.scenarios) {
    try {
      const result = await scenario.test()
      results.push({
        name: scenario.name,
        description: scenario.description,
        result,
        threshold: scenario.threshold
      })
    } catch (error) {
      results.push({
        name: scenario.name,
        description: scenario.description,
        error: error.message
      })
    }
  }
  
  return results
}

// 生成测试报告
const generateExtremeTestReport = (results) => {
  const report = {
    timestamp: Date.now(),
    totalScenarios: results.length,
    passedScenarios: 0,
    failedScenarios: 0,
    scenarios: results,
    summary: {
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    }
  }

  let totalResponseTime = 0
  let responseTimeCount = 0

  results.forEach(scenario => {
    if (scenario.result?.success) {
      report.passedScenarios++
    } else {
      report.failedScenarios++
    }

    if (scenario.result?.metrics) {
      const metrics = scenario.result.metrics
      
      if (metrics.averageResponseTime) {
        totalResponseTime += metrics.averageResponseTime
        responseTimeCount++
        report.summary.maxResponseTime = Math.max(
          report.summary.maxResponseTime,
          metrics.averageResponseTime
        )
        report.summary.minResponseTime = Math.min(
          report.summary.minResponseTime,
          metrics.averageResponseTime
        )
      }

      if (metrics.totalRequests) {
        report.summary.totalRequests += metrics.totalRequests
        report.summary.successfulRequests += metrics.successfulRequests
        report.summary.failedRequests += metrics.failedRequests
      }
    }
  })

  report.summary.averageResponseTime = responseTimeCount > 0 
    ? totalResponseTime / responseTimeCount 
    : 0

  return report
}

export {
  extremeScenarios,
  runExtremeScenarios,
  generateExtremeTestReport
} 