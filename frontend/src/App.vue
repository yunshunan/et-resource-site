<template>
  <div id="app">
    <header-component />
    <main class="page-container">
      <router-view />
    </main>
    <footer-component />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const authStore = useAuthStore()
    
    // 在应用启动时尝试获取用户信息
    onMounted(async () => {
      // 如果有token，尝试获取用户信息
      if (authStore.token) {
        await authStore.fetchCurrentUser()
      }
    })
    
    return {
      authStore
    }
  }
}
</script>

<style>
:root {
  --primary-color: #0d6efd;
  --text-color: #4a4a4a;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: var(--text-color);
}

main {
  flex: 1;
}
</style> 