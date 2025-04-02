<template>
  <div id="app">
    <Navigation />
    <main class="page-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'

export default defineComponent({
  name: 'App',
  components: {
    Navigation,
    FooterComponent
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