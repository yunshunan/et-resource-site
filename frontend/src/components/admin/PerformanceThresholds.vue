<template>
  <div class="performance-thresholds">
    <div class="header">
      <h3>性能指标配置</h3>
      <p>配置性能监控的阈值和告警规则</p>
    </div>

    <div class="thresholds-content">
      <div class="threshold-section">
        <h4>页面加载性能</h4>
        <div class="threshold-group">
          <div class="threshold-item">
            <label>首次内容绘制 (FCP)</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.fcp.warning"
                min="0"
                step="100"
              >
              <span>ms (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.fcp.error"
                min="0"
                step="100"
              >
              <span>ms (错误)</span>
            </div>
          </div>

          <div class="threshold-item">
            <label>最大内容绘制 (LCP)</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.lcp.warning"
                min="0"
                step="100"
              >
              <span>ms (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.lcp.error"
                min="0"
                step="100"
              >
              <span>ms (错误)</span>
            </div>
          </div>

          <div class="threshold-item">
            <label>首次输入延迟 (FID)</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.fid.warning"
                min="0"
                step="10"
              >
              <span>ms (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.fid.error"
                min="0"
                step="10"
              >
              <span>ms (错误)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="threshold-section">
        <h4>资源加载性能</h4>
        <div class="threshold-group">
          <div class="threshold-item">
            <label>资源加载时间</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.resourceLoad.warning"
                min="0"
                step="100"
              >
              <span>ms (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.resourceLoad.error"
                min="0"
                step="100"
              >
              <span>ms (错误)</span>
            </div>
          </div>

          <div class="threshold-item">
            <label>资源大小限制</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.resourceSize.warning"
                min="0"
                step="100"
              >
              <span>KB (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.resourceSize.error"
                min="0"
                step="100"
              >
              <span>KB (错误)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="threshold-section">
        <h4>API 性能</h4>
        <div class="threshold-group">
          <div class="threshold-item">
            <label>API 响应时间</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.apiResponse.warning"
                min="0"
                step="50"
              >
              <span>ms (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.apiResponse.error"
                min="0"
                step="50"
              >
              <span>ms (错误)</span>
            </div>
          </div>

          <div class="threshold-item">
            <label>API 错误率</label>
            <div class="threshold-inputs">
              <input 
                type="number" 
                v-model="thresholds.apiErrorRate.warning"
                min="0"
                max="100"
                step="1"
              >
              <span>% (警告)</span>
              <input 
                type="number" 
                v-model="thresholds.apiErrorRate.error"
                min="0"
                max="100"
                step="1"
              >
              <span>% (错误)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="threshold-section">
        <h4>告警规则</h4>
        <div class="alert-rules">
          <div class="alert-rule">
            <label>
              <input 
                type="checkbox" 
                v-model="alertRules.notifyOnWarning"
              >
              警告时通知
            </label>
          </div>
          <div class="alert-rule">
            <label>
              <input 
                type="checkbox" 
                v-model="alertRules.notifyOnError"
              >
              错误时通知
            </label>
          </div>
          <div class="alert-rule">
            <label>
              <input 
                type="checkbox" 
                v-model="alertRules.autoReport"
              >
              自动生成报告
            </label>
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          @click="saveThresholds"
          :disabled="isSaving"
          class="save-btn"
        >
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
        <button 
          @click="resetThresholds"
          class="reset-btn"
        >
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'PerformanceThresholds',
  setup() {
    const notificationStore = useNotificationStore()
    const isSaving = ref(false)

    const thresholds = reactive({
      fcp: { warning: 1800, error: 3000 },
      lcp: { warning: 2500, error: 4000 },
      fid: { warning: 100, error: 300 },
      resourceLoad: { warning: 1000, error: 2000 },
      resourceSize: { warning: 500, error: 1000 },
      apiResponse: { warning: 500, error: 1000 },
      apiErrorRate: { warning: 5, error: 10 }
    })

    const alertRules = reactive({
      notifyOnWarning: true,
      notifyOnError: true,
      autoReport: true
    })

    const loadThresholds = async () => {
      try {
        const response = await axios.get('/api/performance/thresholds')
        Object.assign(thresholds, response.data.thresholds)
        Object.assign(alertRules, response.data.alertRules)
      } catch (error) {
        console.error('加载性能阈值配置失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '加载失败',
          message: '加载性能阈值配置时发生错误'
        })
      }
    }

    const saveThresholds = async () => {
      try {
        isSaving.value = true
        await axios.post('/api/performance/thresholds', {
          thresholds,
          alertRules
        })
        notificationStore.addNotification({
          type: 'success',
          title: '保存成功',
          message: '性能阈值配置已更新'
        })
      } catch (error) {
        console.error('保存性能阈值配置失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '保存失败',
          message: '保存性能阈值配置时发生错误'
        })
      } finally {
        isSaving.value = false
      }
    }

    const resetThresholds = () => {
      loadThresholds()
    }

    onMounted(() => {
      loadThresholds()
    })

    return {
      thresholds,
      alertRules,
      isSaving,
      saveThresholds,
      resetThresholds
    }
  }
}
</script>

<style scoped>
.performance-thresholds {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h3 {
  margin: 0;
  color: #333;
}

.header p {
  margin: 10px 0 0;
  color: #666;
}

.threshold-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.threshold-section h4 {
  margin: 0 0 20px;
  color: #333;
}

.threshold-group {
  display: grid;
  gap: 20px;
}

.threshold-item {
  display: grid;
  gap: 10px;
}

.threshold-item label {
  font-weight: 500;
  color: #333;
}

.threshold-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.threshold-inputs input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.threshold-inputs span {
  color: #666;
}

.alert-rules {
  display: grid;
  gap: 15px;
}

.alert-rule {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-rule input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.save-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.save-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

@media (max-width: 768px) {
  .performance-thresholds {
    padding: 15px;
  }

  .threshold-inputs {
    flex-direction: column;
    align-items: flex-start;
  }

  .threshold-inputs input {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .save-btn,
  .reset-btn {
    width: 100%;
  }
}
</style> 