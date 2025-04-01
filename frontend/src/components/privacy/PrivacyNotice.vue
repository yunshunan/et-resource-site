<template>
  <div v-if="showNotice" class="privacy-notice">
    <div class="privacy-notice__content">
      <div class="privacy-notice__header">
        <h2 class="privacy-notice__title">隐私政策更新</h2>
        <button class="privacy-notice__close" @click="closeNotice">
          <i class="el-icon-close"></i>
        </button>
      </div>
      
      <div class="privacy-notice__body">
        <p class="privacy-notice__message">
          我们更新了隐私政策，以更好地保护您的个人信息。请查看并确认您的隐私设置。
        </p>
        
        <div class="privacy-notice__version">
          <span>当前版本：{{ currentVersion }}</span>
          <span>上次更新：{{ lastUpdated }}</span>
        </div>
        
        <div class="privacy-notice__actions">
          <el-button type="primary" @click="acceptAll" class="privacy-notice__accept-all">
            接受所有设置
          </el-button>
          <el-button @click="customizeSettings" class="privacy-notice__customize">
            自定义设置
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { usePrivacyStore } from '@/stores/privacy'
import { ElMessage } from 'element-plus'

export default {
  name: 'PrivacyNotice',
  
  setup() {
    const privacyStore = usePrivacyStore()
    const showNotice = ref(false)
    const currentVersion = ref('')
    const lastUpdated = ref('')
    
    onMounted(async () => {
      const settings = await privacyStore.getPrivacySettings()
      const lastAcceptedVersion = localStorage.getItem('lastAcceptedVersion')
      const policyVersion = localStorage.getItem('privacyPolicyVersion')
      
      if (policyVersion && (!lastAcceptedVersion || lastAcceptedVersion !== policyVersion)) {
        showNotice.value = true
        currentVersion.value = policyVersion
        lastUpdated.value = new Date().toLocaleDateString()
      }
    })
    
    const closeNotice = () => {
      showNotice.value = false
    }
    
    const acceptAll = async () => {
      try {
        await privacyStore.updatePrivacySettings({
          analytics: true,
          marketing: true,
          performance: true
        })
        localStorage.setItem('lastAcceptedVersion', currentVersion.value)
        showNotice.value = false
        ElMessage.success('已更新隐私设置')
      } catch (error) {
        ElMessage.error('更新设置失败，请重试')
      }
    }
    
    const customizeSettings = () => {
      // Navigate to privacy settings page
      router.push('/privacy/settings')
    }
    
    return {
      showNotice,
      currentVersion,
      lastUpdated,
      closeNotice,
      acceptAll,
      customizeSettings
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-notice {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  &__content {
    padding: 20px;
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  &__title {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }
  
  &__close {
    background: none;
    border: none;
    cursor: pointer;
    color: #909399;
    font-size: 20px;
    
    &:hover {
      color: #409EFF;
    }
  }
  
  &__body {
    color: #606266;
  }
  
  &__message {
    margin: 0 0 16px;
    line-height: 1.5;
  }
  
  &__version {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 14px;
    color: #909399;
  }
  
  &__actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
  }
  
  &__accept-all {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
    
    &:hover {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }
  
  &__customize {
    background-color: #fff;
    border-color: #dcdfe6;
    color: #606266;
    
    &:hover {
      color: #409EFF;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }
  }
}
</style> 