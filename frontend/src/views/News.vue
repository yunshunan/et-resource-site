<template>
  <div class="news-page">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="section-heading text-center">新闻资讯</h1>
          <p class="text-center text-muted">了解最新行业动态和资源信息</p>
        </div>
      </div>

      <!-- 置顶新闻 -->
      <div class="row mb-5" v-if="featuredNews">
        <div class="col-12">
          <div class="card mb-3 featured-news">
            <div class="row g-0">
              <div class="col-md-5">
                <img :src="featuredNews.imageUrl" class="img-fluid rounded-start h-100" :alt="featuredNews.title" style="object-fit: cover;">
              </div>
              <div class="col-md-7">
                <div class="card-body">
                  <span class="badge bg-primary mb-2">置顶</span>
                  <h3 class="card-title">{{ featuredNews.title }}</h3>
                  <p class="card-text">{{ featuredNews.summary }}</p>
                  <p class="card-text"><small class="text-muted">发布日期: {{ featuredNews.date }}</small></p>
                  <router-link :to="'/news/' + featuredNews.id" class="btn btn-primary">阅读全文</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div class="row">
        <div class="col-md-8">
          <div class="news-list">
            <div class="card mb-4" v-for="news in newsList" :key="news.id">
              <div class="row g-0">
                <div class="col-md-4">
                  <img :src="news.imageUrl" class="img-fluid rounded-start h-100" :alt="news.title" style="object-fit: cover;">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">{{ news.title }}</h5>
                    <p class="card-text">{{ news.summary }}</p>
                    <p class="card-text d-flex justify-content-between">
                      <small class="text-muted">{{ news.date }}</small>
                      <router-link :to="'/news/' + news.id" class="btn btn-sm btn-outline-primary">阅读全文</router-link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <nav aria-label="Page navigation" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">上一页</a>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">下一页</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 侧边栏 -->
        <div class="col-md-4">
          <!-- 热门标签 -->
          <div class="card mb-4">
            <div class="card-header">热门标签</div>
            <div class="card-body">
              <div class="tags">
                <span class="badge bg-light text-dark me-2 mb-2" v-for="tag in tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- 热门文章 -->
          <div class="card">
            <div class="card-header">热门文章</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="article in popularArticles" :key="article.id">
                <router-link :to="'/news/' + article.id" class="text-decoration-none">{{ article.title }}</router-link>
                <small class="text-muted d-block">{{ article.date }}</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { newsApi } from '@/services/api'

export default {
  name: 'NewsPage',
  data() {
    return {
      featuredNews: null,
      newsList: [],
      currentPage: 1,
      pageSize: 5,
      totalNews: 0,
      tags: ['设计', '营销', '办公', '教育', '技术', '前端', '后端', '创意', 'AI'],
      popularArticles: []
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalNews / this.pageSize)
    }
  },
  methods: {
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchNews()
    },
    async fetchNews() {
      try {
        // 使用静态数据代替API调用
        // const response = await newsApi.getNewsList(this.currentPage)
        // this.newsList = response.news
        // this.totalNews = response.total

        // 静态置顶新闻
        this.featuredNews = {
          id: 1,
          title: '2025年设计趋势展望：从极简主义到数字沉浸式体验',
          summary: '随着技术的不断发展，设计领域正迎来翻天覆地的变化。本文深入探讨2025年设计界将呈现的主要趋势，从极简主义的回归到沉浸式数字体验的兴起，为设计师和创意工作者提供前瞻性的行业洞察。',
          imageUrl: 'https://via.placeholder.com/800x400/3498db/ffffff?text=2025设计趋势',
          date: '2025-03-15'
        }

        // 静态新闻列表
        this.newsList = [
          {
            id: 2,
            title: '新一代人工智能技术如何改变内容创作',
            summary: '人工智能技术正在彻底改变内容创作的方式。从自动生成文本到智能图像处理，AI工具正在帮助创作者提高效率，突破创意瓶颈。',
            imageUrl: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=AI创作',
            date: '2025-03-10'
          },
          {
            id: 3,
            title: '数字营销最佳实践分享：来自顶级品牌的经验',
            summary: '在数字化时代，有效的营销策略对于品牌成功至关重要。本文汇总了行业领先品牌的数字营销策略和实践经验，为企业提供实用指南。',
            imageUrl: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=数字营销',
            date: '2025-03-05'
          },
          {
            id: 4,
            title: '内容创作者必备工具合集：提升效率与质量',
            summary: '作为内容创作者，选择合适的工具可以显著提升工作效率和输出质量。本文推荐了一系列从构思到发布的实用工具，助您打造高质量内容。',
            imageUrl: 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=创作工具',
            date: '2025-03-01'
          },
          {
            id: 5,
            title: '远程办公新趋势：工具与最佳实践',
            summary: '随着远程工作的普及，高效的协作工具和实践变得尤为重要。探索2025年远程办公的新趋势和解决方案。',
            imageUrl: 'https://via.placeholder.com/400x300/f39c12/ffffff?text=远程办公',
            date: '2025-02-25'
          },
          {
            id: 6,
            title: '教育资源数字化：挑战与机遇',
            summary: '教育资源的数字化转型正在改变学习方式。本文分析了这一趋势带来的挑战和机遇，以及对未来教育的影响。',
            imageUrl: 'https://via.placeholder.com/400x300/16a085/ffffff?text=教育数字化',
            date: '2025-02-20'
          }
        ]

        // 热门文章
        this.popularArticles = [
          { id: 1, title: '2025年设计趋势展望', date: '2025-03-15' },
          { id: 7, title: '前端开发框架对比：2025版', date: '2025-02-15' },
          { id: 8, title: 'UX写作：提升用户体验的文字技巧', date: '2025-02-10' },
          { id: 9, title: '色彩心理学在品牌设计中的应用', date: '2025-02-05' },
          { id: 10, title: '视频内容营销完全指南', date: '2025-01-30' }
        ]

        this.totalNews = 15 // 模拟总新闻数量
      } catch (error) {
        console.error('获取新闻列表失败:', error)
      }
    }
  },
  mounted() {
    this.fetchNews()
  }
}
</script>

<style scoped>
.news-page {
  padding: 2rem 0;
}

.featured-news {
  transition: transform 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.featured-news:hover {
  transform: translateY(-5px);
}

.tags .badge {
  padding: 0.5rem 0.8rem;
  transition: background-color 0.3s;
  cursor: pointer;
}

.tags .badge:hover {
  background-color: var(--primary-color);
  color: white;
}
</style> 