import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 导入视图组件
import Home from '@/views/Home.vue'
import About from '@/views/AboutUs.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/UserProfile.vue'
import ResourceMarket from '@/views/ResourceMarket.vue'
import Contact from '@/views/Contact.vue'
import News from '@/views/News.vue'
import NotFound from '@/views/NotFoundView.vue'
import PerformanceDashboard from '@/views/PerformanceDashboard.vue'
import BusinessCooperation from '@/views/BusinessCooperation.vue'
import ResourceUpload from '@/views/ResourceUpload.vue'
import UserFavorites from '@/views/UserFavorites.vue'
import UserResources from '@/views/UserResources.vue'

// 管理员页面
import AdminLayout from '@/views/admin/AdminLayout.vue'
import PerformanceView from '@/views/admin/PerformanceView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: About,
    meta: { title: '关于我们' }
  },
  {
    path: '/business-cooperation',
    name: 'BusinessCooperation',
    component: BusinessCooperation,
    meta: { title: '商务合作' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册', guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/resource-market',
    name: 'ResourceMarket',
    component: ResourceMarket,
    meta: { title: '资源市场' }
  },
  {
    path: '/resource-upload',
    name: 'ResourceUpload',
    component: ResourceUpload,
    meta: { title: '上传资源', requiresAuth: true }
  },
  {
    path: '/user-resources',
    name: 'UserResources',
    component: UserResources,
    meta: { title: '我的资源', requiresAuth: true }
  },
  {
    path: '/user-favorites',
    name: 'UserFavorites',
    component: UserFavorites,
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: { title: '联系我们' }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { title: '新闻资讯' }
  },
  {
    path: '/performance-dashboard',
    name: 'PerformanceDashboard',
    component: PerformanceDashboard,
    meta: { title: '性能监控', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: AdminLayout,
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'performance',
        name: 'AdminPerformance',
        component: PerformanceView,
        meta: { title: '性能监控', requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - Et资源小站` 
    : 'Et资源小站'
  
  const authStore = useAuthStore()
  
  // 需要登录访问的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  }
  
  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ path: '/' })
  }
  
  // 已登录用户不能访问的页面（如登录、注册）
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next({ path: '/' })
  }
  
  next()
})

export default router
