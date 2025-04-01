<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <img src="@/assets/logo.svg" alt="Et 资源小站" height="40" v-if="false">
          <span class="fw-bold text-primary">Et 资源小站</span>
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" active-class="active">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/resource-market" active-class="active">资源市场</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/news" active-class="active">新闻资讯</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/contact" active-class="active">联系我们</router-link>
            </li>
            
            <!-- 未登录状态显示登录注册按钮 -->
            <template v-if="!authStore.isLoggedIn">
              <li class="nav-item">
                <router-link class="nav-link" to="/login">登录</router-link>
              </li>
              <li class="nav-item">
                <router-link class="btn btn-primary btn-sm nav-btn" to="/register">注册</router-link>
              </li>
            </template>
            
            <!-- 已登录状态显示用户菜单 -->
            <li class="nav-item dropdown" v-else>
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img 
                  :src="userAvatar" 
                  alt="用户头像" 
                  class="rounded-circle me-1" 
                  width="24" 
                  height="24"
                >
                {{ authStore.user?.username || '用户' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="bi bi-person me-2"></i>个人中心
                  </router-link>
                </li>
                <!-- 管理员菜单项 -->
                <li v-if="authStore.isAdmin">
                  <router-link class="dropdown-item" to="/performance-dashboard">
                    <i class="bi bi-speedometer2 me-2"></i>性能监控
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>退出登录
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'HeaderComponent',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    // 默认头像
    const defaultAvatar = 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
    const userAvatar = computed(() => authStore.user?.avatar || defaultAvatar)
    
    // 处理退出登录
    const handleLogout = async () => {
      await authStore.logout()
      router.push('/')
    }
    
    return {
      authStore,
      userAvatar,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.75rem 1rem;
}

.nav-link {
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0.5rem;
  transition: color 0.3s ease;
}

.nav-link:hover, .nav-link.active {
  color: var(--primary-color);
}

.nav-btn {
  margin: 0.4rem 0.5rem;
  padding: 0.4rem 1rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item:active {
  background-color: var(--primary-color);
}
</style> 