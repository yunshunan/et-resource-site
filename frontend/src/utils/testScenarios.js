import { performance } from 'perf_hooks'

// 测试场景配置
const errorScenarioCombinations = {
  scenarios: [
    {
      name: 'network_high_concurrency',
      conditions: {
        network: {
          latency: [100, 500, 1000],
          errorRate: [0.01, 0.05, 0.1]
        },
        concurrency: {
          users: [50, 100, 200],
          rampUp: [10, 30, 60]
        }
      },
      duration: 300000,
      metrics: ['responseTime', 'errorRate', 'throughput']
    },
    {
      name: 'resource_exhaustion',
      conditions: {
        memory: {
          limit: [512, 1024, 2048],
          growth: [0.1, 0.2, 0.3]
        },
        cpu: {
          load: [0.7, 0.8, 0.9],
          duration: [60000, 120000, 180000]
        }
      },
      duration: 600000,
      metrics: ['memoryUsage', 'cpuUsage', 'gcStats']
    }
  ]
}

// 测试结果存储
const testResults = {
  current: null,
  history: []
}

// 模拟网络延迟
const simulateNetworkLatency = async (latency) => {
  await new Promise(resolve => setTimeout(resolve, latency))
}

// 模拟网络错误
const simulateNetworkError = (errorRate) => {
  return Math.random() < errorRate
}

// 模拟高并发请求
const simulateConcurrentRequests = async (users, rampUp) => {
  const requests = []
  const startTime = performance.now()
  
  for (let i = 0; i < users; i++) {
    const delay = (rampUp * 1000 * i) / users
    requests.push(
      new Promise(resolve => {
        setTimeout(async () => {
          const start = performance.now()
          try {
            // 模拟API请求
            await simulateNetworkLatency(100 + Math.random() * 400)
            resolve({
              success: true,
              duration: performance.now() - start
            })
          } catch (error) {
            resolve({
              success: false,
              error: error.message,
              duration: performance.now() - start
            })
          }
        }, delay)
      })
    )
  }
  
  return Promise.all(requests)
}

// 模拟资源耗尽
const simulateResourceExhaustion = async (memoryLimit, growth, duration) => {
  const startTime = performance.now()
  const memoryUsage = []
  const gcStats = []
  
  while (performance.now() - startTime < duration) {
    // 模拟内存增长
    const currentMemory = process.memoryUsage().heapUsed
    memoryUsage.push({
      timestamp: Date.now(),
      value: currentMemory
    })
    
    // 模拟GC
    if (global.gc) {
      global.gc()
      gcStats.push({
        timestamp: Date.now(),
        value: process.memoryUsage().heapUsed
      })
    }
    
    // 检查是否超过内存限制
    if (currentMemory > memoryLimit * 1024 * 1024) {
      throw new Error('Memory limit exceeded')
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return {
    memoryUsage,
    gcStats
  }
}

// 运行测试场景
const runTestScenario = async (scenario) => {
  const startTime = Date.now()
  const results = {
    scenario: scenario.name,
    startTime,
    endTime: null,
    metrics: {},
    errors: []
  }
  
  try {
    if (scenario.name === 'network_high_concurrency') {
      const { network, concurrency } = scenario.conditions
      
      for (const latency of network.latency) {
        for (const errorRate of network.errorRate) {
          for (const users of concurrency.users) {
            for (const rampUp of concurrency.rampUp) {
              const requests = await simulateConcurrentRequests(users, rampUp)
              
              results.metrics[`latency_${latency}_error_${errorRate}_users_${users}_rampup_${rampUp}`] = {
                totalRequests: requests.length,
                successfulRequests: requests.filter(r => r.success).length,
                failedRequests: requests.filter(r => !r.success).length,
                avgResponseTime: requests.reduce((sum, r) => sum + r.duration, 0) / requests.length,
                maxResponseTime: Math.max(...requests.map(r => r.duration)),
                minResponseTime: Math.min(...requests.map(r => r.duration))
              }
            }
          }
        }
      }
    } else if (scenario.name === 'resource_exhaustion') {
      const { memory, cpu } = scenario.conditions
      
      for (const limit of memory.limit) {
        for (const growth of memory.growth) {
          for (const load of cpu.load) {
            for (const duration of cpu.duration) {
              const resourceResults = await simulateResourceExhaustion(limit, growth, duration)
              
              results.metrics[`memory_${limit}_growth_${growth}_cpu_${load}_duration_${duration}`] = {
                memoryUsage: resourceResults.memoryUsage,
                gcStats: resourceResults.gcStats
              }
            }
          }
        }
      }
    }
    
    results.endTime = Date.now()
    results.duration = results.endTime - startTime
    
    // 保存测试结果
    testResults.current = results
    testResults.history.push(results)
    
    return results
  } catch (error) {
    results.errors.push(error.message)
    results.endTime = Date.now()
    results.duration = results.endTime - startTime
    
    // 保存错误结果
    testResults.current = results
    testResults.history.push(results)
    
    throw error
  }
}

// 获取测试结果
const getTestResults = () => {
  return {
    current: testResults.current,
    history: testResults.history
  }
}

// 清理历史数据
const cleanupTestResults = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const now = Date.now()
  testResults.history = testResults.history.filter(result => 
    now - result.endTime < maxAge
  )
}

export {
  errorScenarioCombinations,
  runTestScenario,
  getTestResults,
  cleanupTestResults
} 