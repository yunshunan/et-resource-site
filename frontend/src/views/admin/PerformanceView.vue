<template>
  <div class="admin-performance-view">
    <div class="header">
      <h1>系统性能监控</h1>
      <div class="controls">
        <button 
          @click="startMonitoring" 
          :disabled="isMonitoring"
          class="btn btn-primary"
        >
          开始监控
        </button>
        <button 
          @click="stopMonitoring" 
          :disabled="!isMonitoring"
          class="btn btn-danger"
        >
          停止监控
        </button>
        <div class="export-controls">
          <button 
            @click="exportReport('html')" 
            :disabled="!hasResults"
            class="btn btn-secondary"
          >
            导出HTML报告
          </button>
          <button 
            @click="exportReport('pdf')" 
            :disabled="!hasResults"
            class="btn btn-secondary"
          >
            导出PDF报告
          </button>
        </div>
      </div>
    </div>

    <div class="monitoring-content">
      <div class="browser-info-section">
        <h2>浏览器兼容性</h2>
        <div v-if="browserInfo" class="info-card">
          <div class="info-item">
            <span class="label">浏览器：</span>
            <span class="value">{{ browserInfo.name }} {{ browserInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="label">平台：</span>
            <span class="value">{{ browserInfo.platform }}</span>
          </div>
          <div class="info-item">
            <span class="label">兼容性得分：</span>
            <span class="value" :class="getScoreClass(browserInfo.score)">
              {{ browserInfo.score }}%
            </span>
          </div>
        </div>
      </div>

      <div class="performance-section">
        <h2>性能测试结果</h2>
        <div v-if="performanceResults" class="results-grid">
          <div 
            v-for="(result, index) in performanceResults" 
            :key="index"
            class="result-card"
            :class="{ 'warning': result.status === 'warning', 'error': result.status === 'error' }"
          >
            <h3>{{ result.name }}</h3>
            <p class="description">{{ result.description }}</p>
            <div class="metrics">
              <div class="metric">
                <span class="label">响应时间：</span>
                <span class="value">{{ result.responseTime }}ms</span>
              </div>
              <div class="metric">
                <span class="label">状态：</span>
                <span class="value" :class="result.status">{{ result.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="extreme-scenarios-section">
        <h2>极端场景测试</h2>
        <div v-if="extremeResults" class="results-grid">
          <div 
            v-for="(result, index) in extremeResults" 
            :key="index"
            class="result-card"
            :class="{ 'warning': result.status === 'warning', 'error': result.status === 'error' }"
          >
            <h3>{{ result.name }}</h3>
            <p class="description">{{ result.description }}</p>
            <div class="metrics">
              <div class="metric">
                <span class="label">成功率：</span>
                <span class="value">{{ result.successRate }}%</span>
              </div>
              <div class="metric">
                <span class="label">平均响应时间：</span>
                <span class="value">{{ result.avgResponseTime }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="issues-section">
        <h2>问题报告</h2>
        <div v-if="issues.length" class="issues-list">
          <div 
            v-for="(issue, index) in issues" 
            :key="index"
            class="issue-card"
            :class="issue.severity"
          >
            <h3>{{ issue.title }}</h3>
            <p>{{ issue.description }}</p>
            <div class="issue-meta">
              <span class="severity">{{ issue.severity }}</span>
              <span class="timestamp">{{ formatDate(issue.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-issues">
          暂无问题报告
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { runCompatibilityTests, getTestResults } from '@/utils/compatibility'
import { runExtremeScenarios } from '@/utils/compatibility/extremeScenarios'
import { exportReport } from '@/utils/compatibility/reportGenerator'
import { notifyTestCompletion, notifyTestError, notifyExportCompletion } from '@/utils/compatibility/notification'

export default {
  name: 'AdminPerformanceView',
  setup() {
    const isMonitoring = ref(false)
    const browserInfo = ref(null)
    const performanceResults = ref(null)
    const extremeResults = ref(null)
    const issues = ref([])
    const monitoringInterval = ref(null)

    const hasResults = computed(() => {
      return browserInfo.value && performanceResults.value && extremeResults.value
    })

    const startMonitoring = async () => {
      try {
        isMonitoring.value = true
        await runTests()
        // 设置定时监控
        monitoringInterval.value = setInterval(runTests, 5 * 60 * 1000) // 每5分钟运行一次
      } catch (error) {
        console.error('启动监控失败:', error)
        notifyTestError(error)
      }
    }

    const stopMonitoring = () => {
      isMonitoring.value = false
      if (monitoringInterval.value) {
        clearInterval(monitoringInterval.value)
        monitoringInterval.value = null
      }
    }

    const runTests = async () => {
      try {
        // 运行兼容性测试
        const compatibilityResults = await runCompatibilityTests()
        browserInfo.value = getTestResults()
        performanceResults.value = compatibilityResults.performanceResults

        // 运行极端场景测试
        const extremeTestResults = await runExtremeScenarios()
        extremeResults.value = extremeTestResults.results

        // 收集问题
        issues.value = [
          ...compatibilityResults.issues,
          ...extremeTestResults.issues
        ]

        notifyTestCompletion(compatibilityResults)
      } catch (error) {
        console.error('测试执行失败:', error)
        notifyTestError(error)
      }
    }

    const exportReport = async (format) => {
      try {
        const success = await exportReport({
          browserInfo: browserInfo.value,
          performanceResults: performanceResults.value,
          extremeResults: extremeResults.value,
          issues: issues.value
        }, format)
        notifyExportCompletion(format, success)
      } catch (error) {
        console.error('导出报告失败:', error)
        notifyExportCompletion(format, false)
      }
    }

    const getScoreClass = (score) => {
      if (score >= 90) return 'excellent'
      if (score >= 80) return 'good'
      if (score >= 60) return 'warning'
      return 'error'
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    onMounted(() => {
      // 初始化时加载最近一次的结果
      runTests()
    })

    onUnmounted(() => {
      stopMonitoring()
    })

    return {
      isMonitoring,
      browserInfo,
      performanceResults,
      extremeResults,
      issues,
      hasResults,
      startMonitoring,
      stopMonitoring,
      exportReport,
      getScoreClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-performance-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.controls {
  display: flex;
  gap: 10px;
}

.monitoring-content {
  display: grid;
  gap: 30px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.label {
  font-weight: 500;
  margin-right: 10px;
  color: #666;
}

.value {
  color: #333;
}

.value.excellent { color: #28a745; }
.value.good { color: #17a2b8; }
.value.warning { color: #ffc107; }
.value.error { color: #dc3545; }

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.result-card.warning {
  border-left: 4px solid #ffc107;
}

.result-card.error {
  border-left: 4px solid #dc3545;
}

.description {
  color: #666;
  margin: 10px 0;
}

.metrics {
  display: grid;
  gap: 10px;
}

.issues-list {
  display: grid;
  gap: 15px;
}

.issue-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.issue-card.critical {
  border-left: 4px solid #dc3545;
}

.issue-card.warning {
  border-left: 4px solid #ffc107;
}

.issue-card.info {
  border-left: 4px solid #17a2b8;
}

.issue-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}

.severity {
  font-weight: 500;
}

.severity.critical { color: #dc3545; }
.severity.warning { color: #ffc107; }
.severity.info { color: #17a2b8; }

.no-issues {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .controls {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
  }
}
</style> 