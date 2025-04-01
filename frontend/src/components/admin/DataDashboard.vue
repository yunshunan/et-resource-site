<template>
  <div class="data-dashboard">
    <div class="header">
      <h3>数据仪表板</h3>
      <div class="controls">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadData"
        />
        <el-button type="primary" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="metric in overviewMetrics" :key="metric.title">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-title">{{ metric.title }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-trend" :class="metric.trend">
                {{ metric.change }}
                <i :class="metric.trend === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 用户行为分析 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>用户行为分析</span>
          <el-radio-group v-model="behaviorTimeRange" size="small">
            <el-radio-button label="hour">小时</el-radio-button>
            <el-radio-button label="day">天</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-container">
        <line-chart :data="userBehaviorData" />
      </div>
      <div class="behavior-summary">
        <div v-for="(item, index) in behaviorSummary" :key="index" class="summary-item">
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.value }}</span>
        </div>
      </div>
    </el-card>

    <!-- 错误监控 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>错误监控</span>
          <el-button type="text" @click="clearErrorLogs">清除日志</el-button>
        </div>
      </template>
      <div class="error-stats">
        <div class="error-chart">
          <pie-chart :data="errorDistribution" />
        </div>
        <div class="error-list">
          <el-table :data="recentErrors" style="width: 100%">
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="message" label="消息" />
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="count" label="次数" width="100" />
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- A/B测试结果 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>A/B测试结果</span>
          <el-button type="primary" size="small" @click="createNewExperiment">
            新建实验
          </el-button>
        </div>
      </template>
      <div class="experiment-list">
        <el-table :data="experiments" style="width: 100%">
          <el-table-column prop="name" label="实验名称" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '进行中' : '已结束' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="participants" label="参与人数" width="120" />
          <el-table-column prop="conversion" label="转化率" width="120" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" @click="viewExperimentDetails(row)">
                查看详情
              </el-button>
              <el-button 
                type="text" 
                @click="endExperiment(row)"
                v-if="row.status === 'active'"
              >
                结束实验
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 性能监控 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>性能监控</span>
          <el-select v-model="performanceMetric" size="small">
            <el-option label="页面加载时间" value="pageLoad" />
            <el-option label="首次内容绘制" value="fcp" />
            <el-option label="最大内容绘制" value="lcp" />
            <el-option label="首次输入延迟" value="fid" />
          </el-select>
        </div>
      </template>
      <div class="performance-chart">
        <line-chart :data="performanceData" />
      </div>
      <div class="performance-thresholds">
        <div v-for="(threshold, key) in performanceThresholds" :key="key" class="threshold-item">
          <span class="label">{{ threshold.label }}</span>
          <el-input-number 
            v-model="threshold.value" 
            :min="0" 
            :max="threshold.max"
            size="small"
            @change="updateThreshold(key, $event)"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { LineChart, PieChart } from 'vue-chartjs'
