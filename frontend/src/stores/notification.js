import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    nextId: 1
  }),
  
  getters: {
    unreadCount: (state) => {
      return state.notifications.filter(n => !n.read).length
    }
  },
  
  actions: {
    addNotification(notification) {
      const id = this.nextId++
      this.notifications.unshift({
        id,
        read: false,
        time: new Date().toISOString(),
        ...notification
      })
      
      // 限制通知数量
      if (this.notifications.length > 50) {
        this.notifications.pop()
      }
    },
    
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },
    
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
    },
    
    clearNotifications() {
      this.notifications = []
      this.nextId = 1
    }
  }
}) 