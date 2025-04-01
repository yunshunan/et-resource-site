<template>
  <div class="performance-panel" v-if="isDevMode">
    <div class="performance-panel-toggle" @click="togglePanel">
      <i class="bi" :class="isOpen ? 'bi-speedometer2' : 'bi-speedometer'"></i>
    </div>
    
    <div v-if="isOpen" class="performance-panel-content">
      <div class="performance-panel-header">
        <h5>性能监控面板</h5>
        <button class="btn-close" @click="togglePanel"></button>
      </div>
      
      <div class="performance-panel-body">
        <!-- Performance Warnings -->
        <div v-if="activeWarnings.length > 0" class="metrics-section warnings-section">
          <h6>性能警告</h6>
          <div class="warning-list">
            <div v-for="warning in activeWarnings" 
                 :key="warning.metric" 
                 class="warning-item"
                 :class="warning.level">
              <i class="bi" :class="warning.level === 'critical' ? 'bi-exclamation-triangle' : 'bi-exclamation-circle'"></i>
              <div class="warning-content">
                <div class="warning-title">{{ warning.metric }}</div>
                <div class="warning-details">
                  当前值: {{ formatTime(warning.value) }} / 
                  阈值: {{ formatTime(warning.threshold) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Core Web Vitals -->
        <div class="metrics-section">
          <div class="section-header">
            <h6>Core Web Vitals</h6>
            <button class="btn btn-sm btn-outline-secondary" @click="showTrends = !showTrends">
              {{ showTrends ? '隐藏趋势' : '显示趋势' }}
            </button>
          </div>
          <div class="metrics-grid">
            <div class="metric-item" :class="getFCPClass(metrics.coreMetrics.fcp)">
              <div class="metric-value">{{ formatTime(metrics.coreMetrics.fcp) }}</div>
              <div class="metric-label">FCP</div>
            </div>
            <div class="metric-item" :class="getLCPClass(metrics.coreMetrics.lcp)">
              <div class="metric-value">{{ formatTime(metrics.coreMetrics.lcp) }}</div>
              <div class="metric-label">LCP</div>
            </div>
            <div class="metric-item" :class="getFIDClass(metrics.coreMetrics.fid)">
              <div class="metric-value">{{ formatTime(metrics.coreMetrics.fid) }}</div>
              <div class="metric-label">FID</div>
            </div>
            <div class="metric-item" :class="getCLSClass(metrics.coreMetrics.cls)">
              <div class="metric-value">{{ formatCLS(metrics.coreMetrics.cls) }}</div>
              <div class="metric-label">CLS</div>
            </div>
          </div>
          <div v-if="showTrends && metrics.trends" class="trends-chart">
            <div class="chart-container">
              <!-- 这里可以使用图表库（如Chart.js）来可视化趋势数据 -->
              <canvas ref="trendsChart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Route Performance -->
        <div class="metrics-section">
          <h6>路由性能</h6>
          <div class="metric-table">
            <div class="metric-row">
              <span>平均切换时间</span>
              <span>{{ formatTime(metrics.routePerformance.averageTransitionTime) }}</span>
            </div>
            <div v-if="metrics.routePerformance.slowestRoutes.length > 0">
              <div class="metric-subtitle">最慢路由切换 Top 5</div>
              <div class="metric-row" v-for="route in metrics.routePerformance.slowestRoutes" :key="route.timestamp">
                <span>{{ route.from }} → {{ route.to }}</span>
                <span>{{ formatTime(route.duration) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- API Performance -->
        <div class="metrics-section">
          <h6>API性能</h6>
          <div class="metric-table">
            <div class="metric-row">
              <span>平均响应时间</span>
              <span>{{ formatTime(metrics.apiPerformance.averageResponseTime) }}</span>
            </div>
            <div v-if="metrics.apiPerformance.slowestEndpoints.length > 0">
              <div class="metric-subtitle">最慢API调用 Top 5</div>
              <div class="metric-row" v-for="api in metrics.apiPerformance.slowestEndpoints" :key="api.timestamp">
                <span>{{ api.method }} {{ api.endpoint }}</span>
                <span>{{ formatTime(api.duration) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resource Performance -->
        <div class="metrics-section">
          <h6>资源加载性能</h6>
          <div class="metric-table">
            <div class="metric-row">
              <span>平均加载时间</span>
              <span>{{ formatTime(metrics.resourcePerformance.averageLoadTime) }}</span>
            </div>
            <div v-if="metrics.resourcePerformance.slowestResources.length > 0">
              <div class="metric-subtitle">最慢资源加载 Top 5</div>
              <div class="metric-row" v-for="resource in metrics.resourcePerformance.slowestResources" :key="resource.timestamp">
                <span class="resource-url">{{ resource.url }}</span>
                <span>{{ formatTime(resource.loadTime) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Thresholds Configuration -->
        <div class="metrics-section" v-if="showThresholds">
          <div class="section-header">
            <h6>性能阈值配置</h6>
            <button class="btn btn-sm btn-primary" @click="saveThresholds">
              保存配置
            </button>
          </div>
          <div class="thresholds-form">
            <div v-for="(threshold, metric) in thresholds" :key="metric" class="threshold-item">
              <label>{{ metric }}</label>
              <div class="threshold-inputs">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">警告</span>
                  <input type="number" 
                         class="form-control" 
                         v-model.number="threshold.warning"
                         @change="validateThreshold(metric)">
                  <span class="input-group-text">ms</span>
                </div>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">严重</span>
                  <input type="number" 
                         class="form-control" 
                         v-model.number="threshold.critical"
                         @change="validateThreshold(metric)">
                  <span class="input-group-text">ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 同步状态 -->
        <div class="sync-status">
          <h3>同步状态</h3>
          <div class="status-info">
            <p>上次同步时间: {{ lastSyncTime }}</p>
            <p>队列中数据: {{ queueSize }}</p>
            <p>同步状态: {{ syncStatus }}</p>
          </div>
          <button @click="triggerSync" :disabled="isSyncing">
            {{ isSyncing ? '同步中...' : '立即同步' }}
          </button>
        </div>

        <!-- 通知配置 -->
        <div class="notification-config">
          <h3>通知配置</h3>
          <div class="notification-channels">
            <div class="channel">
              <label>
                <input type="checkbox" v-model="notificationConfig.console.enabled">
                控制台通知
              </label>
            </div>
            <div class="channel">
              <label>
                <input type="checkbox" v-model="notificationConfig.email.enabled">
                邮件通知
              </label>
              <input 
                v-if="notificationConfig.email.enabled"
                v-model="notificationConfig.email.address"
                placeholder="接收邮箱地址"
                type="email"
              >
            </div>
            <div class="channel">
              <label>
                <input type="checkbox" v-model="notificationConfig.slack.enabled">
                Slack通知
              </label>
              <input 
                v-if="notificationConfig.slack.enabled"
                v-model="notificationConfig.slack.webhook"
                placeholder="Slack Webhook URL"
                type="text"
              >
            </div>
          </div>
          <button @click="saveNotificationConfig">保存通知配置</button>
        </div>

        <!-- 测试功能 -->
        <div class="test-section">
          <h3>功能测试</h3>
          <div class="test-controls">
            <button 
              @click="startTest" 
              :disabled="isTesting"
              class="btn btn-primary"
            >
              {{ isTesting ? '测试中...' : '开始测试' }}
            </button>
            <button 
              @click="stopTest" 
              :disabled="!isTesting"
              class="btn btn-danger"
            >
              停止测试
            </button>
            <button 
              @click="downloadReport" 
              :disabled="!testReport"
              class="btn btn-secondary"
            >
              下载报告
            </button>
          </div>
          
          <!-- 测试报告 -->
          <div v-if="testReport" class="test-report">
            <h4>测试报告</h4>
            <div class="report-summary">
              <div class="report-item">
                <span class="report-label">测试时间</span>
                <span class="report-value">{{ formatReportTime(testReport.timestamp) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">测试时长</span>
                <span class="report-value">{{ formatDuration(testReport.duration) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">通知成功率</span>
                <span class="report-value" :class="getSuccessRateClass(testReport.summary.notifications.successRate)">
                  {{ testReport.summary.notifications.successRate }}
                </span>
              </div>
              <div class="report-item">
                <span class="report-label">同步成功率</span>
                <span class="report-value" :class="getSuccessRateClass(testReport.summary.syncs.successRate)">
                  {{ testReport.summary.syncs.successRate }}
                </span>
              </div>
            </div>
            
            <div class="report-details">
              <div class="report-section">
                <h5>通知统计</h5>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">总数</span>
                    <span class="stat-value">{{ testReport.summary.notifications.total }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">成功</span>
                    <span class="stat-value success">{{ testReport.summary.notifications.success }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">失败</span>
                    <span class="stat-value failed">{{ testReport.summary.notifications.failed }}</span>
                  </div>
                </div>
              </div>
              
              <div class="report-section">
                <h5>同步统计</h5>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">总数</span>
                    <span class="stat-value">{{ testReport.summary.syncs.total }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">成功</span>
                    <span class="stat-value success">{{ testReport.summary.syncs.success }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">失败</span>
                    <span class="stat-value failed">{{ testReport.summary.syncs.failed }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 测试日志 -->
          <div v-if="testLogs.length > 0" class="test-logs">
            <h4>测试日志</h4>
            <div class="log-filters">
              <label>
                <input type="checkbox" v-model="logFilters.notification"> 通知
              </label>
              <label>
                <input type="checkbox" v-model="logFilters.sync"> 同步
              </label>
              <label>
                <input type="checkbox" v-model="logFilters.test"> 测试
              </label>
            </div>
            <div class="log-list">
              <div 
                v-for="(log, index) in filteredLogs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                <span class="log-type">{{ log.type }}</span>
                <span class="log-message">{{ log.message }}</span>
                <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- 压力测试结果 -->
        <div v-if="testReport?.stressTest" class="stress-test-section">
          <h4>压力测试结果</h4>
          <div class="stress-test-summary">
            <div class="stress-test-metrics">
              <div class="metric-item">
                <span class="metric-label">吞吐量</span>
                <span class="metric-value" :class="getStressTestClass('throughput', testReport.stressTest.results)">
                  {{ testReport.stressTest.results.throughput.toFixed(2) }} 请求/秒
                </span>
              </div>
              <div class="metric-item">
                <span class="metric-label">平均响应时间</span>
                <span class="metric-value" :class="getStressTestClass('responseTime', testReport.stressTest.results)">
                  {{ testReport.stressTest.results.avgResponseTime.toFixed(2) }}ms
                </span>
              </div>
              <div class="metric-item">
                <span class="metric-label">错误率</span>
                <span class="metric-value" :class="getStressTestClass('errorRate', testReport.stressTest.results)">
                  {{ (testReport.stressTest.results.errorRate * 100).toFixed(2) }}%
                </span>
              </div>
            </div>
            
            <div class="stress-test-chart">
              <canvas ref="stressTestChart"></canvas>
            </div>
          </div>
          
          <div class="stress-test-details">
            <h5>详细统计</h5>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">总请求数</span>
                <span class="stat-value">{{ testReport.stressTest.results.totalRequests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功请求</span>
                <span class="stat-value success">{{ testReport.stressTest.results.successfulRequests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">失败请求</span>
                <span class="stat-value failed">{{ testReport.stressTest.results.failedRequests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最大响应时间</span>
                <span class="stat-value">{{ testReport.stressTest.results.maxResponseTime.toFixed(2) }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最小响应时间</span>
                <span class="stat-value">{{ testReport.stressTest.results.minResponseTime.toFixed(2) }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内存泄漏检测结果 -->
        <div v-if="testReport?.memoryLeakTest" class="memory-leak-section">
          <h4>内存泄漏检测</h4>
          <div class="memory-leak-summary">
            <div class="memory-leak-status" :class="{ 'has-leak': testReport.memoryLeakTest.analysis.hasLeak }">
              <i class="bi" :class="testReport.memoryLeakTest.analysis.hasLeak ? 'bi-exclamation-triangle' : 'bi-check-circle'"></i>
              <span>{{ testReport.memoryLeakTest.analysis.hasLeak ? '检测到内存泄漏' : '未检测到内存泄漏' }}</span>
            </div>
            
            <div class="memory-leak-metrics">
              <div class="metric-item">
                <span class="metric-label">内存增长率</span>
                <span class="metric-value" :class="getMemoryLeakClass(testReport.memoryLeakTest.analysis.growthRate)">
                  {{ testReport.memoryLeakTest.analysis.growthRate.toFixed(2) }}MB/迭代
                </span>
              </div>
              <div class="metric-item">
                <span class="metric-label">最大增长</span>
                <span class="metric-value">{{ testReport.memoryLeakTest.analysis.details.maxGrowth.toFixed(2) }}MB</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">总增长</span>
                <span class="metric-value">{{ testReport.memoryLeakTest.analysis.details.totalGrowth.toFixed(2) }}MB</span>
              </div>
            </div>
          </div>
          
          <div class="memory-leak-chart">
            <canvas ref="memoryLeakChart"></canvas>
          </div>
          
          <div class="memory-leak-details">
            <h5>迭代详情</h5>
            <div class="iteration-list">
              <div v-for="iteration in testReport.memoryLeakTest.metrics.iterations" 
                   :key="iteration.iteration"
                   class="iteration-item"
                   :class="{ 'high-growth': iteration.memoryGrowth > memoryLeakConfig.threshold }">
                <span class="iteration-number">迭代 {{ iteration.iteration }}</span>
                <span class="iteration-duration">{{ formatDuration(iteration.duration) }}</span>
                <span class="iteration-growth">{{ iteration.memoryGrowth.toFixed(2) }}MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 测试场景控制 -->
        <div class="test-scenarios-section">
          <h4>测试场景</h4>
          <div class="scenario-controls">
            <div class="scenario-select">
              <label>选择测试场景：</label>
              <select v-model="selectedScenario">
                <option v-for="scenario in scenarios" 
                        :key="scenario.name" 
                        :value="scenario">
                  {{ scenario.name }}
                </option>
              </select>
            </div>
            <div class="scenario-actions">
              <button @click="startScenario" 
                      :disabled="isScenarioRunning"
                      class="btn btn-primary">
                <i class="bi bi-play-fill"></i> 开始测试
              </button>
              <button @click="stopScenario" 
                      :disabled="!isScenarioRunning"
                      class="btn btn-danger">
                <i class="bi bi-stop-fill"></i> 停止测试
              </button>
            </div>
          </div>
          
          <div v-if="currentScenarioResult" class="scenario-results">
            <h5>测试结果</h5>
            <div class="result-summary">
              <div class="result-item">
                <span class="result-label">开始时间：</span>
                <span class="result-value">{{ formatTime(currentScenarioResult.startTime) }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">结束时间：</span>
                <span class="result-value">{{ formatTime(currentScenarioResult.endTime) }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">持续时间：</span>
                <span class="result-value">{{ formatDuration(currentScenarioResult.duration) }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">状态：</span>
                <span class="result-value" :class="currentScenarioResult.errors.length ? 'error' : 'success'">
                  {{ currentScenarioResult.errors.length ? '失败' : '成功' }}
                </span>
              </div>
            </div>
            
            <div class="result-charts">
              <div class="chart-container">
                <canvas ref="responseTimeChart"></canvas>
              </div>
              <div class="chart-container">
                <canvas ref="throughputChart"></canvas>
              </div>
              <div class="chart-container">
                <canvas ref="memoryUsageChart"></canvas>
              </div>
              <div class="chart-container">
                <canvas ref="errorRateChart"></canvas>
              </div>
            </div>
            
            <div v-if="currentScenarioResult.errors.length" class="result-errors">
              <h5>错误信息</h5>
              <ul>
                <li v-for="(error, index) in currentScenarioResult.errors" 
                    :key="index"
                    class="error-item">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 浏览器兼容性测试 -->
        <div class="browser-compatibility-section">
          <div class="section-header">
            <h3>浏览器兼容性测试</h3>
            <div class="section-controls">
              <button 
                @click="startCompatibilityTest" 
                :disabled="isCompatibilityTesting"
                class="btn btn-primary"
              >
                开始测试
              </button>
              <button 
                @click="stopCompatibilityTest" 
                :disabled="!isCompatibilityTesting"
                class="btn btn-danger"
              >
                停止测试
              </button>
              <div class="export-controls">
                <button 
                  @click="exportReport('html')" 
                  :disabled="!compatibilityResults"
                  class="btn btn-secondary"
                >
                  导出HTML报告
                </button>
                <button 
                  @click="exportReport('pdf')" 
                  :disabled="!compatibilityResults"
                  class="btn btn-secondary"
                >
                  导出PDF报告
                </button>
              </div>
            </div>
          </div>
          <div v-if="exportStatus" :class="['export-status', exportStatus]">
            {{ exportStatus === 'exporting' ? '正在导出报告...' : 
               exportStatus === 'success' ? '报告导出成功' : 
               '报告导出失败' }}
          </div>
          <div v-if="compatibilityResults" class="compatibility-results">
            <div class="browser-info">
              <h5>浏览器信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">浏览器：</span>
                  <span class="info-value">{{ compatibilityResults.browser.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">版本：</span>
                  <span class="info-value">{{ compatibilityResults.browser.version }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">平台：</span>
                  <span class="info-value">{{ compatibilityResults.browser.platform }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">兼容性得分：</span>
                  <span class="info-value" :class="getCompatibilityScoreClass(compatibilityResults.compatibility.score)">
                    {{ compatibilityResults.compatibility.score }}%
                  </span>
                </div>
              </div>
            </div>
            
            <div class="features-test">
              <h5>特性支持</h5>
              <div class="features-grid">
                <div v-for="(feature, name) in compatibilityResults.browser.features" 
                     :key="name"
                     class="feature-item"
                     :class="{ 'supported': feature.supported }">
                  <div class="feature-header">
                    <span class="feature-name">{{ name }}</span>
                    <span class="feature-status">
                      {{ feature.supported ? '支持' : '不支持' }}
                    </span>
                  </div>
                  <div class="feature-details">
                    <div v-for="(supported, detail) in feature.details" 
                         :key="detail"
                         class="detail-item">
                      <span class="detail-name">{{ detail }}：</span>
                      <span class="detail-value" :class="{ 'supported': supported }">
                        {{ supported ? '支持' : '不支持' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="performance-tests">
              <h5>性能测试</h5>
              <div class="test-summary">
                <div class="summary-item">
                  <span class="summary-label">总测试数：</span>
                  <span class="summary-value">{{ compatibilityResults.performance.summary.total }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">通过：</span>
                  <span class="summary-value success">{{ compatibilityResults.performance.summary.passed }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">失败：</span>
                  <span class="summary-value error">{{ compatibilityResults.performance.summary.failed }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">跳过：</span>
                  <span class="summary-value warning">{{ compatibilityResults.performance.summary.skipped }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">平均耗时：</span>
                  <span class="summary-value">{{ formatTime(compatibilityResults.performance.summary.averageDuration) }}</span>
                </div>
              </div>
              
              <div class="test-grid">
                <div v-for="test in compatibilityResults.performance.results" 
                     :key="test.name"
                     class="test-item"
                     :class="{ 
                       'passed': test.passed === true,
                       'failed': test.passed === false,
                       'skipped': test.passed === null
                     }">
                  <div class="test-header">
                    <span class="test-name">{{ test.name }}</span>
                    <span class="test-status">
                      {{ test.passed === true ? '通过' : 
                         test.passed === false ? '失败' : '跳过' }}
                    </span>
                  </div>
                  <div class="test-description">{{ test.description }}</div>
                  <div v-if="test.duration !== undefined" class="test-details">
                    <span class="test-duration">
                      耗时：{{ formatTime(test.duration) }}
                    </span>
                    <span class="test-threshold">
                      阈值：{{ formatTime(test.threshold) }}
                    </span>
                  </div>
                  <div v-if="test.error" class="test-error">
                    {{ test.error }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="compatibilityResults.issues.length" class="issues-section">
              <h5>问题报告</h5>
              <div class="issues-grid">
                <div v-for="issue in compatibilityResults.issues" 
                     :key="`${issue.type}-${issue.feature}`"
                     class="issue-item"
                     :class="issue.severity">
                  <div class="issue-header">
                    <span class="issue-type">{{ issue.type === 'compatibility' ? '兼容性问题' : '性能问题' }}</span>
                    <span class="issue-severity">{{ issue.severity === 'error' ? '错误' : '警告' }}</span>
                  </div>
                  <div class="issue-content">
                    <div class="issue-category">{{ issue.category }}</div>
                    <div class="issue-feature">{{ issue.feature }}</div>
                    <div class="issue-details">{{ issue.details }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as performanceMonitor from '@/utils/performanceMonitor'
import * as performanceStorage from '@/utils/performanceStorage'
import Chart from 'chart.js/auto'
import * as performanceSync from '@/utils/performanceSync'
import * as notificationService from '@/utils/notificationService'
import * as performanceTest from '@/utils/performanceTest'
import { errorScenarioCombinations, runTestScenario, getTestResults } from '@/utils/testScenarios'
import { runCompatibilityTests } from '@/utils/compatibility'
import {
  createResponseTimeChart,
  createThroughputChart,
  createMemoryUsageChart,
  createErrorRateChart,
  updateChartData,
  destroyChart
} from '@/utils/chartManager'
import { exportReport } from '@/utils/compatibility/reportGenerator'
import { notifyTestCompletion, notifyTestError, notifyExportCompletion } from '@/utils/compatibility/notification'

export default {
  name: 'PerformancePanel',
  setup() {
    const isDevMode = ref(process.env.NODE_ENV === 'development')
    const isOpen = ref(false)
    const metrics = reactive({
      coreMetrics: {
        fcp: null,
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null
      },
      routePerformance: {
        averageTransitionTime: 0,
        slowestRoutes: []
      },
      apiPerformance: {
        averageResponseTime: 0,
        slowestEndpoints: []
      },
      resourcePerformance: {
        averageLoadTime: 0,
        slowestResources: []
      }
    })
    
    const showTrends = ref(false)
    const showThresholds = ref(false)
    const trendsChart = ref(null)
    const thresholds = reactive(performanceStorage.getThresholds())
    const activeWarnings = ref([])
    
    const lastSyncTime = ref('未同步')
    const queueSize = ref(0)
    const syncStatus = ref('空闲')
    const isSyncing = ref(false)
    
    const notificationConfig = ref({
      console: { enabled: true },
      email: { enabled: false, address: '' },
      slack: { enabled: false, webhook: '' }
    })
    
    const isTesting = ref(false)
    const testLogs = ref([])
    
    const testReport = ref(null)
    const logFilters = ref({
      notification: true,
      sync: true,
      test: true
    })
    
    const stressTestChart = ref(null)
    const memoryLeakChart = ref(null)
    
    const scenarios = ref(errorScenarioCombinations.scenarios)
    const selectedScenario = ref(null)
    const isScenarioRunning = ref(false)
    const currentScenarioResult = ref(null)
    
    const responseTimeChart = ref(null)
    const throughputChart = ref(null)
    const memoryUsageChart = ref(null)
    const errorRateChart = ref(null)
    
    const isCompatibilityTesting = ref(false)
    const compatibilityResults = ref(null)
    const exportStatus = ref(null)
    
    // 过滤后的日志
    const filteredLogs = computed(() => {
      return testLogs.value.filter(log => logFilters.value[log.type])
    })
    
    // 更新性能指标
    const updateMetrics = () => {
      const analysis = performanceMonitor.analyzePerformance()
      Object.assign(metrics, analysis)
      
      // 更新警告
      activeWarnings.value = performanceStorage.checkThresholds(analysis.coreMetrics)
      
      // 如果显示趋势，更新图表
      if (showTrends.value && trendsChart.value) {
        updateTrendsChart()
      }
    }
    
    // 初始化趋势图表
    const initTrendsChart = () => {
      const ctx = trendsChart.value.getContext('2d')
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'FCP',
              data: [],
              borderColor: '#10b981'
            },
            {
              label: 'LCP',
              data: [],
              borderColor: '#3b82f6'
            },
            {
              label: 'FID',
              data: [],
              borderColor: '#f59e0b'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '时间 (ms)'
              }
            }
          }
        }
      })
    }
    
    // 更新趋势图表
    const updateTrendsChart = () => {
      if (!metrics.trends) return
      
      const chart = trendsChart.value.__chart
      if (!chart) return
      
      chart.data.labels = metrics.trends.map(t => t.date)
      chart.data.datasets[0].data = metrics.trends.map(t => t.metrics.FCP)
      chart.data.datasets[1].data = metrics.trends.map(t => t.metrics.LCP)
      chart.data.datasets[2].data = metrics.trends.map(t => t.metrics.FID)
      
      chart.update()
    }
    
    // 验证阈值配置
    const validateThreshold = (metric) => {
      const threshold = thresholds[metric]
      if (threshold.warning > threshold.critical) {
        threshold.warning = threshold.critical
      }
    }
    
    // 保存阈值配置
    const saveThresholds = () => {
      performanceStorage.updateThresholds(thresholds)
      showThresholds.value = false
    }
    
    // 更新同步状态
    const updateSyncStatus = () => {
      const status = performanceSync.getSyncStatus()
      lastSyncTime.value = status.lastSync ? new Date(status.lastSync).toLocaleString() : '未同步'
      queueSize.value = status.queueSize
      syncStatus.value = status.isSyncing ? '同步中' : '空闲'
      isSyncing.value = status.isSyncing
    }
    
    // 触发手动同步
    const triggerSync = async () => {
      try {
        await performanceSync.triggerSync()
        updateSyncStatus()
      } catch (error) {
        console.error('同步失败:', error)
      }
    }
    
    // 保存通知配置
    const saveNotificationConfig = () => {
      notificationService.configure(notificationConfig.value)
    }
    
    // 开始测试
    const startTest = async () => {
      isTesting.value = true
      testLogs.value = []
      testReport.value = null
      await performanceTest.runPerformanceTests()
    }
    
    // 停止测试
    const stopTest = () => {
      isTesting.value = false
      performanceTest.clearTestLogs()
      testReport.value = performanceTest.getTestReport()
    }
    
    // 下载测试报告
    const downloadReport = () => {
      if (!testReport.value) return
      
      const reportStr = JSON.stringify(testReport.value, null, 2)
      const blob = new Blob([reportStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-test-report-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // 格式化日志时间
    const formatLogTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }
    
    // 格式化报告时间
    const formatReportTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    // 格式化持续时间
    const formatDuration = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}分${remainingSeconds}秒`
    }
    
    // 获取成功率样式类
    const getSuccessRateClass = (rate) => {
      const value = parseFloat(rate)
      if (value >= 90) return 'success'
      if (value >= 70) return 'warning'
      return 'failed'
    }
    
    // 获取压力测试指标样式类
    const getStressTestClass = (metric, results) => {
      const target = stressTestConfig.targetMetrics[metric]
      const actual = results[metric]
      
      if (metric === 'throughput') {
        return actual >= target ? 'success' : 'failed'
      } else if (metric === 'responseTime') {
        return actual <= target ? 'success' : 'failed'
      } else if (metric === 'errorRate') {
        return actual <= target ? 'success' : 'failed'
      }
      
      return ''
    }
    
    // 获取内存泄漏样式类
    const getMemoryLeakClass = (growthRate) => {
      if (growthRate <= 0) return 'success'
      if (growthRate <= memoryLeakConfig.threshold) return 'warning'
      return 'failed'
    }
    
    // 初始化压力测试图表
    const initStressTestChart = () => {
      const ctx = stressTestChart.value.getContext('2d')
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '响应时间',
              data: [],
              borderColor: '#3b82f6'
            },
            {
              label: '内存使用',
              data: [],
              borderColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '数值'
              }
            }
          }
        }
      })
    }
    
    // 初始化内存泄漏图表
    const initMemoryLeakChart = () => {
      const ctx = memoryLeakChart.value.getContext('2d')
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '内存使用',
              data: [],
              borderColor: '#10b981'
            },
            {
              label: '内存增长',
              data: [],
              borderColor: '#f59e0b'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'MB'
              }
            }
          }
        }
      })
    }
    
    // 更新压力测试图表
    const updateStressTestChart = () => {
      if (!testReport.value?.stressTest) return
      
      const chart = stressTestChart.value.__chart
      if (!chart) return
      
      const { results } = testReport.value.stressTest
      
      chart.data.labels = results.memoryUsage.map(usage => 
        new Date(usage.timestamp).toLocaleTimeString()
      )
      
      chart.data.datasets[0].data = results.memoryUsage.map(() => 
        results.avgResponseTime
      )
      
      chart.data.datasets[1].data = results.memoryUsage.map(usage => 
        usage.heapUsed / (1024 * 1024)
      )
      
      chart.update()
    }
    
    // 更新内存泄漏图表
    const updateMemoryLeakChart = () => {
      if (!testReport.value?.memoryLeakTest) return
      
      const chart = memoryLeakChart.value.__chart
      if (!chart) return
      
      const { metrics } = testReport.value.memoryLeakTest
      
      chart.data.labels = metrics.memoryUsage.map(usage => 
        new Date(usage.timestamp).toLocaleTimeString()
      )
      
      chart.data.datasets[0].data = metrics.memoryUsage.map(usage => 
        usage.heapUsed / (1024 * 1024)
      )
      
      chart.data.datasets[1].data = metrics.iterations.map(iteration => 
        iteration.memoryGrowth
      )
      
      chart.update()
    }
    
    // 监听趋势显示状态变化
    watch(showTrends, (newValue) => {
      if (newValue && !trendsChart.value.__chart) {
        nextTick(() => {
          trendsChart.value.__chart = initTrendsChart()
          updateTrendsChart()
        })
      }
    })
    
    // 开始测试场景
    const startScenario = async () => {
      if (!selectedScenario.value || isScenarioRunning.value) return
      
      isScenarioRunning.value = true
      try {
        currentScenarioResult.value = await runTestScenario(selectedScenario.value)
        updateCharts()
      } catch (error) {
        console.error('测试场景执行失败:', error)
      } finally {
        isScenarioRunning.value = false
      }
    }
    
    // 停止测试场景
    const stopScenario = () => {
      if (!isScenarioRunning.value) return
      
      isScenarioRunning.value = false
      if (scenarioInterval) {
        clearInterval(scenarioInterval)
      }
    }
    
    // 更新图表
    const updateCharts = () => {
      if (!currentScenarioResult.value) return
      
      const { metrics } = currentScenarioResult.value
      
      // 更新响应时间图表
      if (metrics.responseTime) {
        updateChartData(responseTimeChart.value.__chart, metrics.responseTime)
      }
      
      // 更新吞吐量图表
      if (metrics.throughput) {
        updateChartData(throughputChart.value.__chart, metrics.throughput)
      }
      
      // 更新内存使用图表
      if (metrics.memoryUsage) {
        updateChartData(memoryUsageChart.value.__chart, metrics.memoryUsage)
      }
      
      // 更新错误率图表
      if (metrics.errorRate) {
        updateChartData(errorRateChart.value.__chart, metrics.errorRate)
      }
    }
    
    // 组件挂载时初始化图表
    onMounted(() => {
      performanceMonitor.initPerformanceMonitoring()
      updateInterval = setInterval(updateMetrics, 2000)
      
      updateSyncStatus()
      let statusInterval = setInterval(updateSyncStatus, 5000)
      
      // 加载已保存的通知配置
      const savedConfig = notificationService.getConfiguration()
      if (savedConfig) {
        notificationConfig.value = savedConfig
      }
      
      // 定期更新测试日志
      logUpdateInterval = setInterval(() => {
        if (isTesting.value) {
          testLogs.value = [...performanceTest.getTestLogs()]
        }
      }, 1000)
      
      if (testReport.value?.stressTest) {
        stressTestChart.value.__chart = initStressTestChart()
        updateStressTestChart()
      }
      
      if (testReport.value?.memoryLeakTest) {
        memoryLeakChart.value.__chart = initMemoryLeakChart()
        updateMemoryLeakChart()
      }
      
      // 初始化测试场景图表
      if (responseTimeChart.value) {
        responseTimeChart.value.__chart = createResponseTimeChart(responseTimeChart.value, [])
      }
      if (throughputChart.value) {
        throughputChart.value.__chart = createThroughputChart(throughputChart.value, [])
      }
      if (memoryUsageChart.value) {
        memoryUsageChart.value.__chart = createMemoryUsageChart(memoryUsageChart.value, [])
      }
      if (errorRateChart.value) {
        errorRateChart.value.__chart = createErrorRateChart(errorRateChart.value, [])
      }
    })
    
    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      if (trendsChart.value?.__chart) {
        trendsChart.value.__chart.destroy()
      }
      
      if (logUpdateInterval) {
        clearInterval(logUpdateInterval)
      }
      
      if (stressTestChart.value?.__chart) {
        stressTestChart.value.__chart.destroy()
      }
      
      if (memoryLeakChart.value?.__chart) {
        memoryLeakChart.value.__chart.destroy()
      }
      
      // 清理测试场景图表
      if (responseTimeChart.value?.__chart) {
        destroyChart(responseTimeChart.value.__chart)
      }
      if (throughputChart.value?.__chart) {
        destroyChart(throughputChart.value.__chart)
      }
      if (memoryUsageChart.value?.__chart) {
        destroyChart(memoryUsageChart.value.__chart)
      }
      if (errorRateChart.value?.__chart) {
        destroyChart(errorRateChart.value.__chart)
      }
      
      if (scenarioInterval) {
        clearInterval(scenarioInterval)
      }
    })
    
    // 切换面板显示
    const togglePanel = () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        updateMetrics()
      }
    }
    
    // 格式化时间
    const formatTime = (ms) => {
      if (ms === null || ms === undefined) return 'N/A'
      return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`
    }
    
    // 格式化CLS
    const formatCLS = (cls) => {
      if (cls === null || cls === undefined) return 'N/A'
      return cls.toFixed(3)
    }
    
    // 获取性能指标的评级类
    const getFCPClass = (fcp) => ({
      'metric-good': fcp <= 1800,
      'metric-needs-improvement': fcp > 1800 && fcp <= 3000,
      'metric-poor': fcp > 3000
    })
    
    const getLCPClass = (lcp) => ({
      'metric-good': lcp <= 2500,
      'metric-needs-improvement': lcp > 2500 && lcp <= 4000,
      'metric-poor': lcp > 4000
    })
    
    const getFIDClass = (fid) => ({
      'metric-good': fid <= 100,
      'metric-needs-improvement': fid > 100 && fid <= 300,
      'metric-poor': fid > 300
    })
    
    const getCLSClass = (cls) => ({
      'metric-good': cls <= 0.1,
      'metric-needs-improvement': cls > 0.1 && cls <= 0.25,
      'metric-poor': cls > 0.25
    })
    
    // 开始兼容性测试
    const startCompatibilityTest = async () => {
      try {
        isCompatibilityTesting.value = true
        compatibilityResults.value = await runCompatibilityTests()
        notifyTestCompletion(compatibilityResults.value)
      } catch (error) {
        console.error('兼容性测试失败:', error)
        notifyTestError(error)
      } finally {
        isCompatibilityTesting.value = false
      }
    }
    
    // 停止兼容性测试
    const stopCompatibilityTest = () => {
      isCompatibilityTesting.value = false
    }
    
    // 获取兼容性得分样式
    const getCompatibilityScoreClass = (score) => {
      if (score >= 90) return 'success'
      if (score >= 70) return 'warning'
      return 'error'
    }
    
    const handleExportReport = async (format) => {
      try {
        exportStatus.value = 'exporting'
        const success = await exportReport(compatibilityResults.value, format)
        exportStatus.value = success ? 'success' : 'error'
        notifyExportCompletion(format, success)
      } catch (error) {
        console.error('导出报告失败:', error)
        exportStatus.value = 'error'
        notifyExportCompletion(format, false)
      }
    }

    return {
      isDevMode,
      isOpen,
      metrics,
      togglePanel,
      formatTime,
      formatCLS,
      getFCPClass,
      getLCPClass,
      getFIDClass,
      getCLSClass,
      showTrends,
      showThresholds,
      trendsChart,
      thresholds,
      activeWarnings,
      validateThreshold,
      saveThresholds,
      lastSyncTime,
      queueSize,
      syncStatus,
      isSyncing,
      notificationConfig,
      triggerSync,
      saveNotificationConfig,
      isTesting,
      testLogs,
      startTest,
      stopTest,
      formatLogTime,
      testReport,
      logFilters,
      filteredLogs,
      downloadReport,
      formatReportTime,
      formatDuration,
      getSuccessRateClass,
      stressTestChart,
      memoryLeakChart,
      getStressTestClass,
      getMemoryLeakClass,
      scenarios,
      selectedScenario,
      isScenarioRunning,
      currentScenarioResult,
      responseTimeChart,
      throughputChart,
      memoryUsageChart,
      errorRateChart,
      startScenario,
      stopScenario,
      formatTime,
      isCompatibilityTesting,
      compatibilityResults,
      exportStatus,
      startCompatibilityTest,
      stopCompatibilityTest,
      getCompatibilityScoreClass,
      exportReport: handleExportReport
    }
  }
}
</script>

<style scoped>
.performance-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 9998;
}

.performance-panel-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.performance-panel-toggle:hover {
  background-color: #059669;
}

.performance-panel-toggle i {
  font-size: 1.5rem;
}

.performance-panel-content {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.performance-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.performance-panel-header h5 {
  margin: 0;
  font-size: 1rem;
}

.performance-panel-body {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.metrics-section {
  margin-bottom: 20px;
}

.metrics-section h6 {
  margin-bottom: 12px;
  color: #4b5563;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.metric-item {
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  background-color: #f3f4f6;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-good {
  background-color: #d1fae5;
  color: #065f46;
}

.metric-needs-improvement {
  background-color: #fef3c7;
  color: #92400e;
}

.metric-poor {
  background-color: #fee2e2;
  color: #991b1b;
}

.metric-table {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 12px 0 8px;
}

.resource-url {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.warnings-section {
  margin-bottom: 24px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 6px;
  background-color: #fff3cd;
  color: #856404;
}

.warning-item.critical {
  background-color: #f8d7da;
  color: #721c24;
}

.warning-item i {
  margin-right: 12px;
  font-size: 1.2rem;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.warning-details {
  font-size: 0.875rem;
}

.trends-chart {
  margin-top: 16px;
  height: 200px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.thresholds-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.threshold-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.threshold-inputs {
  display: flex;
  gap: 12px;
}

.input-group-sm {
  flex: 1;
}

.sync-status,
.notification-config {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-info {
  margin: 10px 0;
}

.notification-channels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 0;
}

.channel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel input[type="text"],
.channel input[type="email"] {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.test-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.test-report {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.report-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.report-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.report-value {
  font-weight: 600;
}

.report-value.success {
  color: #059669;
}

.report-value.warning {
  color: #d97706;
}

.report-value.failed {
  color: #dc2626;
}

.report-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.report-section {
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-section h5 {
  margin-bottom: 10px;
  color: #4b5563;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
}

.stat-value.success {
  color: #059669;
}

.stat-value.failed {
  color: #dc2626;
}

.log-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.log-filters label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.875rem;
  color: #6b7280;
}

.log-filters input[type="checkbox"] {
  margin: 0;
}

.test-logs {
  margin-top: 15px;
}

.log-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.log-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 0.9em;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #666;
  margin-right: 10px;
}

.log-type {
  font-weight: bold;
  margin-right: 10px;
}

.log-type.notification {
  color: #4CAF50;
}

.log-type.sync {
  color: #2196F3;
}

.log-type.test {
  color: #9C27B0;
}

.log-message {
  color: #333;
}

.log-data {
  margin-top: 5px;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: pre-wrap;
  word-break: break-all;
}

.stress-test-section,
.memory-leak-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.stress-test-summary,
.memory-leak-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.stress-test-metrics,
.memory-leak-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stress-test-chart,
.memory-leak-chart {
  height: 200px;
  margin: 15px 0;
}

.memory-leak-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #d1fae5;
  color: #065f46;
}

.memory-leak-status.has-leak {
  background-color: #fee2e2;
  color: #991b1b;
}

.memory-leak-status i {
  font-size: 1.2rem;
}

.iteration-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iteration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.iteration-item.high-growth {
  background-color: #fee2e2;
  border-color: #fecaca;
}

.iteration-number {
  font-weight: 600;
}

.iteration-duration {
  color: #6b7280;
}

.iteration-growth {
  font-weight: 600;
}

.iteration-growth.high-growth {
  color: #dc2626;
}

.test-scenarios-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.scenario-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.scenario-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scenario-select select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.scenario-actions {
  display: flex;
  gap: 10px;
}

.scenario-results {
  margin-top: 20px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.result-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.result-value {
  font-weight: 600;
}

.result-value.error {
  color: #ef4444;
}

.result-value.success {
  color: #10b981;
}

.result-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-errors {
  margin-top: 20px;
  padding: 15px;
  background-color: #fee2e2;
  border-radius: 4px;
}

.error-item {
  color: #991b1b;
  margin-bottom: 5px;
}

.error-item:last-child {
  margin-bottom: 0;
}

.browser-compatibility-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.section-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.browser-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.info-value {
  font-weight: 600;
}

.info-value.success {
  color: #10b981;
}

.info-value.warning {
  color: #f59e0b;
}

.info-value.error {
  color: #ef4444;
}

.features-test {
  margin-bottom: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.feature-item {
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.feature-item.supported {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feature-name {
  font-weight: 600;
}

.feature-status {
  font-size: 0.875rem;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e5e7eb;
}

.feature-item.supported .feature-status {
  background-color: #dcfce7;
  color: #166534;
}

.feature-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-value {
  color: #6b7280;
}

.detail-value.supported {
  color: #059669;
}

.test-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 600;
}

.summary-value.success {
  color: #10b981;
}

.summary-value.error {
  color: #ef4444;
}

.summary-value.warning {
  color: #f59e0b;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.test-item {
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.test-item.passed {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.test-item.failed {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.test-item.skipped {
  border-color: #6b7280;
  background-color: #f3f4f6;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-name {
  font-weight: 600;
}

.test-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 10px;
}

.test-status {
  font-size: 0.875rem;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e5e7eb;
}

.test-item.passed .test-status {
  background-color: #dcfce7;
  color: #166534;
}

.test-item.failed .test-status {
  background-color: #fee2e2;
  color: #991b1b;
}

.test-item.skipped .test-status {
  background-color: #f3f4f6;
  color: #4b5563;
}

.test-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.test-error {
  margin-top: 10px;
  padding: 8px;
  background-color: #fee2e2;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #991b1b;
}

.issues-section {
  margin-top: 20px;
}

.issues-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.issue-item {
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.issue-item.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.issue-item.warning {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.issue-type {
  font-weight: 600;
}

.issue-severity {
  font-size: 0.875rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.issue-item.error .issue-severity {
  background-color: #fee2e2;
  color: #991b1b;
}

.issue-item.warning .issue-severity {
  background-color: #fef3c7;
  color: #92400e;
}

.issue-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.issue-category {
  font-size: 0.875rem;
  color: #6b7280;
}

.issue-feature {
  font-weight: 600;
}

.issue-details {
  font-size: 0.875rem;
  color: #4b5563;
}

.export-controls {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  background-color: #a9a9a9;
  cursor: not-allowed;
}

.export-status {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.export-status.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.export-status.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.export-status.exporting {
  background-color: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
}
</style> 