import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import api from '@/services/api'
// 导入性能监控
import { recordApiCall } from '@/utils/performanceMonitor'
// 导入localForage配置
import { messageCache, contactsCache, cacheConfig } from '@/utils/localForageConfig'

// Keep the MOCK_DATA for fallback if API fails
// Mock Data
const MOCK_CONTACTS = [
  {
    id: 'user1',
    name: '张三',
    avatar: null,
    online: true,
    lastMessage: '您好，我想咨询一下关于前端开发资源的问题',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分钟前
    unread: 2
  },
  {
    id: 'user2',
    name: '李四',
    avatar: null,
    online: false,
    lastMessage: '谢谢，收到资料了',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    unread: 0
  },
  {
    id: 'user3',
    name: '王五',
    avatar: null,
    online: true,
    lastMessage: '这个资源非常有用，感谢分享！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    unread: 0
  }
]

// Mock Messages
const MOCK_MESSAGES = {
  'user1': [
    {
      id: 'msg1',
      content: '您好，我想咨询一下关于前端开发资源的问题',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20分钟前
      status: 'delivered'
    },
    {
      id: 'msg2',
      content: '您好，请问有什么可以帮到您的？',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分钟前
      status: 'read'
    },
    {
      id: 'msg3',
      content: '我正在学习Vue.js，想找一些相关的教程和项目模板',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10分钟前
      status: 'delivered'
    },
    {
      id: 'msg4',
      content: '我们网站上有很多Vue.js的资源，我可以推荐几个给您',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(), // 7分钟前
      status: 'delivered'
    },
    {
      id: 'msg5',
      content: '非常感谢，那就麻烦您了',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分钟前
      status: 'delivered'
    }
  ],
  'user2': [
    {
      id: 'msg6',
      content: '您好，我看到您上传的React组件库资源',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5小时前
      status: 'delivered'
    },
    {
      id: 'msg7',
      content: '您好，有什么需要了解的吗？',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4小时前
      status: 'read'
    },
    {
      id: 'msg8',
      content: '我想了解一下这个组件库的使用方法，能否发一些资料给我？',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3小时前
      status: 'delivered'
    },
    {
      id: 'msg9',
      content: '没问题，我已经发送了一份详细的使用文档到您的邮箱',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
      status: 'delivered'
    },
    {
      id: 'msg10',
      content: '谢谢，收到资料了',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
      status: 'delivered'
    }
  ],
  'user3': [
    {
      id: 'msg11',
      content: '您好，我是王五',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2天前
      status: 'delivered'
    },
    {
      id: 'msg12',
      content: '您好王五，有什么可以帮到您的？',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(), // 47小时前
      status: 'read'
    },
    {
      id: 'msg13',
      content: '我看到您分享的那篇前端性能优化的文章非常好',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36小时前
      status: 'delivered'
    },
    {
      id: 'msg14',
      content: '谢谢您的反馈，我很高兴它对您有帮助',
      sender: 'self',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(), // 35小时前
      status: 'delivered'
    },
    {
      id: 'msg15',
      content: '这个资源非常有用，感谢分享！',
      sender: 'other',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24小时前
      status: 'delivered'
    }
  ]
}

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    contacts: [],
    currentChatId: null,
    messages: {}, // 格式: { userId: [messages] }
    unreadCounts: {}, // 格式: { userId: count }
    totalUnreadCount: 0,
    isLoadingContacts: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    lastChecked: null,
    lastContactsFetch: null,
    cachedTimestamp: null,
    useMockData: false, // Flag to control whether to use mock data
    messagePagination: null,
    isLoadingMoreMessages: false
  }),
  
  getters: {
    // 按最后消息时间排序的联系人列表
    sortedContacts: (state) => {
      return [...state.contacts].sort((a, b) => {
        // 首先按未读消息数排序
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1
        
        // 然后按最后消息时间排序
        const timeA = a.lastMessage?.timestamp || 0
        const timeB = b.lastMessage?.timestamp || 0
        return timeB - timeA
      })
    },
    
    // 总未读消息数
    totalUnread: (state) => {
      return Object.values(state.unreadCounts).reduce((sum, count) => sum + count, 0)
    },
    
    // 获取与特定用户的消息
    messagesWithUser: (state) => (userId) => {
      return userId ? (state.messages[userId] || []) : []
    }
  },
  
  actions: {
    // 获取联系人列表
    async fetchContacts() {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated && !this.useMockData) {
          console.warn('未登录，无法获取联系人')
          return
        }
        
        this.isLoadingContacts = true
        
        // 使用模拟数据（如果启用）
        if (this.useMockData) {
          console.log('使用模拟联系人数据')
          this.contacts = [...MOCK_CONTACTS]
          
          // 更新未读消息计数
          this.contacts.forEach(contact => {
            this.unreadCounts[contact.id] = contact.unread || 0
          })
          
          // 更新总未读数
          this.updateTotalUnreadCount()
          this.isLoadingContacts = false
          return
        }
        
        // 检查缓存
        const cachedContacts = await this.getCachedContacts()
        if (cachedContacts) {
          console.log('[Messages] 使用缓存的联系人数据')
          this.contacts = cachedContacts
          
          // 更新未读消息计数
          this.contacts.forEach(contact => {
            this.unreadCounts[contact.id] = contact.unread || 0
          })
          
          // 更新总未读数
          this.updateTotalUnreadCount()
          this.isLoadingContacts = false
          
          // 在后台刷新联系人
          this.refreshContactsInBackground()
          return
        }
        
        // 使用API获取联系人
        console.log('[Messages] 从API获取联系人数据')
        
        // 使用性能监控记录API调用
        const apiStartTime = performance.now();
        const response = await api.get('/api/messages/contacts')
        const apiEndTime = performance.now();
        
        // 记录API调用性能
        recordApiCall(
          '/api/messages/contacts',
          'GET', 
          apiEndTime - apiStartTime,
          response.status
        );
        
        if (response.data.success) {
          const contacts = response.data.data.map(contact => ({
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            status: contact.status || 'offline',
            lastMessage: {
              content: contact.lastMessage || '',
              timestamp: contact.lastMessageTime || new Date()
            },
            unreadCount: contact.unread || 0
          }))
          
          this.contacts = contacts
          
          // 异步缓存联系人
          this.cacheContacts(contacts)
          
          // 更新未读消息计数
          this.contacts.forEach(contact => {
            this.unreadCounts[contact.id] = contact.unread || 0
          })
          
          // 更新总未读数
          this.updateTotalUnreadCount()
        }
      } catch (error) {
        console.error('[Messages] 获取联系人出错:', error)
        // 使用模拟数据
        this.contacts = [...MOCK_CONTACTS]
        
        // 更新未读消息计数
        this.contacts.forEach(contact => {
          this.unreadCounts[contact.id] = contact.unread || 0
        })
        
        // 更新总未读数
        this.updateTotalUnreadCount()
      } finally {
        // 确保一定会设置加载状态为false
        this.isLoadingContacts = false
      }
    },
    
    // 后台刷新联系人列表
    async refreshContactsInBackground() {
      try {
        // 获取联系人列表
        const response = await api.get('/api/messages/contacts')
        
        if (response.data.success) {
          const contacts = response.data.data.map(contact => ({
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            status: contact.status || 'offline',
            lastMessage: {
              content: contact.lastMessage || '',
              timestamp: contact.lastMessageTime || new Date()
            },
            unreadCount: contact.unread || 0
          }))
          
          this.contacts = contacts
          this.cacheContacts(contacts)
          
          // 更新未读消息计数
          contacts.forEach(contact => {
            this.unreadCounts[contact.id] = contact.unreadCount || 0
          })
          
          // 更新总未读数
          this.updateTotalUnreadCount()
          
          this.lastContactsFetch = new Date().getTime()
        }
      } catch (error) {
        console.error('后台刷新联系人出错:', error)
      }
    },
    
    // 获取与特定用户的消息历史
    async fetchMessages(userId, page = 1, limit = 50) {
      if (!userId) return
      
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated && !this.useMockData) {
          console.warn('[Messages] 未登录，无法获取消息')
          return
        }
        
        this.isLoadingMessages = true
        
        // 如果使用模拟数据，直接返回模拟数据
        if (this.useMockData) {
          console.log('[Messages] 使用模拟消息数据')
          this.messages = {
            ...this.messages,
            [userId]: MOCK_MESSAGES[userId] || []
          }
          this.isLoadingMessages = false
          return
        }
        
        // 检查缓存
        const cachedMessages = await this.getCachedMessages(userId)
        if (cachedMessages) {
          console.log('[Messages] 使用缓存的消息数据')
          this.messages = {
            ...this.messages,
            [userId]: cachedMessages
          }
          this.isLoadingMessages = false
          
          // 在后台刷新消息
          this.refreshMessagesInBackground(userId)
          return
        }
        
        // 使用API获取消息
        console.log(`[Messages] 从API获取消息数据: 用户${userId}, 第${page}页, 每页${limit}条`)
        
        // 使用性能监控记录API调用
        const apiStartTime = performance.now();
        const response = await api.get(`/api/messages/history?otherUserId=${userId}&page=${page}&limit=${limit}`)
        const apiEndTime = performance.now();
        
        // 记录API调用性能
        recordApiCall(
          `/api/messages/history?otherUserId=${userId}`,
          'GET', 
          apiEndTime - apiStartTime,
          response.status
        );
        
        if (response.data.success) {
          const messages = response.data.data.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.senderId === authStore.user.id ? 'self' : 'other',
            status: msg.status || 'delivered',
            createdAt: msg.timestamp
          }))
          
          // 保存分页信息
          this.messagePagination = response.data.pagination || {
            currentPage: page,
            pageSize: limit,
            totalPages: 1,
            totalCount: messages.length
          };
          
          // 升序排列消息（旧到新）
          messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          
          this.messages = {
            ...this.messages,
            [userId]: messages
          }
          
          // 异步缓存消息
          this.cacheMessages(userId, messages)
          
          // 如果有未读消息，标记为已读
          if (this.unreadCounts[userId] > 0) {
            this.markAsRead(userId)
          }
        } else {
          console.error('[Messages] 获取消息历史失败:', response.data.message)
        }
      } catch (error) {
        console.error('[Messages] 获取消息出错:', error)
        // 如果是网络或服务器错误，使用本地缓存
        const cachedMessages = await this.getCachedMessages(userId)
        if (cachedMessages) {
          this.messages = {
            ...this.messages,
            [userId]: cachedMessages
          }
        } else if (this.useMockData) {
          // 兜底：如果启用了模拟数据且没有缓存，使用模拟数据
          this.messages = {
            ...this.messages,
            [userId]: MOCK_MESSAGES[userId] || []
          }
        }
      } finally {
        this.isLoadingMessages = false
      }
    },
    
    // 后台刷新消息
    async refreshMessagesInBackground(userId) {
      if (!userId) return
      
      try {
        const authStore = useAuthStore()
        const response = await api.get(`/api/messages/history?otherUserId=${userId}`)
        
        if (response.data.success) {
          const messages = response.data.data.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.senderId === authStore.user.id ? 'self' : 'other',
            status: msg.status || 'delivered',
            createdAt: msg.timestamp
          }))
          
          // 升序排列消息（旧到新）
          messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          
          this.messages = {
            ...this.messages,
            [userId]: messages
          }
          
          // 缓存消息
          this.cacheMessages(userId, messages)
        }
      } catch (error) {
        console.error('后台刷新消息出错:', error)
      }
    },
    
    // 发送消息给特定用户
    async sendMessage(userId, content) {
      if (!userId || !content.trim()) {
        throw new Error('收件人ID和消息内容不能为空')
      }
      
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated && !this.useMockData) {
          throw new Error('未登录，无法发送消息')
        }
        
        // 先创建一个临时消息对象，显示"发送中"状态
        const tempId = `temp-${Date.now()}`
        const tempMessage = {
          id: tempId,
          content,
          sender: 'self',
          status: 'sending',
          createdAt: new Date().toISOString()
        }
        
        // 添加到当前对话
        const currentMessages = this.messages[userId] || []
        this.messages[userId] = [...currentMessages, tempMessage]
        
        // 如果使用模拟数据，直接模拟成功响应
        if (this.useMockData) {
          console.log('使用模拟数据发送消息')
          // 模拟网络延迟
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 模拟成功发送的消息
          const sentMessage = {
            id: `mock-${Date.now()}`,
            content: content.trim(),
            sender: 'self',
            status: 'sent',
            createdAt: new Date().toISOString()
          }
          
          // 替换临时消息
          const messageIndex = this.messages[userId].findIndex(m => m.id === tempId)
          if (messageIndex !== -1) {
            this.messages[userId].splice(messageIndex, 1, sentMessage)
          }
          
          // 更新最后一条消息
          this.updateLastMessage(userId, content)
          
          // 缓存更新后的消息
          this.cacheMessages(userId, this.messages[userId])
          
          return sentMessage
        }
        
        // 否则发送真实API请求
        const response = await api.post('/api/messages/send', {
          receiverId: userId,
          content: content.trim()
        })
        
        if (response.data.success) {
          // 更新消息状态为已发送
          const messageIndex = this.messages[userId].findIndex(m => m.id === tempId)
          if (messageIndex !== -1) {
            const sentMessage = {
              ...response.data.data,
              sender: 'self',
              status: 'sent'
            }
            
            // 替换临时消息
            this.messages[userId].splice(messageIndex, 1, sentMessage)
            
            // 更新最后一条消息
            this.updateLastMessage(userId, content)
            
            // 缓存更新后的消息
            this.cacheMessages(userId, this.messages[userId])
            
            return sentMessage
          }
        } else {
          throw new Error(response.data.message || '发送失败，请重试')
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 更新消息状态为发送失败
        const userId = this.currentChatId || userId
        if (userId) {
          const currentMessages = this.messages[userId] || []
          const messageIndex = currentMessages.findIndex(m => m.status === 'sending')
          
          if (messageIndex !== -1) {
            currentMessages[messageIndex].status = 'failed'
            this.messages[userId] = [...currentMessages]
          }
        }
        
        throw error
      }
    },
    
    // 更新联系人的最后一条消息
    updateLastMessage(userId, content) {
      const contactIndex = this.contacts.findIndex(c => c.id === userId)
      if (contactIndex !== -1) {
        this.contacts[contactIndex] = {
          ...this.contacts[contactIndex],
          lastMessage: {
            content,
            timestamp: new Date()
          }
        }
        
        // 按最后消息时间重新排序联系人
        this.contacts.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp || 0
          const timeB = b.lastMessage?.timestamp || 0
          return timeB - timeA
        })
        
        // 缓存更新后的联系人
        this.cacheContacts(this.contacts)
      }
    },
    
    // 重发失败消息
    async resendMessage(userId, messageId) {
      if (!userId || !messageId) return
      
      try {
        // 获取失败的消息
        const messages = this.messages[userId] || []
        const messageIndex = messages.findIndex(m => m.id === messageId)
        
        if (messageIndex === -1) {
          throw new Error('消息不存在')
        }
        
        const failedMessage = messages[messageIndex]
        
        // 检查重试次数
        const retryCount = failedMessage.retryCount || 0
        if (retryCount >= 3) {
          throw new Error('消息重试次数已达上限，请稍后再试')
        }
        
        // 更新消息状态为"发送中"
        messages[messageIndex] = {
          ...failedMessage,
          status: 'sending',
          retryCount: retryCount + 1,
          retryTimestamp: new Date().toISOString()
        }
        
        this.messages[userId] = [...messages]
        
        // 如果使用模拟数据，直接模拟成功响应
        if (this.useMockData) {
          console.log('使用模拟数据重发消息')
          // 模拟网络延迟
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 模拟成功发送的消息
          const updatedMessage = {
            ...failedMessage,
            id: `mock-${Date.now()}`,
            status: 'sent',
            createdAt: new Date().toISOString(),
            retryCount: retryCount + 1
          }
          
          // 替换失败的消息
          this.messages[userId].splice(messageIndex, 1, updatedMessage)
          
          // 缓存更新后的消息
          this.cacheMessages(userId, this.messages[userId])
          
          return updatedMessage
        }
        
        // 否则重新发送真实API请求
        const startTime = performance.now()
        const response = await api.post('/api/messages/send', {
          receiverId: userId,
          content: failedMessage.content,
          originalId: failedMessage.id, // 传递原始消息ID，便于服务器做重复检查
          isRetry: true,
          retryCount: retryCount + 1
        })
        const endTime = performance.now()
        
        // 记录API调用性能
        recordApiCall('resendMessage', endTime - startTime, response.status === 200)
        
        if (response.data.success) {
          // 更新消息状态为已发送
          const sentMessage = {
            ...response.data.data,
            sender: 'self',
            status: 'sent',
            retryCount: retryCount + 1,
            retrySuccess: true
          }
          
          // 替换失败的消息
          this.messages[userId].splice(messageIndex, 1, sentMessage)
          
          // 缓存更新后的消息
          this.cacheMessages(userId, this.messages[userId])
          
          return sentMessage
        } else {
          throw new Error(response.data.message || '重发失败，请稍后再试')
        }
      } catch (error) {
        console.error('重发消息失败:', error)
        
        // 更新消息状态为发送失败，但保留重试计数
        if (userId) {
          const messages = this.messages[userId] || []
          const messageIndex = messages.findIndex(m => m.id === messageId)
          
          if (messageIndex !== -1) {
            const failedMessage = messages[messageIndex]
            messages[messageIndex] = {
              ...failedMessage,
              status: 'failed',
              error: error.message || '发送失败',
              lastRetryFailed: true,
              lastRetryTime: new Date().toISOString()
            }
            
            this.messages[userId] = [...messages]
            
            // 缓存更新后的消息
            this.cacheMessages(userId, this.messages[userId])
          }
        }
        
        throw error
      }
    },
    
    // 标记消息为已读
    async markAsRead(userId) {
      if (!userId) return
      
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          console.warn('未登录，无法标记消息为已读')
          return
        }
        
        // 标记消息为已读
        const response = await api.put(`/api/messages/read/${userId}`)
        
        if (response.data.success) {
          // 更新未读计数
          this.unreadCounts[userId] = 0
          
          // 更新联系人列表中的未读计数
          const contactIndex = this.contacts.findIndex(c => c.id === userId)
          if (contactIndex !== -1) {
            this.contacts[contactIndex].unreadCount = 0
          }
          
          // 更新总未读数
          this.updateTotalUnreadCount()
          
          // 缓存更新后的联系人
          this.cacheContacts(this.contacts)
        } else {
          console.error('标记消息为已读失败:', response.data.message)
        }
      } catch (error) {
        console.error('标记消息为已读出错:', error)
      }
    },
    
    // 检查新消息
    async checkForNewMessages() {
      // 避免频繁请求，添加时间间隔检查
      const now = new Date().getTime();
      if (this.lastChecked && now - this.lastChecked < 5000) { // 至少5秒间隔
        return;
      }
      
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          return;
        }
        
        // 更新最后检查时间戳，即使请求失败也算一次检查
        this.lastChecked = now;
        
        // 获取未读消息数
        const response = await api.get('/api/messages/unread');
        
        if (response.data && response.data.success) {
          const unreadData = response.data.data;
          
          // 更新总未读数
          this.totalUnreadCount = unreadData.total || 0;
          
          // 更新每个联系人的未读数
          if (unreadData.byUser) {
            for (const userId in unreadData.byUser) {
              this.unreadCounts[userId] = unreadData.byUser[userId];
              
              // 更新联系人列表中的未读计数
              const contactIndex = this.contacts.findIndex(c => c.id === userId);
              if (contactIndex !== -1) {
                this.contacts[contactIndex].unreadCount = unreadData.byUser[userId];
              }
            }
          }
          
          // 如果当前正在查看的联系人有新消息，刷新消息列表
          if (this.currentChatId && this.unreadCounts[this.currentChatId] > 0) {
            await this.fetchMessages(this.currentChatId);
          }
        }
      } catch (error) {
        console.error('检查新消息出错:', error);
        // 使用模拟数据更新未读数，避免UI出现问题
        if (this.useMockData) {
          console.log('使用模拟数据更新未读消息');
          // 已有联系人的未读数随机更新
          let totalUnread = 0;
          this.contacts.forEach(contact => {
            // 随机决定是否增加未读消息
            if (Math.random() > 0.7 && contact.id !== this.currentChatId) { 
              const count = Math.floor(Math.random() * 3);
              this.unreadCounts[contact.id] = (this.unreadCounts[contact.id] || 0) + count;
              totalUnread += count;
            }
          });
          
          this.totalUnreadCount = totalUnread;
        }
      }
    },
    
    // 设置当前聊天
    setCurrentChat(chatId) {
      this.currentChatId = chatId
      
      // 如果有未读消息，标记为已读
      if (chatId && this.unreadCounts[chatId] > 0) {
        this.markAsRead(chatId)
      }
    },
    
    // 更新总未读消息数
    updateTotalUnreadCount() {
      this.totalUnreadCount = Object.values(this.unreadCounts).reduce((sum, count) => sum + count, 0)
    },
    
    // 缓存消息
    async cacheMessages(userId, messages) {
      if (!cacheConfig.enabled) return;
      
      const cacheKey = `${cacheConfig.messageCachePrefix}${userId}`;
      const cacheExpiration = cacheConfig.maxAge * 1000; // 转换秒为毫秒
      const cacheData = {
        messages,
        timestamp: Date.now(),
        expiration: Date.now() + cacheExpiration
      };
      
      try {
        // 使用性能监控记录缓存操作
        const startTime = performance.now();
        await messageCache.setItem(cacheKey, cacheData);
        const endTime = performance.now();
        
        console.log(`[Messages] 已缓存用户 ${userId} 的消息, 耗时: ${(endTime-startTime).toFixed(2)}ms`);
      } catch (e) {
        console.error('[Messages] 缓存消息失败:', e);
      }
    },
    
    // 获取缓存的消息
    async getCachedMessages(userId) {
      if (!cacheConfig.enabled) return null;
      
      const cacheKey = `${cacheConfig.messageCachePrefix}${userId}`;
      
      try {
        const startTime = performance.now();
        const cacheData = await messageCache.getItem(cacheKey);
        const endTime = performance.now();
        
        if (!cacheData) return null;
        
        console.log(`[Messages] 读取缓存消息, 耗时: ${(endTime-startTime).toFixed(2)}ms`);
        
        // 检查缓存是否过期
        if (cacheData.expiration < Date.now()) {
          await messageCache.removeItem(cacheKey);
          console.log(`[Messages] 清理过期缓存: ${cacheKey}`);
          return null;
        }
        
        return cacheData.messages;
      } catch (e) {
        console.error('[Messages] 读取缓存消息失败:', e);
        return null;
      }
    },
    
    // 缓存联系人
    async cacheContacts(contacts) {
      if (!cacheConfig.enabled) return;
      
      const cacheExpiration = cacheConfig.maxAge * 1000; // 转换秒为毫秒
      const cacheData = {
        contacts,
        timestamp: Date.now(),
        expiration: Date.now() + cacheExpiration
      };
      
      try {
        const startTime = performance.now();
        await contactsCache.setItem(cacheConfig.contactsCacheKey, cacheData);
        const endTime = performance.now();
        
        console.log(`[Messages] 已缓存联系人列表, 耗时: ${(endTime-startTime).toFixed(2)}ms`);
      } catch (e) {
        console.error('[Messages] 缓存联系人失败:', e);
      }
    },
    
    // 获取缓存的联系人
    async getCachedContacts() {
      if (!cacheConfig.enabled) return null;
      
      try {
        const startTime = performance.now();
        const cacheData = await contactsCache.getItem(cacheConfig.contactsCacheKey);
        const endTime = performance.now();
        
        if (!cacheData) return null;
        
        console.log(`[Messages] 读取缓存联系人, 耗时: ${(endTime-startTime).toFixed(2)}ms`);
        
        // 检查缓存是否过期
        if (cacheData.expiration < Date.now()) {
          await contactsCache.removeItem(cacheConfig.contactsCacheKey);
          console.log('[Messages] 清理过期的联系人缓存');
          return null;
        }
        
        return cacheData.contacts;
      } catch (e) {
        console.error('[Messages] 读取缓存联系人失败:', e);
        return null;
      }
    },

    // Toggle mock data usage
    toggleMockData(useMock) {
      this.useMockData = useMock;
      console.log(`消息模式已切换为: ${this.useMockData ? '模拟数据' : '真实API'}`);
    },
    
    // 清理过期缓存 - 使用localForageConfig中的clearExpiredCache
    async clearExpiredCache() {
      try {
        const { clearExpiredCache } = await import('@/utils/localForageConfig');
        await clearExpiredCache();
      } catch (e) {
        console.error('[Messages] 清理过期缓存出错:', e);
      }
    },

    // 加载更多历史消息（分页加载）
    async loadMoreMessages(userId, olderThan = null) {
      if (!userId || !this.messages[userId]) return;
      
      try {
        // 计算当前页码
        const currentPage = this.messagePagination?.currentPage || 1;
        const nextPage = currentPage + 1;
        const pageSize = this.messagePagination?.pageSize || 50;
        
        // 如果已经加载了所有页，则返回
        if (this.messagePagination && this.messagePagination.totalPages <= currentPage) {
          console.log('[Messages] 已加载所有消息历史');
          return false;
        }
        
        console.log(`[Messages] 加载更多消息: 用户${userId}, 第${nextPage}页`);
        this.isLoadingMoreMessages = true;
        
        // 构建请求参数
        let url = `/api/messages/history?otherUserId=${userId}&page=${nextPage}&limit=${pageSize}`;
        if (olderThan) {
          url += `&olderThan=${olderThan}`;
        }
        
        // 使用性能监控记录API调用
        const apiStartTime = performance.now();
        const response = await api.get(url);
        const apiEndTime = performance.now();
        
        // 记录API调用性能
        recordApiCall(
          url,
          'GET', 
          apiEndTime - apiStartTime,
          response.status
        );
        
        if (response.data.success) {
          const authStore = useAuthStore();
          const newMessages = response.data.data.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.senderId === authStore.user.id ? 'self' : 'other',
            status: msg.status || 'delivered',
            createdAt: msg.timestamp
          }));
          
          // 更新分页信息
          this.messagePagination = response.data.pagination;
          
          // 升序排列消息（旧到新）
          newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          // 合并新旧消息
          const currentMessages = this.messages[userId] || [];
          const mergedMessages = [...newMessages, ...currentMessages];
          
          // 更新消息列表
          this.messages = {
            ...this.messages,
            [userId]: mergedMessages
          };
          
          // 异步缓存合并后的完整消息列表
          this.cacheMessages(userId, mergedMessages);
          
          return true; // 成功加载了更多消息
        } else {
          console.error('[Messages] 加载更多消息失败:', response.data.message);
          return false;
        }
      } catch (error) {
        console.error('[Messages] 加载更多消息出错:', error);
        return false;
      } finally {
        this.isLoadingMoreMessages = false;
      }
    }
  }
}) 