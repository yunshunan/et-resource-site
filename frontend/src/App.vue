<template>
  <div id="app">
    <header-component />
    <main class="page-container">
      <router-view />
      <NetworkDebugger />
      <PerformancePanel />
      <PrivacyNotice />
    </main>
    <footer-component />
  </div>
</template>

<script>
import { onMounted, defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePrivacyStore } from '@/stores/privacy'
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'
import NetworkDebugger from '@/components/dev/NetworkDebugger.vue'
import PerformancePanel from '@/components/dev/PerformancePanel.vue'
import PrivacyNotice from '@/components/privacy/PrivacyNotice.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
    NetworkDebugger,
    PerformancePanel,
    PrivacyNotice
  },
  setup() {
    const authStore = useAuthStore()
    const privacyStore = usePrivacyStore()
    
    // 在应用启动时尝试获取用户信息
    onMounted(async () => {
      // 如果有token，尝试获取用户信息
      if (authStore.token) {
        await authStore.fetchCurrentUser()
      }
      await privacyStore.loadConsent()
    })
    
    return {
      authStore,
      privacyStore
    }
  }
})
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