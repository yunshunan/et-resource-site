<template>
  <div class="messages-page">
    <CommonPageHeader title="消息中心">
      <div class="api-toggle d-flex align-items-center ms-auto">
        <span class="me-2 small text-muted">使用模拟数据</span>
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="apiToggle"
            v-model="useMockData"
            @change="toggleMockData"
          >
          <label class="form-check-label visually-hidden" for="apiToggle">使用模拟数据</label>
        </div>
      </div>
    </CommonPageHeader>
    
    <div class="container-fluid">
      <ErrorBoundary>
        <div class="row messages-container">
          <!-- 侧边栏，在移动端可折叠 -->
          <div 
            :class="[
              'sidebar-column col-md-4 col-lg-3 p-0 border-end', 
              { 'd-none d-md-block': showChat && isMobile }
            ]"
          >
            <template v-if="messagesStore.isLoadingContacts && !messagesStore.contacts.length">
              <MessageContactsSkeleton />
            </template>
            <template v-else>
              <MessageSidebar 
                :activeChatId="activeChatId" 
                @select-chat="selectChat"
              />
            </template>
          </div>
          
          <!-- 消息详情区域 -->
          <div 
            :class="[
              'detail-column col-md-8 col-lg-9 p-0', 
              { 'd-none': !showChat && isMobile }
            ]"
          >
            <template v-if="messagesStore.isLoadingMessages && !messagesStore.messagesWithUser(activeChatId).length">
              <MessageDetailSkeleton />
            </template>
            <template v-else>
              <MessageDetail 
                :chatId="activeChatId" 
                @back="handleBack"
              />
            </template>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import CommonPageHeader from '@/components/common/CommonPageHeader.vue'
import MessageSidebar from '@/components/messages/MessageSidebar.vue'
import MessageDetail from '@/components/messages/MessageDetail.vue'
import MessageContactsSkeleton from '@/components/messages/MessageContactsSkeleton.vue'
import MessageDetailSkeleton from '@/components/messages/MessageDetailSkeleton.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.js'

export default {
  name: 'MessagesPage',
  components: {
    CommonPageHeader,
    MessageSidebar,
    MessageDetail,
    MessageContactsSkeleton,
    MessageDetailSkeleton,
    ErrorBoundary
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const messagesStore = useMessagesStore()
    const authStore = useAuthStore()
    
    // 响应式状态
    const activeChatId = ref(null)
    const showChat = ref(false)
    const windowWidth = ref(window.innerWidth)
    const pollInterval = ref(5000) // 初始轮询间隔为5秒
    let pollTimer = null
    const useMockData = ref(true) // 默认使用模拟数据
    
    // 计算是否为移动端视图
    const isMobile = computed(() => windowWidth.value < 768)
    
    // 切换模拟数据/真实API
    const toggleMockData = () => {
      messagesStore.toggleMockData(useMockData.value)
      
      // 刷新数据
      if (authStore.isLoggedIn) {
        messagesStore.fetchContacts()
        if (activeChatId.value) {
          messagesStore.fetchMessages(activeChatId.value)
        }
      }
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    // 选择聊天
    const selectChat = (chatId) => {
      activeChatId.value = chatId
      showChat.value = true
      
      // 设置当前聊天
      messagesStore.setCurrentChat(chatId)
      
      // 加载该用户的消息
      messagesStore.fetchMessages(chatId)
      
      // 更新路由
      router.push({
        name: 'messages',
        params: { id: chatId }
      })
    }
    
    // 移动端返回到聊天列表
    const handleBack = () => {
      showChat.value = false
      
      // 更新路由为不带ID的消息页面
      router.push({ name: 'messages' })
    }
    
    // 启动消息轮询
    const setupPolling = () => {
      // 停止现有的轮询
      if (pollTimer) {
        clearTimeout(pollTimer)
      }
      
      // 定义轮询函数
      const pollMessages = () => {
        if (authStore.isLoggedIn) {
          messagesStore.checkForNewMessages()
        }
        pollTimer = setTimeout(pollMessages, pollInterval.value)
      }
      
      // 用户活跃时缩短轮询间隔
      const handleUserActivity = () => {
        pollInterval.value = 3000 // 活跃时3秒检查一次
        setTimeout(() => {
          pollInterval.value = 8000 // 一段时间无活动后8秒检查一次
        }, 60000) // 1分钟后降低频率
      }
      
      // 监听用户活动
      document.addEventListener('mousemove', handleUserActivity)
      document.addEventListener('keydown', handleUserActivity)
      document.addEventListener('click', handleUserActivity)
      
      // 开始轮询
      pollMessages()
      
      // 返回清理函数
      return () => {
        if (pollTimer) {
          clearTimeout(pollTimer)
        }
        document.removeEventListener('mousemove', handleUserActivity)
        document.removeEventListener('keydown', handleUserActivity)
        document.removeEventListener('click', handleUserActivity)
      }
    }
    
    // 在组件挂载时
    onMounted(() => {
      // 设置使用模拟数据的初始状态
      messagesStore.toggleMockData(useMockData.value)
      
      // 如果用户已登录，获取联系人列表
      if (authStore.isLoggedIn) {
        messagesStore.fetchContacts()
      }
      
      // 从路由参数中获取聊天ID
      const chatId = route.params.id
      if (chatId) {
        activeChatId.value = chatId
        showChat.value = true
        
        // 设置当前聊天
        messagesStore.setCurrentChat(chatId)
        
        // 加载该用户的消息
        messagesStore.fetchMessages(chatId)
      }
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
      
      // 启动消息轮询
      const cleanupPolling = setupPolling()
      
      // 清理过期缓存
      messagesStore.clearExpiredCache()
      
      // 保存清理函数以便在组件销毁时调用
      onUnmountedCleanup.value = cleanupPolling
    })
    
    // 存储清理函数的引用
    const onUnmountedCleanup = ref(null)
    
    // 监听路由参数变化
    watch(() => route.params.id, (newId) => {
      if (newId && newId !== activeChatId.value) {
        activeChatId.value = newId
        showChat.value = true
        
        // 设置当前聊天
        messagesStore.setCurrentChat(newId)
        
        // 加载该用户的消息
        messagesStore.fetchMessages(newId)
      }
    })
    
    // 在组件卸载时
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      
      // 执行消息轮询清理
      if (onUnmountedCleanup.value) {
        onUnmountedCleanup.value()
      }
    })
    
    return {
      activeChatId,
      showChat,
      isMobile,
      messagesStore,
      selectChat,
      handleBack,
      useMockData,
      toggleMockData
    }
  }
}
</script>

<style scoped>
.messages-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow: hidden;
}

.sidebar-column,
.detail-column {
  height: 100%;
}

.api-toggle {
  font-size: 0.8rem;
}

@media (max-width: 767.98px) {
  .sidebar-column,
  .detail-column {
    max-height: calc(100vh - 60px);
  }
}
</style> 