import { analyticsService } from '@/services/analytics'
import { errorTrackingService } from '@/services/errorTracking'
import { abTestingService } from '@/services/abTesting'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'DataDashboard',
  components: {
    LineChart,
    PieChart
  },
  setup() {
    const notificationStore = useNotificationStore()
    const dateRange = ref([])
    const behaviorTimeRange = ref('day')
    const performanceMetric = ref('pageLoad')
    
    const overviewMetrics = ref([])
    const userBehaviorData = ref([])
    const behaviorSummary = ref([])
    const errorDistribution = ref([])
    const recentErrors = ref([])
    const experiments = ref([])
    const performanceData = ref([])
    const performanceThresholds = ref({
      pageLoad: { label: '页面加载时间', value: 2000, max: 5000 },
      fcp: { label: '首次内容绘制', value: 1800, max: 3000 },
      lcp: { label: '最大内容绘制', value: 2500, max: 4000 },
      fid: { label: '首次输入延迟', value: 100, max: 300 }
    })

    const loadData = async () => {
      try {
        const [startDate, endDate] = dateRange.value
        
        // 加载用户行为数据
        const behaviorData = await analyticsService.getUserBehaviorReport(
          startDate.toISOString(),
          endDate.toISOString()
        )
        userBehaviorData.value = behaviorData.chartData
        behaviorSummary.value = behaviorData.summary

        // 加载错误数据
        const errorStats = errorTrackingService.getErrorStats()
        errorDistribution.value = Object.entries(errorStats.byType).map(([type, count]) => ({
          name: type,
          value: count
        }))
        recentErrors.value = errorTrackingService.getErrorLogs().slice(0, 10)

        // 加载实验数据
        const experimentList = abTestingService.getExperiments()
        experiments.value = await Promise.all(
          experimentList.map(async (exp) => {
            const stats = await abTestingService.getExperimentStats(exp.id)
            return {
              ...exp,
              participants: stats.participants,
              conversion: stats.conversionRate
            }
          })
        )

        // 加载性能数据
        const performanceData = await analyticsService.getPerformanceReport(
          startDate.toISOString(),
          endDate.toISOString()
        )
        performanceData.value = performanceData[performanceMetric.value]

      } catch (error) {
        console.error('加载数据失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '加载失败',
          message: '加载数据时发生错误'
        })
      }
    }

    const clearErrorLogs = () => {
      errorTrackingService.clearErrorLogs()
      loadData()
    }

    const createNewExperiment = () => {
      // 实现新建实验的逻辑
    }

    const viewExperimentDetails = (experiment) => {
      // 实现查看实验详情的逻辑
    }

    const endExperiment = async (experiment) => {
      try {
        await abTestingService.endExperiment(experiment.id)
        loadData()
        notificationStore.addNotification({
          type: 'success',
          title: '实验已结束',
          message: '实验已成功结束'
        })
      } catch (error) {
        console.error('结束实验失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '操作失败',
          message: '结束实验时发生错误'
        })
      }
    }

    const updateThreshold = (metric, value) => {
      performanceThresholds.value[metric].value = value
      // 实现更新阈值的逻辑
    }

    const exportReport = async () => {
      try {
        const [startDate, endDate] = dateRange.value
        const report = {
          overview: overviewMetrics.value,
          behavior: userBehaviorData.value,
          errors: errorDistribution.value,
          experiments: experiments.value,
          performance: performanceData.value
        }

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dashboard-report-${new Date().toISOString()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        notificationStore.addNotification({
          type: 'success',
          title: '导出成功',
          message: '报告已成功导出'
        })
      } catch (error) {
        console.error('导出报告失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '导出失败',
          message: '导出报告时发生错误'
        })
      }
    }

    onMounted(() => {
      // 默认加载最近7天的数据
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      dateRange.value = [startDate, endDate]
      loadData()
    })

    return {
      dateRange,
      behaviorTimeRange,
      performanceMetric,
      overviewMetrics,
      userBehaviorData,
      behaviorSummary,
      errorDistribution,
      recentErrors,
      experiments,
      performanceData,
      performanceThresholds,
      loadData,
      clearErrorLogs,
      createNewExperiment,
      viewExperimentDetails,
      endExperiment,
      updateThreshold,
      exportReport
    }
  }
}
</script>

<style scoped>
.data-dashboard {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.overview-cards {
  margin-bottom: 20px;
}

.metric-card {
  height: 100%;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-title {
  color: #666;
  font-size: 14px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.up {
  color: #67C23A;
}

.metric-trend.down {
  color: #F56C6C;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  margin-bottom: 20px;
}

.behavior-summary,
.performance-thresholds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.summary-item,
.threshold-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.error-stats {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.error-chart {
  height: 300px;
}

.error-list {
  max-height: 300px;
  overflow-y: auto;
}

.experiment-list {
  margin-top: 20px;
}

.performance-chart {
  height: 300px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .error-stats {
    grid-template-columns: 1fr;
  }
  
  .behavior-summary,
  .performance-thresholds {
    grid-template-columns: 1fr;
  }
}
</style> 