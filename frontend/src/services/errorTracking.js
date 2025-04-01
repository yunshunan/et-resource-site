import { analyticsService } from './analytics'
import { useUserStore } from '@/stores/user'

class ErrorTrackingService {
  constructor() {
    this.userStore = useUserStore()
    this.errorCount = 0
    this.maxErrorsPerMinute = 10
    this.errorWindow = []
    this.setupErrorHandlers()
  }

  // 设置错误处理器
  setupErrorHandlers() {
    // 全局错误处理
    window.onerror = (message, source, lineno, colno, error) => {
      this.trackError({
        type: 'global',
        message,
        source,
        lineno,
        colno,
        error
      })
    }

    // Promise 错误处理
    window.onunhandledrejection = (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason
      })
    }

    // Vue 错误处理
    window.onVueError = (error, vm, info) => {
      this.trackError({
        type: 'vue',
        message: error.message,
        error,
        component: vm?.$options?.name,
        info
      })
    }
  }

  // 追踪错误
  trackError(errorData) {
    // 检查错误频率限制
    if (!this.checkErrorRate()) {
      console.warn('Error rate limit exceeded, skipping error tracking')
      return
    }

    const error = {
      ...errorData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userStore.user?.id
    }

    // 发送到分析服务
    analyticsService.trackError(error)

    // 记录到本地存储
    this.logError(error)

    // 更新错误计数
    this.errorCount++
    this.errorWindow.push(Date.now())

    // 清理过期的错误记录
    this.cleanErrorWindow()
  }

  // 检查错误频率
  checkErrorRate() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // 清理过期的错误记录
    this.errorWindow = this.errorWindow.filter(timestamp => timestamp > oneMinuteAgo)

    // 检查是否超过限制
    return this.errorWindow.length < this.maxErrorsPerMinute
  }

  // 清理错误窗口
  cleanErrorWindow() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    this.errorWindow = this.errorWindow.filter(timestamp => timestamp > oneMinuteAgo)
  }

  // 记录错误到本地存储
  logError(error) {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]')
      logs.push(error)
      
      // 只保留最近的100条错误记录
      if (logs.length > 100) {
        logs.shift()
      }
      
      localStorage.setItem('error_logs', JSON.stringify(logs))
    } catch (e) {
      console.error('Failed to log error:', e)
    }
  }

  // 获取错误日志
  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]')
    } catch (e) {
      console.error('Failed to get error logs:', e)
      return []
    }
  }

  // 清除错误日志
  clearErrorLogs() {
    try {
      localStorage.removeItem('error_logs')
    } catch (e) {
      console.error('Failed to clear error logs:', e)
    }
  }

  // 获取错误统计
  getErrorStats() {
    const logs = this.getErrorLogs()
    const now = Date.now()
    const oneHourAgo = now - 3600000
    const oneDayAgo = now - 86400000

    return {
      total: logs.length,
      lastHour: logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo).length,
      lastDay: logs.filter(log => new Date(log.timestamp).getTime() > oneDayAgo).length,
      byType: this.groupErrorsByType(logs),
      byComponent: this.groupErrorsByComponent(logs)
    }
  }

  // 按类型分组错误
  groupErrorsByType(logs) {
    return logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {})
  }

  // 按组件分组错误
  groupErrorsByComponent(logs) {
    return logs.reduce((acc, log) => {
      if (log.component) {
        acc[log.component] = (acc[log.component] || 0) + 1
      }
      return acc
    }, {})
  }
}

export const errorTrackingService = new ErrorTrackingService() 