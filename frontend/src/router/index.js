import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 页面组件
const Home = () => import('@/views/Home.vue')
const ResourceMarket = () => import('@/views/ResourceMarket.vue')
const News = () => import('@/views/News.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const UserProfile = () => import('@/views/UserProfile.vue')
const UserResources = () => import('@/views/UserResources.vue')
const UserFavorites = () => import('@/views/UserFavorites.vue')
const ResourceUpload = () => import('@/views/ResourceUpload.vue')
const Contact = () => import('@/views/Contact.vue')
const AboutUs = () => import('@/views/AboutUs.vue')
const BusinessCooperation = () => import('@/views/BusinessCooperation.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页 - Et 资源小站' }
  },
  {
    path: '/resource-market',
    name: 'ResourceMarket',
    component: ResourceMarket,
    meta: { title: '资源市场 - Et 资源小站' }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { title: '新闻资讯 - Et 资源小站' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '用户登录 - Et 资源小站',
      guest: true // 仅未登录用户可访问
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: '用户注册 - Et 资源小站',
      guest: true // 仅未登录用户可访问
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { 
      title: '个人中心 - Et 资源小站',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/resources/my',
    name: 'UserResources',
    component: UserResources,
    meta: { 
      title: '我的资源 - Et 资源小站',
      requiresAuth: true
    }
  },
  {
    path: '/resources/favorites',
    name: 'UserFavorites',
    component: UserFavorites,
    meta: {
      title: '我的收藏 - Et 资源小站',
      requiresAuth: true
    }
  },
  {
    path: '/resources/upload',
    name: 'ResourceUpload',
    component: ResourceUpload,
    meta: {
      title: '上传资源 - Et 资源小站',
      requiresAuth: true
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: { title: '联系我们 - Et 资源小站' }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUs,
    meta: { title: '关于我们 - Et 资源小站' }
  },
  {
    path: '/business-cooperation',
    name: 'BusinessCooperation',
    component: BusinessCooperation,
    meta: { title: '商务合作 - Et 资源小站' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫 - 处理身份验证和页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'Et 资源小站'
  
  const authStore = useAuthStore()
  
  // 如果页面需要身份验证且用户未登录，重定向到登录页
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } // 保存原目标路径，登录后可跳转回去
    })
  } 
  // 如果页面是仅限游客（如登录、注册页面）且用户已登录，重定向到首页
  else if (to.meta.guest && authStore.isLoggedIn) {
    next({ path: '/' })
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router 