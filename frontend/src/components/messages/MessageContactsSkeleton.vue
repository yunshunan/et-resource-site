<template>
  <div class="message-contacts-skeleton">
    <!-- 搜索框占位 -->
    <div class="skeleton-search-bar p-3 border-bottom">
      <div class="placeholder-glow w-100">
        <div class="placeholder col-12" style="height: 38px; border-radius: 4px;"></div>
      </div>
    </div>
    
    <!-- 联系人列表占位 -->
    <div class="skeleton-contacts p-3">
      <div v-for="i in 5" :key="i" class="skeleton-contact mb-3 d-flex align-items-start">
        <!-- 头像占位 -->
        <div class="placeholder-glow me-2">
          <div class="placeholder rounded-circle" style="width: 40px; height: 40px;"></div>
        </div>
        
        <!-- 联系人信息占位 -->
        <div class="skeleton-contact-info flex-grow-1">
          <div class="placeholder-glow d-flex justify-content-between mb-2">
            <div class="placeholder col-4" style="height: 18px;"></div>
            <div class="placeholder col-2" style="height: 14px;"></div>
          </div>
          <div class="placeholder-glow">
            <div class="placeholder col-8" style="height: 16px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageContactsSkeleton'
}
</script>

<style scoped>
.message-contacts-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.skeleton-search-bar {
  flex-shrink: 0;
}

.skeleton-contacts {
  flex: 1;
  overflow-y: auto;
}

.placeholder {
  animation: placeholder-glow 2s ease-in-out infinite;
  background-color: #dee2e6;
  opacity: 0.7;
}

@keyframes placeholder-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}
</style> 