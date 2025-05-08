<template>
  <div class="message-sidebar">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom">
      <h5 class="mb-0">消息</h5>
      <div class="actions">
        <button class="btn btn-sm btn-icon me-2" title="搜索消息" @click="toggleSearch">
          <i class="bi bi-search"></i>
        </button>
        <button class="btn btn-sm btn-icon" title="新建聊天" @click="openNewChatModal">
          <i class="bi bi-pencil-square"></i>
        </button>
      </div>
    </div>
    
    <!-- 搜索栏 -->
    <div v-if="showSearch" class="search-container p-3 border-bottom">
      <div class="input-group">
        <span class="input-group-text bg-transparent border-end-0">
          <i class="bi bi-search"></i>
        </span>
        <input 
          type="text" 
          class="form-control border-start-0" 
          placeholder="搜索联系人或消息..."
          v-model="searchQuery"
          @input="debounceSearch"
        >
        <button 
          v-if="searchQuery" 
          class="btn btn-outline-secondary border-start-0" 
          type="button"
          @click="clearSearch"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
    
    <!-- 联系人列表 -->
    <div class="contacts-container p-0">
      <template v-if="filteredContacts.length > 0">
        <div 
          v-for="contact in filteredContacts" 
          :key="contact.id"
          class="contact-item p-3"
          :class="{ 'active': contact.id === activeChatId }"
          @click="selectContact(contact.id)"
        >
          <div class="d-flex">
            <!-- 头像 -->
            <div class="avatar-container position-relative me-3">
              <img 
                v-if="contact.avatar" 
                :src="contact.avatar" 
                class="avatar rounded-circle" 
                :alt="contact.name"
                width="48" 
                height="48"
              >
              <div v-else class="avatar-placeholder rounded-circle">
                {{ getInitials(contact.name) }}
              </div>
              
              <!-- 在线状态 -->
              <span 
                class="status-indicator"
                :class="contact.online ? 'online' : 'offline'"
              ></span>
              
              <!-- 未读计数 -->
              <span 
                v-if="contact.unread && contact.unread > 0" 
                class="unread-badge"
              >
                {{ contact.unread > 99 ? '99+' : contact.unread }}
              </span>
            </div>
            
            <!-- 联系人信息 -->
            <div class="contact-info flex-grow-1 overflow-hidden">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="contact-name text-truncate">{{ contact.name }}</div>
                <div class="contact-time small text-muted">
                  {{ formatTime(contact.lastMessageTime) }}
                </div>
              </div>
              <div class="last-message text-truncate" :class="{ 'fw-bold': contact.unread && contact.unread > 0 }">
                {{ contact.lastMessage || '没有消息' }}
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 没有联系人 -->
      <div v-else-if="!messagesStore.isLoadingContacts" class="empty-contacts p-5 text-center">
        <div class="mb-3">
          <i class="bi bi-people fs-1"></i>
        </div>
        <p class="mb-1">没有联系人</p>
        <p class="text-muted small">点击右上角的"+"开始新的聊天</p>
      </div>
    </div>
    
    <!-- 新建聊天模态框 -->
    <div 
      class="modal fade" 
      id="newChatModal" 
      tabindex="-1" 
      aria-labelledby="newChatModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="newChatModalLabel">新建聊天</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
          </div>
          <div class="modal-body">
            <!-- 用户搜索 -->
            <div class="input-group mb-3">
              <input 
                type="text" 
                class="form-control" 
                placeholder="搜索用户..." 
                v-model="userSearchQuery"
                @input="searchUsers"
              >
              <button 
                v-if="userSearchQuery" 
                class="btn btn-outline-secondary" 
                type="button"
                @click="userSearchQuery = ''"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
            
            <!-- 用户列表 -->
            <div class="user-list">
              <div 
                v-for="user in filteredUsers" 
                :key="user.id"
                class="user-item d-flex align-items-center p-2"
                :class="{ 'selected': selectedContact?.id === user.id }"
                @click="selectNewContact(user)"
              >
                <div class="avatar-container me-3">
                  <img 
                    v-if="user.avatar" 
                    :src="user.avatar" 
                    class="avatar rounded-circle" 
                    alt="User avatar"
                    width="40" 
                    height="40"
                  >
                  <div v-else class="avatar-placeholder rounded-circle">
                    {{ getInitials(user.name) }}
                  </div>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              :disabled="!selectedContact"
              @click="createNewChat"
            >
              开始聊天
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default {
  name: 'MessageSidebar',
  props: {
    activeChatId: {
      type: String,
      default: null
    }
  },
  emits: ['select-chat'],
  setup(props, { emit }) {
    const messagesStore = useMessagesStore()
    const authStore = useAuthStore()
    
    const searchQuery = ref('')
    const showSearch = ref(false)
    const userSearchQuery = ref('')
    const selectedContact = ref(null)
    
    // 搜索防抖计时器
    let searchDebounceTimer = null
    
    // 可能的聊天对象列表
    const contacts = ref([])
    
    // 获取联系人列表
    const filteredContacts = computed(() => {
      if (!searchQuery.value) {
        return messagesStore.sortedContacts
      }
      
      const query = searchQuery.value.toLowerCase()
      return messagesStore.sortedContacts.filter(contact => {
        return (
          contact.name.toLowerCase().includes(query) ||
          (contact.lastMessage && contact.lastMessage.toLowerCase().includes(query))
        )
      })
    })
    
    // 用户列表过滤
    const filteredUsers = computed(() => {
      if (!userSearchQuery.value) {
        return contacts.value
      }
      
      const query = userSearchQuery.value.toLowerCase()
      return contacts.value.filter(user => 
        user.name.toLowerCase().includes(query)
      )
    })
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      // 如果是今天的消息，显示时间
      if (date >= today) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      
      // 如果是昨天的消息，显示"昨天"
      if (date >= yesterday && date < today) {
        return '昨天'
      }
      
      // 如果是一周内的消息，显示星期几
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      if (now - date < 7 * 24 * 60 * 60 * 1000) {
        return weekDays[date.getDay()]
      }
      
      // 其他情况显示日期
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
    
    // 获取名字首字母
    const getInitials = (name) => {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    }
    
    // 选择联系人
    const selectContact = (contactId) => {
      emit('select-chat', contactId)
    }
    
    // 切换搜索栏
    const toggleSearch = () => {
      showSearch.value = !showSearch.value
      if (!showSearch.value) {
        searchQuery.value = ''
      }
    }
    
    // 搜索防抖
    const debounceSearch = () => {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => {
        // 这里可以添加更复杂的搜索逻辑
        console.log('搜索:', searchQuery.value)
      }, 300)
    }
    
    // 清除搜索
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // 打开新建聊天模态框
    const openNewChatModal = () => {
      fetchUserList()
      selectedContact.value = null
      
      // 显示模态框
      const modal = new bootstrap.Modal(document.getElementById('newChatModal'))
      modal.show()
    }
    
    // 选择新联系人
    const selectNewContact = (user) => {
      selectedContact.value = user
    }
    
    // 搜索用户
    const searchUsers = () => {
      // 实际应用中可以调用API搜索用户
      console.log('搜索用户:', userSearchQuery.value)
    }
    
    // 创建新聊天
    const createNewChat = async () => {
      if (!selectedContact.value) return
      
      try {
        // 这里可以调用API创建新的聊天
        console.log('创建与联系人的新聊天:', selectedContact.value)
        
        // 关闭弹窗
        const modalElement = document.getElementById('newChatModal')
        const modal = bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        }
        
        // 触发选择该聊天
        emit('select-chat', selectedContact.value.id)
        
        // 刷新联系人列表
        messagesStore.fetchContacts()
      } catch (error) {
        console.error('创建聊天失败:', error)
        alert('创建聊天失败，请重试')
      }
    }
    
    // 获取用户列表（用于新建聊天）
    const fetchUserList = async () => {
      try {
        // 实际开发中，这里应该调用API获取用户列表
        // const response = await axios.get('/api/users')
        // contacts.value = response.data
        
        // 模拟数据
        contacts.value = [
          { id: 'user1', name: '张三', online: true },
          { id: 'user2', name: '李四', online: false },
          { id: 'user3', name: '王五', online: true },
          { id: 'user4', name: '赵六', online: false },
          { id: 'user5', name: '钱七', online: true },
          { id: 'user6', name: '孙八', online: false }
        ]
      } catch (error) {
        console.error('获取用户列表失败:', error)
      }
    }
    
    // 监听联系人列表变化
    watch(() => messagesStore.contacts, (newContacts) => {
      console.log('联系人列表已更新', newContacts.length)
    })
    
    // 组件挂载时获取联系人列表
    onMounted(() => {
      if (authStore.isLoggedIn) {
        messagesStore.fetchContacts()
      }
    })
    
    return {
      messagesStore,
      searchQuery,
      showSearch,
      userSearchQuery,
      selectedContact,
      contacts,
      filteredContacts,
      filteredUsers,
      toggleSearch,
      debounceSearch,
      clearSearch,
      formatTime,
      getInitials,
      selectContact,
      openNewChatModal,
      selectNewContact,
      searchUsers,
      createNewChat
    }
  }
}
</script>

<style scoped>
.message-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.sidebar-header {
  flex-shrink: 0;
}

.search-container {
  flex-shrink: 0;
}

.contacts-container {
  flex: 1;
  overflow-y: auto;
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: #495057;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #212529;
}

.contact-item {
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.contact-item:hover {
  background-color: #f8f9fa;
}

.contact-item.active {
  background-color: #e9f3ff;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  background-color: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: #28a745;
}

.status-indicator.offline {
  background-color: #6c757d;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  background-color: #dc3545;
  color: white;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-name {
  font-weight: 500;
  color: #212529;
}

.last-message {
  font-size: 0.85rem;
  color: #6c757d;
}

.empty-contacts {
  color: #6c757d;
}

/* 新建聊天模态框样式 */
.user-list {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.user-item:hover {
  background-color: #f8f9fa;
}

.user-item.selected {
  background-color: #e9f3ff;
}

.user-name {
  font-weight: 500;
}
</style> 