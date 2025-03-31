<template>
  <div class="home">
    <!-- 轮播图 -->
    <div id="homeCarousel" class="carousel slide mb-5" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active" v-for="(banner, index) in banners" :key="banner.id" :class="{ active: index === 0 }">
          <div class="position-relative">
            <img :src="banner.imageUrl" class="d-block w-100" :alt="banner.title" style="height: 400px; object-fit: cover;">
            <div class="carousel-caption d-none d-md-block">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.description }}</p>
              <button class="btn btn-primary" @click="navigateTo(banner.link)">了解更多</button>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <!-- 热门资源 -->
    <section class="container mb-5">
      <h2 class="section-heading text-center">热门资源</h2>
      <div class="row">
        <div class="col-md-4 mb-4" v-for="resource in featuredResources" :key="resource.id">
          <div class="card h-100">
            <img :src="resource.imageUrl" class="card-img-top" :alt="resource.title" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ resource.title }}</h5>
              <p class="card-text">{{ resource.description }}</p>
              <router-link :to="'/resource-market/' + resource.id" class="btn btn-primary">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <router-link to="/resource-market" class="btn btn-outline-primary">浏览更多资源</router-link>
      </div>
    </section>

    <!-- 最新资讯 -->
    <section class="container mb-5">
      <h2 class="section-heading text-center">最新资讯</h2>
      <div class="row">
        <div class="col-md-6 mb-4" v-for="news in latestNews" :key="news.id">
          <div class="card h-100">
            <div class="row g-0">
              <div class="col-md-4">
                <img :src="news.imageUrl" class="img-fluid rounded-start h-100" :alt="news.title" style="object-fit: cover;">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">{{ news.title }}</h5>
                  <p class="card-text">{{ news.summary }}</p>
                  <p class="card-text"><small class="text-muted">{{ news.date }}</small></p>
                  <router-link :to="'/news/' + news.id" class="btn btn-sm btn-outline-primary">阅读更多</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <router-link to="/news" class="btn btn-outline-primary">查看所有资讯</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { homeApi } from '@/services/api'

export default {
  name: 'HomePage',
  data() {
    return {
      banners: [
        {
          id: 1,
          title: '优质资源分享平台',
          description: '为您提供最全面的资源共享服务',
          imageUrl: 'https://via.placeholder.com/1200x400/3498db/ffffff?text=优质资源分享平台',
          link: '/resource-market'
        },
        {
          id: 2,
          title: '最新行业资讯',
          description: '掌握行业动态，了解最新趋势',
          imageUrl: 'https://via.placeholder.com/1200x400/2ecc71/ffffff?text=最新行业资讯',
          link: '/news'
        },
        {
          id: 3,
          title: '商务合作',
          description: '期待与您的精彩合作',
          imageUrl: 'https://via.placeholder.com/1200x400/e74c3c/ffffff?text=商务合作',
          link: '/business-cooperation'
        }
      ],
      featuredResources: [],
      latestNews: []
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },
    async fetchHomeData() {
      try {
        // 使用模拟数据，实际项目中应该从API获取
        this.featuredResources = [
          {
            id: 1,
            title: '高质量PPT模板集合',
            description: '包含50+ 精美商务PPT模板，适用于各种场景',
            imageUrl: 'https://via.placeholder.com/400x300/3498db/ffffff?text=PPT模板',
            category: '办公资源'
          },
          {
            id: 2,
            title: 'UI设计资源包',
            description: '最新UI设计素材，包括图标、插图和界面组件',
            imageUrl: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=UI设计资源',
            category: '设计资源'
          },
          {
            id: 3,
            title: '电商营销策略指南',
            description: '详细的电商营销策略与案例分析',
            imageUrl: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=营销策略',
            category: '营销资源'
          }
        ]
        
        this.latestNews = [
          {
            id: 1,
            title: '2025年设计趋势展望',
            summary: '探索未来一年的设计趋势，了解创意领域的最新变化',
            imageUrl: 'https://via.placeholder.com/200x200/3498db/ffffff?text=设计趋势',
            date: '2025-03-15'
          },
          {
            id: 2,
            title: '新一代人工智能技术应用',
            summary: '人工智能技术如何改变内容创作和资源开发的方式',
            imageUrl: 'https://via.placeholder.com/200x200/2ecc71/ffffff?text=AI技术',
            date: '2025-03-10'
          },
          {
            id: 3,
            title: '数字营销最佳实践分享',
            summary: '来自行业专家的数字营销策略与实践经验',
            imageUrl: 'https://via.placeholder.com/200x200/e74c3c/ffffff?text=数字营销',
            date: '2025-03-05'
          },
          {
            id: 4,
            title: '内容创作者必备工具合集',
            summary: '提升效率的优质内容创作工具推荐',
            imageUrl: 'https://via.placeholder.com/200x200/9b59b6/ffffff?text=创作工具',
            date: '2025-03-01'
          }
        ]
        
        // 使用API获取数据的代码（暂时注释掉，使用静态数据代替）
        // const response = await homeApi.getHomeData()
        // this.banners = response.banners
        // this.featuredResources = response.featuredResources
        // this.latestNews = response.latestNews
        
      } catch (error) {
        console.error('获取首页数据失败:', error)
      }
    }
  },
  mounted() {
    this.fetchHomeData()
  }
}
</script>

<style scoped>
.carousel-caption {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 20px;
}
</style> 