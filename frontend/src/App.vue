<template>
  <div id="app">
    <Navigation />
    <main class="page-container">
      <!-- 恢复路由过渡效果 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <!-- 
      <router-view /> 
      -->
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import { defineComponent, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@/components/layout/Navigation.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'App',
  components: {
    Navigation,
    FooterComponent
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    // 清除所有可能存在的 Bootstrap modal 背景和相关元素
    const cleanupModals = () => {
      console.log('[App] 清理所有模态框和背景');
      // 移除所有模态框背景
      document.querySelectorAll('.modal-backdrop').forEach(el => {
        el.remove();
      });
      
      // 移除打开的模态框上的 classes 和内联样式
      document.querySelectorAll('.modal.show').forEach(el => {
        el.classList.remove('show');
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      });
      
      // 移除 body 上可能添加的 modal 相关类
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
    };

    // 监听路由变化，确保在路由变化时清理模态框
    watch(() => router.currentRoute.value.fullPath, (newPath, oldPath) => {
      if (newPath !== oldPath) {
        console.log(`[App] 路由变化: ${oldPath} -> ${newPath}`);
        // 添加延迟以确保在 Vue 组件销毁后清理模态框
        setTimeout(() => {
          cleanupModals();
        }, 100);
      }
    });

    onMounted(() => {
      // Call checkAuth to verify JWT and fetch user on app load
      // Remove authStore.init() unless it serves a specific purpose not covered by checkAuth
      // console.log('App onMounted: Calling checkAuth...'); // Keep log if helpful
      authStore.checkAuth(); 
      
      // 初始清理，以防有残留的 modal
      cleanupModals();
    })

    return {
      // ... existing return values ...
    }
  },
  beforeCreate() {
    console.log('App beforeCreate hook')
  },
  created() {
    console.log('App created hook')
  },
  beforeMount() {
    console.log('App beforeMount hook')
  },
  mounted() {
    console.log('App mounted hook')
    this.$nextTick(() => {
      console.log('App $nextTick - DOM fully rendered')
    })
  },
  beforeUpdate() {
    console.log('App beforeUpdate hook')
  },
  updated() {
    console.log('App updated hook')
  },
  beforeUnmount() {
    console.log('App beforeUnmount hook')
  },
  unmounted() {
    console.log('App unmounted hook')
  },
  errorCaptured(err, instance, info) {
    console.error('App errorCaptured:', err)
    console.error('Error occurred in component:', instance)
    console.error('Error info:', info)
    return false
  }
})
</script>

<style>
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --info-color: #3498db;
  --text-color: #4a4a4a;
  --light-bg: #f8f9fa;
  --border-radius: 0.375rem;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--light-bg);
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-container {
  flex: 1;
  padding-top: 1.5rem;
  padding-bottom: 3rem;
}

.section-heading {
  position: relative;
  display: inline-block;
  margin-bottom: 2.5rem;
  font-weight: 700;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-color);
  width: 60px;
  margin: 0 auto;
}

/* 全局卡片样式 */
.card {
  border: none;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 全局按钮样式增强 */
.btn {
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.25);
}

/* 全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 