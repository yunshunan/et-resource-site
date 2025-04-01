<template>
  <div class="network-debugger" v-if="isDevMode">
    <div class="network-debugger-toggle" @click="togglePanel">
      <i class="bi" :class="isOpen ? 'bi-wifi-off' : 'bi-wifi'"></i>
    </div>
    
    <div v-if="isOpen" class="network-debugger-panel">
      <div class="network-debugger-header">
        <h5>网络模拟器</h5>
        <button class="btn-close" @click="togglePanel"></button>
      </div>
      
      <div class="network-debugger-body">
        <div class="form-check form-switch mb-3">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="enableSimulator" 
            v-model="settings.enabled"
            @change="updateSettings"
          >
          <label class="form-check-label" for="enableSimulator">
            启用网络模拟
          </label>
        </div>
        
        <div class="form-check form-switch mb-3">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="onlineStatus" 
            v-model="settings.online"
            @change="updateSettings"
            :disabled="!settings.enabled"
          >
          <label class="form-check-label" for="onlineStatus">
            保持在线
          </label>
        </div>
        
        <div class="mb-3">
          <label class="form-label">网络延迟 (毫秒)</label>
          <div class="d-flex align-items-center gap-2">
            <input 
              type="number" 
              class="form-control form-control-sm" 
              v-model.number="settings.delayRange[0]"
              :disabled="!settings.enabled"
              min="0"
              max="10000"
              @change="updateSettings"
            >
            <span>-</span>
            <input 
              type="number" 
              class="form-control form-control-sm" 
              v-model.number="settings.delayRange[1]"
              :disabled="!settings.enabled"
              min="0"
              max="10000"
              @change="updateSettings"
            >
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">请求失败率 ({{ Math.round(settings.failureRate * 100) }}%)</label>
          <input 
            type="range" 
            class="form-range" 
            min="0" 
            max="1" 
            step="0.05"
            v-model.number="settings.failureRate"
            :disabled="!settings.enabled"
            @change="updateSettings"
          >
        </div>
        
        <div class="mb-3">
          <label class="form-label">请求超时率 ({{ Math.round(settings.timeoutRate * 100) }}%)</label>
          <input 
            type="range" 
            class="form-range" 
            min="0" 
            max="1" 
            step="0.05"
            v-model.number="settings.timeoutRate"
            :disabled="!settings.enabled"
            @change="updateSettings"
          >
        </div>
        
        <div class="mb-3">
          <label class="form-label">超时时间 (毫秒)</label>
          <input 
            type="number" 
            class="form-control form-control-sm" 
            v-model.number="settings.timeoutDuration"
            :disabled="!settings.enabled"
            min="1000"
            max="60000"
            @change="updateSettings"
          >
        </div>
        
        <div class="network-debugger-presets">
          <button 
            class="btn btn-sm btn-success me-2" 
            @click="applyStrongNetwork"
            :disabled="!settings.enabled"
          >
            良好网络
          </button>
          <button 
            class="btn btn-sm btn-warning me-2" 
            @click="applyWeakNetwork"
            :disabled="!settings.enabled"
          >
            弱网环境
          </button>
          <button 
            class="btn btn-sm btn-danger" 
            @click="applyOfflineNetwork"
            :disabled="!settings.enabled"
          >
            断网环境
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import * as networkSimulator from '@/utils/networkSimulator'

export default {
  name: 'NetworkDebugger',
  setup() {
    const isDevMode = ref(process.env.NODE_ENV === 'development')
    const isOpen = ref(false)
    const settings = reactive({
      enabled: false,
      delayRange: [200, 1000],
      failureRate: 0,
      timeoutRate: 0,
      timeoutDuration: 5000,
      online: true
    })
    
    // 初始化时获取当前网络状态
    onMounted(() => {
      const state = networkSimulator.getNetworkState()
      Object.assign(settings, state)
    })
    
    // 切换控制面板显示
    const togglePanel = () => {
      isOpen.value = !isOpen.value
    }
    
    // 更新网络设置
    const updateSettings = () => {
      networkSimulator.configureNetworkSimulator(settings)
    }
    
    // 应用良好网络预设
    const applyStrongNetwork = () => {
      const state = networkSimulator.setStrongNetworkCondition()
      Object.assign(settings, state)
    }
    
    // 应用弱网络预设
    const applyWeakNetwork = () => {
      const state = networkSimulator.setWeakNetworkCondition()
      Object.assign(settings, state)
    }
    
    // 应用断网环境预设
    const applyOfflineNetwork = () => {
      settings.online = false
      networkSimulator.setOnlineStatus(false)
    }
    
    return {
      isDevMode,
      isOpen,
      settings,
      togglePanel,
      updateSettings,
      applyStrongNetwork,
      applyWeakNetwork,
      applyOfflineNetwork
    }
  }
}
</script>

<style scoped>
.network-debugger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.network-debugger-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.network-debugger-toggle:hover {
  background-color: #1d4ed8;
}

.network-debugger-toggle i {
  font-size: 1.5rem;
}

.network-debugger-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.network-debugger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.network-debugger-header h5 {
  margin: 0;
  font-size: 1rem;
}

.network-debugger-body {
  padding: 16px;
}

.network-debugger-presets {
  margin-top: 20px;
  display: flex;
}
</style> 