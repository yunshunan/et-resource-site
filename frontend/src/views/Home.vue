<template>
  <div class="home-page">
    <!-- 主横幅 -->
    <section class="hero bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">欢迎访问 Et 资源小站</h1>
            <p class="lead mb-4">这是一个用于分享和获取各类资源的专业平台，为您提供高质量的数字资源和服务</p>
            <div class="d-flex flex-wrap gap-2">
              <router-link to="/resource-market" class="btn btn-light btn-lg">
                浏览资源
              </router-link>
              <router-link to="/register" class="btn btn-outline-light btn-lg">
                立即注册
              </router-link>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <img src="@/assets/logo.svg" alt="Et 资源小站" class="img-fluid" style="max-height: 300px;" />
          </div>
        </div>
      </div>
    </section>

    <!-- 特色内容 -->
    <section class="features py-5">
      <div class="container">
        <h2 class="text-center section-heading mb-5">我们的优势</h2>
        
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <i class="bi bi-book text-primary" style="font-size: 3rem;"></i>
                </div>
                <h3 class="card-title">海量资源</h3>
                <p class="card-text">提供各种类型的资源，满足您的不同需求</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <i class="bi bi-lightning-charge text-primary" style="font-size: 3rem;"></i>
                </div>
                <h3 class="card-title">快速下载</h3>
                <p class="card-text">优化的服务器让您获取资源更加便捷</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
                </div>
                <h3 class="card-title">安全可靠</h3>
                <p class="card-text">所有资源经过审核，确保质量和安全</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新资源展示 -->
    <section class="latest-resources py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-heading mb-0">最新上传资源</h2>
          <router-link to="/resource-market" class="btn btn-primary">查看全部</router-link>
        </div>
        
        <div class="row">
          <div v-for="i in 3" :key="i" class="col-md-4 mb-4">
            <div class="card h-100 resource-card">
              <div class="card-img-container">
                <LazyImage 
                  :src="`https://picsum.photos/seed/${i}/600/400`" 
                  :alt="`资源示例图片 ${i}`"
                  loading-text="资源加载中..." 
                  img-style="width: 100%; height: 200px; object-fit: cover;"
                  class="card-img-top"
                />
                <span class="badge bg-primary position-absolute top-0 end-0 m-2">热门</span>
              </div>
              <div class="card-body">
                <h5 class="card-title">示例资源标题 {{ i }}</h5>
                <p class="card-text">这是一个示例资源描述，展示了资源的基本信息和用途。</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">2023-05-{{ 10 + i }}</small>
                  <router-link :to="`/resource-market/${i}`" class="btn btn-sm btn-outline-primary">查看详情</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门新闻资讯 -->
    <section class="news-section py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-heading mb-0">热门新闻资讯</h2>
          <router-link to="/news" class="btn btn-primary">更多资讯</router-link>
        </div>
        
        <div class="row">
          <!-- 主要新闻 -->
          <div class="col-lg-6 mb-4">
            <div class="card featured-news h-100">
              <div class="row g-0 h-100">
                <div class="col-md-6 h-100">
                  <LazyImage 
                    src="https://picsum.photos/seed/featured/600/400" 
                    alt="特色新闻图片"
                    loading-text="加载中..." 
                    img-style="width: 100%; height: 100%; object-fit: cover;"
                    class="featured-img"
                  />
                </div>
                <div class="col-md-6">
                  <div class="card-body d-flex flex-column h-100">
                    <span class="badge bg-danger mb-2">置顶</span>
                    <h4 class="card-title">行业最新动态：资源共享平台的未来发展趋势</h4>
                    <p class="card-text flex-grow-1">随着数字化转型的深入，资源共享平台正成为各行业发展的重要基础设施，本文深入分析了未来发展趋势...</p>
                    <div class="mt-auto">
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">2023-06-15</small>
                        <router-link to="/news/1" class="btn btn-sm btn-outline-primary">阅读全文</router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 新闻列表 -->
          <div class="col-lg-6">
            <div class="row">
              <div v-for="i in 3" :key="i" class="col-12 mb-4">
                <div class="card news-card">
                  <div class="row g-0">
                    <div class="col-4 position-relative" style="height: 120px;">
                      <LazyImage 
                        :src="`https://picsum.photos/seed/news${i}/300/200`" 
                        :alt="`新闻图片 ${i}`"
                        loading-text="加载中..." 
                        img-style="width: 100%; height: 100%; object-fit: cover;"
                        class="news-img"
                      />
                    </div>
                    <div class="col-8">
                      <div class="card-body py-2">
                        <h5 class="card-title news-title">{{ getNewsTitle(i) }}</h5>
                        <p class="card-text news-excerpt">{{ getNewsExcerpt(i) }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">2023-06-{{ 10 + i }}</small>
                          <router-link :to="`/news/${i + 1}`" class="news-link">阅读全文</router-link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用统计 -->
    <section class="stats py-5 bg-light">
      <div class="container">
        <h2 class="text-center section-heading mb-5">平台数据</h2>
        
        <div class="row text-center">
          <div class="col-md-3 mb-4">
            <div class="stat-item">
              <h3 class="fw-bold text-primary" style="font-size: 2.5rem;">5,000+</h3>
              <p class="text-muted">资源总数</p>
            </div>
          </div>
          
          <div class="col-md-3 mb-4">
            <div class="stat-item">
              <h3 class="fw-bold text-primary" style="font-size: 2.5rem;">10,000+</h3>
              <p class="text-muted">注册用户</p>
            </div>
          </div>
          
          <div class="col-md-3 mb-4">
            <div class="stat-item">
              <h3 class="fw-bold text-primary" style="font-size: 2.5rem;">50,000+</h3>
              <p class="text-muted">资源下载</p>
            </div>
          </div>
          
          <div class="col-md-3 mb-4">
            <div class="stat-item">
              <h3 class="fw-bold text-primary" style="font-size: 2.5rem;">98%</h3>
              <p class="text-muted">用户满意度</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 号召性用语 -->
    <section class="cta py-5 bg-primary text-white">
      <div class="container text-center">
        <h2 class="mb-4">立即加入我们的社区</h2>
        <p class="lead mb-4">注册成为会员，获取更多优质资源和专属服务</p>
        <router-link to="/register" class="btn btn-light btn-lg px-4 py-2">
          免费注册
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import LazyImage from '@/components/common/LazyImage.vue'

export default defineComponent({
  name: 'HomePage',
  components: {
    LazyImage
  },
  methods: {
    getNewsTitle(index) {
      const titles = [
        '资源共享平台如何推动教育创新发展',
        '数字资源版权保护新规出台，影响几何？',
        '如何高效利用在线资源提升工作效率'
      ]
      return titles[index - 1] || `新闻标题 ${index}`
    },
    getNewsExcerpt(index) {
      const excerpts = [
        '近年来，资源共享平台在教育领域的应用日益广泛，为教育创新提供了新的可能...',
        '随着数字资源市场规模扩大，版权保护成为业界关注焦点，新规将如何影响市场格局？',
        '面对信息爆炸时代，如何筛选和利用优质在线资源成为职场人士的必备技能...'
      ]
      return excerpts[index - 1] || `新闻摘要 ${index}`
    }
  }
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, #1a65a3 100%);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(13, 110, 253, 0.1);
}

.card-img-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.latest-resources .card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.latest-resources .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.resource-card .card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 新闻资讯样式 */
.news-section {
  background-color: #fff;
}

.featured-news {
  overflow: hidden;
  border-radius: 10px;
}

.featured-img {
  border-radius: 10px 0 0 10px;
}

.news-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  border-radius: 8px;
  height: 100%;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.news-img {
  border-radius: 8px 0 0 8px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-excerpt {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-link {
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
}

.news-link:hover {
  text-decoration: underline;
}

.stats .stat-item {
  padding: 2rem;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stats .stat-item:hover {
  transform: translateY(-5px);
}

.cta {
  background: linear-gradient(135deg, var(--primary-color) 0%, #1a65a3 100%);
}
</style> 