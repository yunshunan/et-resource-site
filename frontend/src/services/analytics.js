import axios from 'axios'
import { useUserStore } from '@/stores/user'

class AnalyticsService {
  constructor() {
    this.userStore = useUserStore()
    this.batchSize = 10
    this.eventQueue = []
    this.flushInterval = 5000 // 5秒
    this.startFlushInterval()
  }

  // 追踪页面访问
  trackPageView(page, duration) {
    this.queueEvent({
      type: 'pageview',
      page,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  // 追踪用户交互
  trackUserInteraction(action, target, value = null) {
    this.queueEvent({
      type: 'interaction',
      action,
      target,
      value,
      timestamp: new Date().toISOString()
    })
  }

  // 追踪性能指标
  trackPerformance(metrics) {
    this.queueEvent({
      type: 'performance',
      metrics,
      timestamp: new Date().toISOString()
    })
  }

  // 追踪错误
  trackError(error, context = {}) {
    this.queueEvent({
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    })
  }

  // 追踪资源加载
  trackResourceLoad(resource) {
    this.queueEvent({
      type: 'resource',
      resource: {
        name: resource.name,
        type: resource.type,
        size: resource.size,
        duration: resource.duration
      },
      timestamp: new Date().toISOString()
    })
  }

  // 追踪API调用
  trackApiCall(endpoint, method, duration, status) {
    this.queueEvent({
      type: 'api',
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString()
    })
  }

  // 将事件加入队列
  queueEvent(event) {
    const user = this.userStore.user
    if (user) {
      event.userId = user.id
    }
    
    this.eventQueue.push(event)
    
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents()
    }
  }

  // 开始定期刷新事件队列
  startFlushInterval() {
    setInterval(() => {
      this.flushEvents()
    }, this.flushInterval)
  }

  // 刷新事件队列
  async flushEvents() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      await axios.post('/api/analytics/events', {
        events,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to send analytics events:', error)
      // 如果发送失败，将事件重新加入队列
      this.eventQueue = [...events, ...this.eventQueue]
    }
  }

  // 获取用户行为报告
  async getUserBehaviorReport(startDate, endDate) {
    try {
      const response = await axios.get('/api/analytics/behavior', {
        params: {
          startDate,
          endDate
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get user behavior report:', error)
      throw error
    }
  }

  // 获取性能报告
  async getPerformanceReport(startDate, endDate) {
    try {
      const response = await axios.get('/api/analytics/performance', {
        params: {
          startDate,
          endDate
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get performance report:', error)
      throw error
    }
  }

  // 获取错误报告
  async getErrorReport(startDate, endDate) {
    try {
      const response = await axios.get('/api/analytics/errors', {
        params: {
          startDate,
          endDate
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get error report:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService() 