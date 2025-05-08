<template>
  <div class="message-detail-container">
    <!-- Chat Header -->
    <div class="chat-header border-bottom p-3 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <!-- Back button - only visible on mobile -->
        <button 
          class="btn btn-sm btn-icon me-2 d-md-none"
          @click="$emit('back')"
          aria-label="返回"
        >
          <i class="bi bi-arrow-left"></i>
        </button>
        
        <div v-if="currentContact" class="d-flex align-items-center">
          <!-- Contact Avatar -->
          <div class="avatar-container me-2">
            <img 
              v-if="currentContact.avatar" 
              :src="currentContact.avatar" 
              class="rounded-circle" 
              :alt="currentContact?.name || '联系人'"
              width="40" 
              height="40"
            >
            <div v-else class="avatar-placeholder rounded-circle">
              {{ getInitials(currentContact.name) }}
            </div>
          </div>
          
          <!-- Contact Info -->
          <div>
            <div class="contact-name">{{ currentContact.name }}</div>
            <div class="contact-status small">
              <span 
                :class="['status-indicator', currentContact.status === 'online' ? 'online' : 'offline']"
              ></span>
              {{ currentContact.status === 'online' ? '在线' : '离线' }}
            </div>
          </div>
        </div>
        
        <div v-else class="placeholder-text">选择联系人开始聊天</div>
      </div>
      
      <!-- Actions Menu -->
      <div class="chat-actions" v-if="currentContact">
        <div class="dropdown">
          <button 
            class="btn btn-sm btn-icon"
            type="button" 
            id="chatMenuButton" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="chatMenuButton">
            <li><a class="dropdown-item" href="#" @click.prevent="markAllAsRead">标记所有消息为已读</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="clearChat">清空聊天记录</a></li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Messages Container -->
    <div v-if="chatId && !messages.length" class="messages-container-placeholder p-3">
      <div v-if="messagesStore.isLoadingMessages" class="text-center p-5">
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <div class="mt-2">加载消息中...</div>
        </div>
      </div>
      <div v-else-if="loadError" class="text-center p-5">
        <div class="empty-chat error-state">
          <div class="mb-3">
            <i class="bi bi-exclamation-circle-fill fs-1 text-danger"></i>
          </div>
          <div class="error-message mb-2">{{ loadError }}</div>
          <button class="btn btn-sm btn-outline-primary" @click="reloadMessages">
            <i class="bi bi-arrow-repeat me-1"></i>重试
          </button>
        </div>
      </div>
      <div v-else class="text-center p-5">
        <div class="empty-chat">
          <div class="mb-3">
            <i class="bi bi-chat-square-text fs-1"></i>
          </div>
          <div>没有消息记录</div>
          <div class="text-muted small">发送一条消息开始聊天</div>
        </div>
      </div>
    </div>
    
    <div v-else-if="!chatId" class="messages-container-placeholder p-3">
      <div class="empty-state text-center p-5">
        <div class="mb-3">
          <i class="bi bi-chat-square fs-1"></i>
        </div>
        <div>选择一个联系人开始聊天</div>
      </div>
    </div>
    
    <!-- 使用虚拟滚动组件替换原来的消息显示区域 -->
    <VirtualMessageList 
      v-else
      :messages="processedMessages"
      :scroll-to-bottom="isAtBottom"
      @retry="resendMessage"
      @scroll="handleVirtualScroll"
      ref="virtualScroller"
      class="messages-virtual-container"
    />
    
    <!-- 虚拟滚动不支持的元素 - 加载指示器和打字状态移动到这里 -->
    <div v-if="messagesStore.isLoadingMoreMessages" class="loading-more-indicator text-center py-2">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">加载更多消息...</span>
      </div>
      <div class="small text-muted mt-1">加载更多消息...</div>
    </div>
    
    <div v-if="isTyping" class="typing-indicator-container">
      <div class="typing-bubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="typing-text">正在输入...</div>
    </div>
    
    <!-- Message Input -->
    <MessageSender 
      v-if="chatId" 
      :chatId="chatId"
      @sent="onMessageSent"
      @typing="onUserTyping"
    />

    <!-- 新消息通知栏 -->
    <div v-if="hasNewMessages && !isAtBottom" class="new-messages-notification" @click="scrollToBottom">
      <div class="d-flex align-items-center justify-content-center">
        <i class="bi bi-arrow-down-circle me-2"></i>
        <span>新消息</span>
      </div>
    </div>

    <!-- 网络错误通知栏 -->
    <div v-if="networkError" class="network-error-notification">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <i class="bi bi-wifi-off me-2"></i>
          <span>连接错误: {{ networkError }}</span>
        </div>
        <button class="btn btn-sm btn-link text-light" @click="dismissNetworkError">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import MessageBubble from './MessageBubble.vue'
