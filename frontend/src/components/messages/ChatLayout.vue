<template>
  <div class="chat-layout">
    <div class="row g-0 h-100">
      <!-- 移动端 返回按钮 -->
      <transition name="fade">
        <div 
          v-if="showMobileNavigation" 
          class="mobile-navigation d-md-none"
        >
          <button 
            class="btn btn-outline-secondary"
            @click="showMobileSidebar = true"
          >
            <i class="fas fa-arrow-left me-2"></i>
            返回列表
          </button>
        </div>
      </transition>
      
      <!-- 侧边栏 -->
      <transition name="slide">
        <div 
          v-if="!isMobile || showMobileSidebar" 
          class="col-12 col-md-4 col-lg-3 h-100 sidebar-container"
        >
          <message-sidebar 
            :active-chat-id="activeChatId" 
            @select-chat="selectChat"
            @new-chat="createNewChat"
          />
        </div>
      </transition>
      
      <!-- 消息详情 -->
      <transition name="fade">
        <div 
          v-if="!isMobile || !showMobileSidebar" 
          class="col-12 col-md-8 col-lg-9 h-100 detail-container"
        >
          <div v-if="!activeChatId && !isMobile" class="empty-state">
            <div class="text-center">
              <i class="fas fa-comments fa-4x text-muted mb-4"></i>
              <h4>选择一个聊天或开始新的对话</h4>
              <p class="text-muted">从左侧边栏选择一个聊天，或者点击"新建聊天"按钮开始新的对话</p>
              <button 
                class="btn btn-primary mt-3"
                @click="createNewChat"
              >
                <i class="fas fa-plus me-2"></i>
                新建聊天
              </button>
            </div>
          </div>
          <message-detail 
            v-else
            :chat-id="activeChatId"
            :mobile="isMobile"
            @back="showMobileSidebar = true"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MessageSidebar from './MessageSidebar.vue'
import MessageDetail from './MessageDetail.vue'

export default {
  name: 'ChatLayout',
  components: {
    MessageSidebar,
    MessageDetail
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 响应式状态
    const windowWidth = ref(window.innerWidth)
    const showMobileSidebar = ref(true)
    const activeChatId = ref(null)
    
    // 计算属性
    const isMobile = computed(() => windowWidth.value < 768)
    const showMobileNavigation = computed(() => 
      isMobile.value && !showMobileSidebar.value && activeChatId.value
    )
    
    // 方法
    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth
    }
    
    const selectChat = (chatId) => {
      activeChatId.value = chatId
      
      // 移动端切换到详情页
      if (isMobile.value) {
        showMobileSidebar.value = false
      }
      
      // 更新URL
      router.push({ 
        name: 'messages', 
        params: { id: chatId } 
      })
    }
    
    const createNewChat = () => {
      // 这里应该实现新建聊天的逻辑
      // 例如打开联系人选择弹窗等
      const newChatId = '1' // 模拟新聊天ID
      selectChat(newChatId)
    }
    
    // 生命周期钩子
    onMounted(() => {
      window.addEventListener('resize', updateWindowWidth)
      
      // 从URL获取聊天ID
      const chatId = route.params.id
      if (chatId) {
        activeChatId.value = chatId
        
        // 移动端直接显示详情页
        if (isMobile.value) {
          showMobileSidebar.value = false
        }
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', updateWindowWidth)
    })
    
    // 监听路由变化
    watch(() => route.params.id, (newId) => {
      if (newId) {
        activeChatId.value = newId
        
        // 移动端切换到详情页
        if (isMobile.value) {
          showMobileSidebar.value = false
        }
      } else {
        activeChatId.value = null
        
        // 移动端切换到侧边栏
        if (isMobile.value) {
          showMobileSidebar.value = true
        }
      }
    })
    
    return {
      isMobile,
      showMobileSidebar,
      activeChatId,
      showMobileNavigation,
      selectChat,
      createNewChat
    }
  }
}
</script>

<style scoped>
.chat-layout {
  height: calc(100vh - 56px);
  overflow: hidden;
}

.sidebar-container, 
.detail-container {
  overflow: hidden;
  position: relative;
}

.sidebar-container {
  border-right: 1px solid #dee2e6;
  z-index: 2;
}

.detail-container {
  z-index: 1;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.mobile-navigation {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
}

/* 移动端动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (max-width: 767px) {
  .sidebar-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
  }
}
</style> 