import { defineStore } from 'pinia'
import axios from 'axios'

export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    metrics: {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      interactiveTime: 0,
      resourceLoadTime: 0,
      pageLoadTimeTrend: 0,
      fcpTrend: 0,
      interactiveTimeTrend: 0,
      resourceLoadTimeTrend: 0
    },
    trends: {
      labels: [],
      pageLoadTimes: [],
      fcpTimes: [],
      interactiveTimes: [],
      resourceLoadTimes: []
    },
    resourceLoads: {
      js: 0,
      css: 0,
      images: 0,
      other: 0
    },
    interactions: {
      labels: [],
      responseTimes: []
    },
    issues: [],
    lastUpdate: null
  }),

  getters: {
    hasPerformanceIssues: (state) => state.issues.length > 0,
    criticalIssues: (state) => state.issues.filter(issue => issue.severity === 'critical'),
    warningIssues: (state) => state.issues.filter(issue => issue.severity === 'warning'),
    infoIssues: (state) => state.issues.filter(issue => issue.severity === 'info')
  },

  actions: {
    async fetchPerformanceData() {
      try {
        const response = await axios.get('/api/performance/metrics')
        const data = response.data
        
        // 更新指标
        this.metrics = {
          ...this.metrics,
          ...data.metrics
        }
        
        // 更新趋势数据
        this.trends = {
          ...this.trends,
          ...data.trends
        }
        
        // 更新资源加载数据
        this.resourceLoads = data.resourceLoads
        
        // 更新交互数据
        this.interactions = data.interactions
        
        // 更新问题列表
        this.issues = data.issues
        
        // 更新最后更新时间
        this.lastUpdate = new Date()
        
        return data
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
        throw error
      }
    },

    async reportPerformanceIssue(issue) {
      try {
        const response = await axios.post('/api/performance/issues', issue)
        this.issues.unshift(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to report performance issue:', error)
        throw error
      }
    },

    async exportPerformanceReport(format = 'pdf') {
      try {
        const response = await axios.get(`/api/performance/report?format=${format}`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `performance-report-${new Date().toISOString()}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        return true
      } catch (error) {
        console.error('Failed to export performance report:', error)
        throw error
      }
    },

    clearPerformanceData() {
      this.metrics = {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        interactiveTime: 0,
        resourceLoadTime: 0,
        pageLoadTimeTrend: 0,
        fcpTrend: 0,
        interactiveTimeTrend: 0,
        resourceLoadTimeTrend: 0
      }
      this.trends = {
        labels: [],
        pageLoadTimes: [],
        fcpTimes: [],
        interactiveTimes: [],
        resourceLoadTimes: []
      }
      this.resourceLoads = {
        js: 0,
        css: 0,
        images: 0,
        other: 0
      }
      this.interactions = {
        labels: [],
        responseTimes: []
      }
      this.issues = []
      this.lastUpdate = null
    }
  }
}) 