import MessageSender from './MessageSender.vue'
import { recordApiCall } from '@/utils/performanceMonitor'
import VirtualMessageList from './VirtualMessageList.vue'

export default {
  name: 'MessageDetail',
  components: {
    MessageBubble,
    MessageSender,
    VirtualMessageList
  },
  props: {
    chatId: {
      type: String,
      default: null
    }
  },
  emits: ['back'],
  setup(props) {
    const messagesStore = useMessagesStore()
    const authStore = useAuthStore()
    const messagesContainer = ref(null)
    const virtualScroller = ref(null)
    const isTyping = ref(false)
    const isLoadingMore = ref(false)
    const scrollPosition = ref({})
    const loadMoreThreshold = 200 // 滚动到顶部的阈值，触发加载更多
    const hasMoreMessages = ref(true) // 是否有更多消息可加载
    const loadError = ref(null)
    const hasNewMessages = ref(false)
    const isAtBottom = ref(true) // 默认为true，这样首次加载会滚动到底部
    const networkError = ref(null)
    let typingTimer = null
    
    // 获取当前聊天的消息
    const messages = computed(() => {
      return messagesStore.messagesWithUser(props.chatId) || []
    })
    
    // 处理消息数据以适应虚拟滚动组件
    const processedMessages = computed(() => {
      if (!messages.value.length) return []
      
      // 为每条消息添加日期分隔信息
      let lastDateStr = null
      const processedMsgs = []
      
      messages.value.forEach((message, index) => {
        let date
        try {
          date = parseISO(message.createdAt)
        } catch (e) {
          date = new Date(message.createdAt)
        }
        
        let dateStr
        if (isToday(date)) {
          dateStr = '今天'
        } else if (isYesterday(date)) {
          dateStr = '昨天'
        } else {
          dateStr = format(date, 'yyyy年MM月dd日', { locale: zhCN })
        }
        
        // 如果日期变了，添加日期分隔符
        if (dateStr !== lastDateStr) {
          lastDateStr = dateStr
          processedMsgs.push({
            id: `date-${date.getTime()}`,
            type: 'date',
            content: dateStr,
            createdAt: message.createdAt
          })
        }
        
        // 处理消息类型 - 为测试目的添加多种消息类型
        let processedMessage = { ...message, type: 'message' }
        
        // 为了演示和测试，给一些消息添加特殊类型
        // 实际应用中应该从服务器接收正确的消息类型
        if (message.content && !message.contentType) {
          // 如果内容包含.jpg,.png或.gif，当作图片处理
          if (/\.(jpg|jpeg|png|gif|webp)$/i.test(message.content)) {
            processedMessage.contentType = 'image'
          }
          // 如果内容包含.mp4或.webm，当作视频处理
          else if (/\.(mp4|webm|mov|avi)$/i.test(message.content)) {
            processedMessage.contentType = 'video'
          }
          // 如果内容包含.pdf,.doc等，当作文件处理
          else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt)$/i.test(message.content)) {
            processedMessage.contentType = 'file'
            processedMessage.fileName = message.content.split('/').pop()
            processedMessage.fileSize = Math.floor(Math.random() * 10000000) // 模拟文件大小
          }
          // 如果内容是URL格式，当作链接处理
          else if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(message.content)) {
            processedMessage.contentType = 'link'
            // 模拟链接预览数据
            const randomHasPreview = Math.random() > 0.3 // 70%的概率有预览
            if (randomHasPreview) {
              processedMessage.linkPreview = {
                title: '链接预览示例标题',
                description: '这是一个链接预览的描述内容，用于展示链接的摘要信息。',
                image: 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 100)
              }
            }
          }
        }
        
        // 在前5条消息中随机添加图片和视频类型，作为演示
        if (index < 5 && !processedMessage.contentType && Math.random() > 0.7) {
          const isImage = Math.random() > 0.3
          if (isImage) {
            processedMessage.contentType = 'image'
            processedMessage.content = 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100)
          } else {
            processedMessage.contentType = 'video'
            // 使用一个示例视频URL
            processedMessage.content = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'
            processedMessage.mimeType = 'video/mp4'
          }
        }
        
        processedMsgs.push(processedMessage)
      })
      
      return processedMsgs
    })
    
    // 获取当前联系人信息
    const currentContact = computed(() => {
      if (!props.chatId) return null
      return messagesStore.contacts.find(c => c.id === props.chatId) || null
    })
    
    // 按日期分组消息 - 保留给旧代码兼容，实际上不再使用
    const groupedMessages = computed(() => {
      if (!messages.value.length) return {}
      
      const groups = {}
      
      messages.value.forEach(message => {
        let date
        try {
          date = parseISO(message.createdAt)
        } catch (e) {
          date = new Date(message.createdAt)
        }
        
        let dateStr
        
        if (isToday(date)) {
          dateStr = '今天'
        } else if (isYesterday(date)) {
          dateStr = '昨天'
        } else {
          dateStr = format(date, 'yyyy年MM月dd日', { locale: zhCN })
        }
        
        if (!groups[dateStr]) {
          groups[dateStr] = []
        }
        
        groups[dateStr].push(message)
      })
      
      return groups
    })
    
    // 获取联系人名称的首字母
    const getInitials = (name) => {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    }
    
    // 保存滚动位置
    const saveScrollPosition = () => {
      if (!props.chatId || !virtualScroller.value) return
      
      const scrollerComponent = virtualScroller.value
      if (scrollerComponent && scrollerComponent.scroller) {
        const scrollInfo = {
          position: scrollerComponent.scroller.$el.scrollTop,
          height: scrollerComponent.scroller.$el.scrollHeight
        }
        scrollPosition.value[props.chatId] = scrollInfo
      }
    }
    
    // 恢复滚动位置
    const restoreScrollPosition = () => {
      if (!props.chatId || !virtualScroller.value) return
      
      const saved = scrollPosition.value[props.chatId]
      if (saved && virtualScroller.value.scroller) {
        nextTick(() => {
          const scroller = virtualScroller.value.scroller.$el
          const heightDiff = scroller.scrollHeight - saved.height
          scroller.scrollTop = saved.position + heightDiff
        })
      } else {
        scrollToBottom()
      }
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      if (!virtualScroller.value) return
      
      nextTick(() => {
        if (virtualScroller.value && virtualScroller.value.scrollToEnd) {
          virtualScroller.value.scrollToEnd()
          hasNewMessages.value = false
          isAtBottom.value = true
        }
      })
    }
    
    // 处理虚拟滚动组件的滚动事件
    const handleVirtualScroll = (event) => {
      if (!event || !event.target) return
      
      const { scrollTop, scrollHeight, clientHeight } = event.target
      
      // 检测是否在顶部附近，用于加载更多历史消息
      if (scrollTop < loadMoreThreshold && !messagesStore.isLoadingMoreMessages && hasMoreMessages.value) {
        loadMoreMessages()
      }
      
      // 检测是否在底部，用于处理新消息通知
      isAtBottom.value = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10
      
      // 存储滚动位置
      if (props.chatId && virtualScroller.value) {
        scrollPosition.value[props.chatId] = {
          position: scrollTop,
          height: scrollHeight
        }
      }
    }
    
    // 加载更多历史消息
    const loadMoreMessages = async () => {
      if (!props.chatId || messagesStore.isLoadingMoreMessages || !hasMoreMessages.value) return
      
      try {
        const oldestMessage = messages.value[0]
        if (!oldestMessage) return
        
        isLoadingMore.value = true
        let oldScrollHeight = 0
        
        if (virtualScroller.value && virtualScroller.value.scroller) {
          oldScrollHeight = virtualScroller.value.scroller.$el.scrollHeight
        }
        
        const result = await messagesStore.loadMoreMessages(props.chatId, oldestMessage.createdAt)
        
        // 如果没有更多消息，标记为没有更多
        if (!result || result.length === 0) {
          hasMoreMessages.value = false
          return
        }
        
        // 保持滚动位置在相对位置
        nextTick(() => {
          if (virtualScroller.value && virtualScroller.value.scroller) {
            const scrollerEl = virtualScroller.value.scroller.$el
            const newScrollHeight = scrollerEl.scrollHeight
            const scrollDiff = newScrollHeight - oldScrollHeight
            scrollerEl.scrollTop = scrollDiff > 0 ? scrollDiff : 0
          }
        })
      } catch (error) {
        console.error('加载更多消息失败:', error)
        showNetworkError('加载更多消息失败，请检查网络连接')
      } finally {
        isLoadingMore.value = false
      }
    }
    
    // 重新加载消息
    const reloadMessages = async () => {
      if (!props.chatId) return
      
      loadError.value = null
      try {
        await messagesStore.fetchMessages(props.chatId, 1, 50)
      } catch (error) {
        console.error('重新加载消息失败:', error)
        loadError.value = '无法加载消息，请检查网络连接'
      }
    }
    
    // 显示网络错误
    const showNetworkError = (message) => {
      networkError.value = message
      // 自动清除错误
      setTimeout(() => {
        if (networkError.value === message) {
          networkError.value = null
        }
      }, 5000)
    }
    
    // 关闭网络错误提示
    const dismissNetworkError = () => {
      networkError.value = null
    }
    
    // 当用户正在输入
    const onUserTyping = () => {
      // 可以在这里添加通知对方"用户正在输入"的逻辑
      isTyping.value = true
      
      // 清除之前的定时器
      if (typingTimer) clearTimeout(typingTimer)
      
      // 设置新的定时器，3秒后自动清除输入状态
      typingTimer = setTimeout(() => {
        isTyping.value = false
      }, 3000)
    }
    
    // 当消息发送成功
    const onMessageSent = () => {
      // 滚动到底部查看新消息
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    // 标记全部已读
    const markAllAsRead = async () => {
      if (!props.chatId) return
      
      try {
        await messagesStore.markAsRead(props.chatId)
      } catch (error) {
        console.error('标记为已读失败:', error)
        showNetworkError('无法更新已读状态，请检查网络连接')
      }
    }
    
    // 清空聊天记录
    const clearChat = () => {
      if (!props.chatId) return
      
      if (window.confirm('确定要清空与该联系人的聊天记录吗？此操作不可撤销。')) {
        // 实现清空聊天记录逻辑
        console.log('清空聊天记录:', props.chatId)
      }
    }
    
    // 重新发送消息
    const resendMessage = async (messageId) => {
      if (!props.chatId) return
      
      try {
        await messagesStore.resendMessage(props.chatId, messageId)
      } catch (error) {
        console.error('重发消息失败:', error)
        showNetworkError(`重发消息失败: ${error.message || '请检查网络连接'}`)
      }
    }
    
    // 定期检查新消息
    const checkNewMessagesInterval = setInterval(() => {
      if (props.chatId) {
        messagesStore.checkForNewMessages()
      }
    }, 30000) // 每30秒检查一次
    
    // 监听 chatId 变化
    watch(() => props.chatId, (newChatId, oldChatId) => {
      if (newChatId && newChatId !== oldChatId) {
        // 保存旧对话的滚动位置
        if (oldChatId) {
          saveScrollPosition()
        }
        
        // 重置加载更多状态
        hasMoreMessages.value = true
        isLoadingMore.value = false
        
        // 加载聊天记录
        messagesStore.fetchMessages(newChatId)
        
        // 如果有未读消息，标记为已读
        if (currentContact.value?.unreadCount > 0) {
          messagesStore.markAsRead(newChatId)
        }
        
        // 设置当前聊天
        messagesStore.setCurrentChat(newChatId)
        
        // 如果有缓存的滚动位置，恢复它；否则滚动到底部
        nextTick(() => {
          if (scrollPosition.value[newChatId]) {
            restoreScrollPosition()
          } else {
            scrollToBottom()
          }
        })
      }
    }, { immediate: true })
    
    // 监听消息列表变化
    watch(() => messages.value.length, (newLength, oldLength) => {
      // 只有在新增消息且不是加载更多历史消息时才滚动到底部
      if (newLength > oldLength && !isLoadingMore.value) {
        if (isAtBottom.value) {
          scrollToBottom()
        } else {
          hasNewMessages.value = true
        }
      }
    })
    
    // 组件挂载后滚动到底部
    onMounted(() => {
      if (props.chatId) {
        nextTick(() => {
          scrollToBottom()
        })
      }
      
      // 监听窗口大小变化，保持滚动位置
      window.addEventListener('resize', restoreScrollPosition)
    })
    
    // 组件卸载时清除定时器和事件监听
    onUnmounted(() => {
      if (checkNewMessagesInterval) {
        clearInterval(checkNewMessagesInterval)
      }
      if (typingTimer) {
        clearTimeout(typingTimer)
      }
      window.removeEventListener('resize', restoreScrollPosition)
    })
    
    return {
      messagesStore,
      virtualScroller,
      messages,
      processedMessages,
      currentContact,
      groupedMessages,
      isTyping,
      isLoadingMore,
      hasMoreMessages,
      getInitials,
      handleVirtualScroll,
      onMessageSent,
      onUserTyping,
      resendMessage,
      markAllAsRead,
      clearChat,
      loadError,
      hasNewMessages,
      isAtBottom,
      networkError,
      scrollToBottom,
      dismissNetworkError,
      reloadMessages
    }
  }
}
</script>

<style scoped>
.message-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  flex-shrink: 0;
  background-color: white;
}

.messages-container-placeholder {
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.messages-virtual-container {
  flex: 1;
  background-color: #f8f9fa;
}

.contact-name {
  font-weight: 500;
}

.contact-status {
  color: #6c757d;
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.online {
  background-color: #28a745;
}

.offline {
  background-color: #6c757d;
}

.avatar-container {
  width: 40px;
  height: 40px;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  background-color: #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #6c757d;
}

.loading-more-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 5;
  padding: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.typing-indicator-container {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  margin: 0 10px 5px;
}

.typing-bubble {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.typing-bubble span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6c757d;
  margin: 0 2px;
  animation: typingAnimation 1.4s infinite ease-in-out;
}

.typing-bubble span:nth-child(1) {
  animation-delay: 0s;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-text {
  font-size: 0.85rem;
  color: #6c757d;
}

.new-messages-notification {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.network-error-notification {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  width: 80%;
  max-width: 500px;
}

@keyframes typingAnimation {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>