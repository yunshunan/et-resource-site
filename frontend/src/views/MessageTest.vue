<template>
  <div class="message-test">
    <h2 class="text-center my-4">消息功能测试页面</h2>
    
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              选择用户
            </div>
            <div class="card-body">
              <div 
                v-for="user in testUsers" 
                :key="user.id" 
                class="user-item p-2 mb-2 border rounded" 
                :class="{ 'bg-light': selectedUser && selectedUser.id === user.id }"
                @click="selectUser(user)"
              >
                <div class="d-flex align-items-center">
                  <div class="avatar me-2">{{ user.name.charAt(0) }}</div>
                  <div>{{ user.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>{{ selectedUser ? `与 ${selectedUser.name} 的对话` : '选择用户开始对话' }}</span>
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="mockToggle"
                  v-model="useMockData"
                  @change="toggleMockData"
                >
                <label class="form-check-label" for="mockToggle">使用模拟数据</label>
              </div>
            </div>
            <div class="card-body conversation-area">
              <div v-if="!selectedUser" class="text-center p-5 text-muted">
                请从左侧选择一个用户开始对话
              </div>
              <div v-else>
                <div v-if="messages.length === 0" class="text-center p-5 text-muted">
                  暂无消息记录，发送一条消息开始对话
                </div>
                <div v-else class="messages-container">
                  <div 
                    v-for="message in messages" 
                    :key="message.id"
                    class="message-bubble mb-3"
                    :class="{ 
                      'message-self': message.sender === 'self', 
                      'message-other': message.sender === 'other' 
                    }"
                  >
                    <div class="message-content">
                      {{ message.content }}
                    </div>
                    <div class="message-time small text-muted">
                      {{ formatTime(message.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="输入消息..." 
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  :disabled="!selectedUser"
                >
                <button 
                  class="btn btn-primary" 
                  @click="sendMessage"
                  :disabled="!selectedUser || !newMessage.trim()"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default {
  name: 'MessageTest',
  setup() {
    const messagesStore = useMessagesStore()
    const selectedUser = ref(null)
    const newMessage = ref('')
    const useMockData = ref(true) // 默认使用模拟数据
    
    // 测试用户列表
    const testUsers = [
      { id: 'user1', name: '张三', avatar: null },
      { id: 'user2', name: '李四', avatar: null },
      { id: 'user3', name: '王五', avatar: null }
    ]
    
    // 获取当前用户的消息
    const messages = computed(() => {
      if (!selectedUser.value) return []
      return messagesStore.messagesWithUser(selectedUser.value.id) || []
    })
    
    // 选择用户
    const selectUser = (user) => {
      selectedUser.value = user
      messagesStore.fetchMessages(user.id)
    }
    
    // 发送消息
    const sendMessage = async () => {
      if (!selectedUser.value || !newMessage.value.trim()) return
      
      try {
        await messagesStore.sendMessage(selectedUser.value.id, newMessage.value.trim())
        newMessage.value = ''
      } catch (error) {
        console.error('发送消息失败:', error)
        alert('发送消息失败，请重试')
      }
    }
    
    // 切换模拟数据/真实API
    const toggleMockData = () => {
      messagesStore.toggleMockData(useMockData.value)
      
      // 刷新数据
      if (selectedUser.value) {
        messagesStore.fetchMessages(selectedUser.value.id)
      }
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      let date
      try {
        date = parseISO(timestamp)
      } catch (e) {
        // 如果解析失败，尝试直接使用Date构造函数
        date = new Date(timestamp)
      }
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: zhCN })
      } else if (isYesterday(date)) {
        return '昨天 ' + format(date, 'HH:mm', { locale: zhCN })
      } else {
        return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN })
      }
    }
    
    // 初始化
    messagesStore.toggleMockData(useMockData.value)
    
    return {
      testUsers,
      selectedUser,
      messages,
      newMessage,
      useMockData,
      selectUser,
      sendMessage,
      formatTime,
      toggleMockData
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f8f9fa;
}

.conversation-area {
  height: 400px;
  overflow-y: auto;
}

.messages-container {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  max-width: 80%;
  padding: 10px;
  border-radius: 10px;
  position: relative;
}

.message-self {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
}

.message-other {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: #212529;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 4px;
  text-align: right;
}

.message-self .message-time {
  color: rgba(255, 255, 255, 0.8);
}
</style> 