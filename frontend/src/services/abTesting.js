import { analyticsService } from './analytics'
import { useUserStore } from '@/stores/user'

class ABTestingService {
  constructor() {
    this.userStore = useUserStore()
    this.experiments = new Map()
    this.variants = new Map()
    this.loadExperiments()
  }

  // 加载实验配置
  async loadExperiments() {
    try {
      const response = await fetch('/api/ab-testing/experiments')
      const experiments = await response.json()
      
      experiments.forEach(experiment => {
        this.experiments.set(experiment.id, experiment)
        this.variants.set(experiment.id, this.assignVariant(experiment))
      })
    } catch (error) {
      console.error('Failed to load experiments:', error)
    }
  }

  // 分配变体
  assignVariant(experiment) {
    const userId = this.userStore.user?.id
    if (!userId) return null

    // 使用用户ID和实验ID生成确定性哈希
    const hash = this.hashString(`${userId}-${experiment.id}`)
    const value = hash % 100

    // 根据权重分配变体
    let cumulativeWeight = 0
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight
      if (value < cumulativeWeight) {
        return variant.id
      }
    }

    return experiment.variants[0].id
  }

  // 生成字符串哈希
  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  // 获取实验变体
  getVariant(experimentId) {
    return this.variants.get(experimentId)
  }

  // 检查是否在实验中
  isInExperiment(experimentId) {
    return this.experiments.has(experimentId)
  }

  // 记录实验事件
  trackExperimentEvent(experimentId, eventName, data = {}) {
    const variant = this.getVariant(experimentId)
    if (!variant) return

    analyticsService.trackUserInteraction('experiment_event', {
      experimentId,
      variant,
      eventName,
      ...data
    })
  }

  // 获取实验数据
  async getExperimentData(experimentId) {
    try {
      const response = await fetch(`/api/ab-testing/experiments/${experimentId}/data`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get experiment data:', error)
      return null
    }
  }

  // 创建新实验
  async createExperiment(experiment) {
    try {
      const response = await fetch('/api/ab-testing/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(experiment)
      })
      
      const newExperiment = await response.json()
      this.experiments.set(newExperiment.id, newExperiment)
      this.variants.set(newExperiment.id, this.assignVariant(newExperiment))
      
      return newExperiment
    } catch (error) {
      console.error('Failed to create experiment:', error)
      throw error
    }
  }

  // 更新实验
  async updateExperiment(experimentId, updates) {
    try {
      const response = await fetch(`/api/ab-testing/experiments/${experimentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      const updatedExperiment = await response.json()
      this.experiments.set(experimentId, updatedExperiment)
      
      return updatedExperiment
    } catch (error) {
      console.error('Failed to update experiment:', error)
      throw error
    }
  }

  // 结束实验
  async endExperiment(experimentId) {
    try {
      await fetch(`/api/ab-testing/experiments/${experimentId}/end`, {
        method: 'POST'
      })
      
      this.experiments.delete(experimentId)
      this.variants.delete(experimentId)
    } catch (error) {
      console.error('Failed to end experiment:', error)
      throw error
    }
  }

  // 获取所有实验
  getExperiments() {
    return Array.from(this.experiments.values())
  }

  // 获取实验统计
  async getExperimentStats(experimentId) {
    try {
      const response = await fetch(`/api/ab-testing/experiments/${experimentId}/stats`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get experiment stats:', error)
      return null
    }
  }
}

export const abTestingService = new ABTestingService() 