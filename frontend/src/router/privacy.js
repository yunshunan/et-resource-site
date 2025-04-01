import { createRouter, createWebHistory } from 'vue-router'
import PrivacyPolicy from '@/components/privacy/PrivacyPolicy.vue'
import PrivacySettings from '@/components/privacy/PrivacySettings.vue'

const routes = [
  {
    path: '/privacy/policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: {
      title: '隐私政策',
      requiresAuth: false
    }
  },
  {
    path: '/privacy/settings',
    name: 'PrivacySettings',
    component: PrivacySettings,
    meta: {
      title: '隐私设置',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 