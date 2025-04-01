<template>
  <div class="admin-layout">
    <nav class="admin-nav">
      <div class="nav-header">
        <h2>管理后台</h2>
      </div>
      <ul class="nav-menu">
        <li>
          <router-link to="/admin/dashboard" active-class="active">
            <i class="fas fa-chart-line"></i>
            仪表盘
          </router-link>
        </li>
        <li>
          <router-link to="/admin/resources" active-class="active">
            <i class="fas fa-box"></i>
            资源管理
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" active-class="active">
            <i class="fas fa-users"></i>
            用户管理
          </router-link>
        </li>
        <li>
          <router-link to="/admin/performance" active-class="active">
            <i class="fas fa-tachometer-alt"></i>
            性能监控
          </router-link>
        </li>
        <li>
          <router-link to="/admin/settings" active-class="active">
            <i class="fas fa-cog"></i>
            系统设置
          </router-link>
        </li>
      </ul>
      <div class="nav-footer">
        <button @click="logout" class="btn btn-danger">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </nav>
    
    <main class="admin-content">
      <div class="content-header">
        <h1>{{ currentPageTitle }}</h1>
        <div class="header-actions">
          <button @click="toggleNotifications" class="btn btn-icon">
            <i class="fas fa-bell"></i>
            <span v-if="unreadNotifications" class="notification-badge">
              {{ unreadNotifications }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- 通知面板 -->
    <div v-if="showNotifications" class="notifications-panel">
      <div class="panel-header">
        <h3>通知</h3>
        <button @click="toggleNotifications" class="btn btn-icon">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="panel-body">
        <div v-if="notifications.length" class="notifications-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon" :class="notification.type">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.time) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-notifications">
          暂无通知
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    const showNotifications = ref(false)
    const notifications = computed(() => notificationStore.notifications)
    const unreadNotifications = computed(() => notificationStore.unreadCount)
    
    const currentPageTitle = computed(() => {
      const titles = {
        'AdminDashboard': '仪表盘',
        'AdminResources': '资源管理',
        'AdminUsers': '用户管理',
        'AdminPerformance': '性能监控',
        'AdminSettings': '系统设置'
      }
      return titles[route.name] || '管理后台'
    })
    
    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
    }
    
    const markAsRead = (id) => {
      notificationStore.markAsRead(id)
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || 'fas fa-bell'
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString()
    }
    
    return {
      showNotifications,
      notifications,
      unreadNotifications,
      currentPageTitle,
      logout,
      toggleNotifications,
      markAsRead,
      getNotificationIcon,
      formatTime
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-nav {
  width: 250px;
  background: #2c3e50;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.nav-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.nav-menu {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-menu li a:hover,
.nav-menu li a.active {
  background: rgba(255,255,255,0.1);
}

.nav-menu li a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.admin-content {
  flex: 1;
  background: #f5f6fa;
  padding: 20px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: #fff;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.notifications-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background: #e9ecef;
}

.notification-item.unread {
  background: #e3f2fd;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.notification-icon.success { background: #d4edda; color: #155724; }
.notification-icon.warning { background: #fff3cd; color: #856404; }
.notification-icon.error { background: #f8d7da; color: #721c24; }
.notification-icon.info { background: #d1ecf1; color: #0c5460; }

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px;
  font-size: 14px;
}

.notification-content p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.no-notifications {
  text-align: center;
  padding: 20px;
  color: #666;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .admin-nav {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: left 0.3s;
  }
  
  .admin-nav.active {
    left: 0;
  }
  
  .admin-content {
    margin-left: 0;
  }
}
</style> 