<template>
  <div class="message-detail-skeleton h-100 d-flex flex-column">
    <!-- 聊天头部占位 -->
    <div class="skeleton-header p-3 border-bottom d-flex align-items-center">
      <div class="placeholder-glow me-2">
        <div class="placeholder rounded-circle" style="width: 40px; height: 40px;"></div>
      </div>
      <div class="flex-grow-1">
        <div class="placeholder-glow mb-1">
          <div class="placeholder col-4" style="height: 18px;"></div>
        </div>
        <div class="placeholder-glow">
          <div class="placeholder col-3" style="height: 14px;"></div>
        </div>
      </div>
      <div class="placeholder-glow ms-2">
        <div class="placeholder" style="width: 24px; height: 24px; border-radius: 50%;"></div>
      </div>
    </div>
    
    <!-- 消息区域占位 -->
    <div class="skeleton-messages flex-grow-1 p-3">
      <!-- 日期分隔占位 -->
      <div class="date-separator-skeleton mb-3">
        <div class="placeholder-glow d-inline-block">
          <div class="placeholder" style="width: 80px; height: 20px; border-radius: 10px;"></div>
        </div>
      </div>
      
      <!-- 左侧消息气泡占位 -->
      <div class="skeleton-message mb-3 d-flex skeleton-left-message">
        <div class="message-avatar placeholder-glow me-2 align-self-end">
          <div class="placeholder rounded-circle" style="width: 28px; height: 28px;"></div>
        </div>
        <div class="placeholder-glow d-flex flex-column" style="max-width: 60%;">
          <div class="placeholder message-bubble-left" style="min-width: 120px; height: 80px;"></div>
          <div class="placeholder-glow mt-1 align-self-start">
            <div class="placeholder" style="width: 50px; height: 12px;"></div>
          </div>
        </div>
      </div>
      
      <!-- 右侧消息气泡占位 -->
      <div class="skeleton-message mb-3 d-flex justify-content-end skeleton-right-message">
        <div class="placeholder-glow d-flex flex-column align-items-end" style="max-width: 60%;">
          <div class="placeholder message-bubble-right" style="min-width: 150px; height: 60px;"></div>
          <div class="placeholder-glow mt-1 d-flex">
            <div class="placeholder me-1" style="width: 50px; height: 12px;"></div>
            <div class="placeholder" style="width: 12px; height: 12px; border-radius: 50%;"></div>
          </div>
        </div>
      </div>
      
      <!-- 左侧短消息气泡占位 -->
      <div class="skeleton-message mb-3 d-flex skeleton-left-message">
        <div class="message-avatar placeholder-glow me-2 align-self-end">
          <div class="placeholder rounded-circle" style="width: 28px; height: 28px;"></div>
        </div>
        <div class="placeholder-glow d-flex flex-column" style="max-width: 60%;">
          <div class="placeholder message-bubble-left" style="min-width: 80px; height: 40px;"></div>
          <div class="placeholder-glow mt-1 align-self-start">
            <div class="placeholder" style="width: 50px; height: 12px;"></div>
          </div>
        </div>
      </div>
      
      <!-- 左侧小消息气泡占位 -->
      <div class="skeleton-message mb-3 d-flex skeleton-left-message">
        <div class="message-avatar placeholder-glow me-2 align-self-end opacity-0">
          <div class="placeholder rounded-circle" style="width: 28px; height: 28px;"></div>
        </div>
        <div class="placeholder-glow d-flex flex-column" style="max-width: 60%;">
          <div class="placeholder message-bubble-left" style="min-width: 40px; height: 40px;"></div>
          <div class="placeholder-glow mt-1 align-self-start">
            <div class="placeholder" style="width: 50px; height: 12px;"></div>
          </div>
        </div>
      </div>
      
      <!-- 右侧长消息气泡占位 -->
      <div class="skeleton-message mb-3 d-flex justify-content-end skeleton-right-message">
        <div class="placeholder-glow d-flex flex-column align-items-end" style="max-width: 60%;">
          <div class="placeholder message-bubble-right" style="min-width: 180px; height: 100px;"></div>
          <div class="placeholder-glow mt-1 d-flex">
            <div class="placeholder me-1" style="width: 50px; height: 12px;"></div>
            <div class="placeholder" style="width: 12px; height: 12px; border-radius: 50%;"></div>
          </div>
        </div>
      </div>
      
      <!-- 右侧消息气泡占位 - 模拟正在输入 -->
      <div class="skeleton-message mb-3 d-flex justify-content-end skeleton-right-message-typing">
        <div class="placeholder-glow d-flex flex-column align-items-end" style="max-width: 60%;">
          <div class="placeholder message-bubble-right typing-bubble" style="min-width: 80px; height: 40px;">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域占位 -->
    <div class="skeleton-input p-3 border-top">
      <div class="d-flex">
        <div class="placeholder-glow me-2">
          <div class="placeholder" style="width: 36px; height: 36px; border-radius: 50%;"></div>
        </div>
        <div class="placeholder-glow me-2">
          <div class="placeholder" style="width: 36px; height: 36px; border-radius: 50%;"></div>
        </div>
        <div class="placeholder-glow flex-grow-1">
          <div class="placeholder" style="height: 38px; border-radius: 20px;"></div>
        </div>
        <div class="placeholder-glow ms-2">
          <div class="placeholder" style="width: 60px; height: 38px; border-radius: 20px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageDetailSkeleton'
}
</script>

<style scoped>
.message-detail-skeleton {
  background-color: #f8f9fa;
  height: 100%;
}

.skeleton-header {
  background-color: #fff;
}

.skeleton-messages {
  height: 0; /* 让flex-grow控制高度 */
  overflow-y: auto;
}

.skeleton-input {
  background-color: #fff;
}

.skeleton-message {
  animation-delay: 0.1s;
}

.message-bubble-left {
  border-radius: 18px;
  border-top-left-radius: 4px;
  animation-delay: 0.2s;
}

.message-bubble-right {
  border-radius: 18px;
  border-top-right-radius: 4px;
  background-color: rgba(13, 110, 253, 0.2) !important;
  animation-delay: 0.3s;
}

.date-separator-skeleton {
  text-align: center;
  position: relative;
  margin: 20px 0;
}

.placeholder {
  animation: placeholder-glow 2s ease-in-out infinite;
  background-color: #dee2e6;
  opacity: 0.7;
}

.skeleton-left-message {
  animation: fade-in 0.5s ease-in-out forwards;
  opacity: 0;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.skeleton-right-message {
  animation: fade-in 0.5s ease-in-out forwards;
  opacity: 0;
  animation-delay: calc(var(--index, 0) * 0.1s + 0.2s);
}

.skeleton-left-message:nth-child(3) {
  --index: 1;
}

.skeleton-right-message:nth-child(4) {
  --index: 2;
}

.skeleton-left-message:nth-child(5) {
  --index: 3;
}

.skeleton-left-message:nth-child(6) {
  --index: 4;
}

.skeleton-right-message:nth-child(7) {
  --index: 5;
}

.typing-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-dots {
  display: flex;
  align-items: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: rgba(13, 110, 253, 0.4);
  border-radius: 50%;
  display: inline-block;
  animation: typing-dot 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes placeholder-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing-dot {
  0%, 80%, 100% {
    transform: scale(0.7);
  }
  40% {
    transform: scale(1);
  }
}
</style> 