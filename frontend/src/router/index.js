import { createRouter, createWebHistory } from 'vue-router'

// 页面组件
const Home = () => import('@/views/Home.vue')
const ResourceMarket = () => import('@/views/ResourceMarket.vue')
const News = () => import('@/views/News.vue')
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

// 全局前置守卫 - 修改页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Et 资源小站'
  next()
})

export default router 