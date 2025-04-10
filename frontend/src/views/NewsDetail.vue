<template>
  <div class="news-detail">
    <div class="container py-4">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载文章内容中...</p>
      </div>

      <!-- 文章内容 -->
      <div v-else-if="news" class="news-content">
        <div class="row mb-4">
          <div class="col-12">
            <router-link to="/news" class="btn btn-outline-secondary mb-3">
              <i class="bi bi-arrow-left"></i> 返回新闻列表
            </router-link>
            <h1 class="article-title">{{ news.title }}</h1>
            <div class="article-meta d-flex justify-content-between align-items-center flex-wrap">
              <div class="meta-info mb-2">
                <span class="me-3">
                  <i class="bi bi-calendar-event"></i> {{ formatDate(news.createdAt) }}
                </span>
                <span v-if="news.author" class="me-3">
                  <i class="bi bi-person"></i> {{ authorName }}
                </span>
                <span class="me-3">
                  <i class="bi bi-eye"></i> {{ news.views }} 阅读
                </span>
              </div>
              <div class="tags mb-2">
                <span 
                  v-for="tag in news.tags" 
                  :key="tag" 
                  class="badge bg-light text-dark me-2"
                  @click="goToTaggedNews(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 文章封面图 -->
        <div class="row mb-4" v-if="news.cover">
          <div class="col-12">
            <img :src="news.cover" :alt="news.title" class="img-fluid w-100 rounded article-cover">
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="row">
          <div class="col-md-8">
            <div class="article-content mb-5" v-html="news.content"></div>

            <!-- 分享按钮 -->
            <div class="sharing mb-5">
              <h5>分享本文</h5>
              <div class="d-flex">
                <button class="btn btn-sm btn-outline-primary me-2" @click="shareArticle('weibo')">
                  <i class="bi bi-sina-weibo"></i> 微博
                </button>
                <button class="btn btn-sm btn-outline-success me-2" @click="shareArticle('wechat')">
                  <i class="bi bi-wechat"></i> 微信
                </button>
                <button class="btn btn-sm btn-outline-info me-2" @click="shareArticle('facebook')">
                  <i class="bi bi-facebook"></i> Facebook
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="shareArticle('link')">
                  <i class="bi bi-link-45deg"></i> 复制链接
                </button>
              </div>
            </div>

            <!-- 相关文章 -->
            <div class="related-articles mb-5" v-if="relatedNews.length > 0">
              <h4>相关文章</h4>
              <div class="row">
                <div class="col-md-6 mb-3" v-for="article in relatedNews" :key="article.id">
                  <div class="card h-100">
                    <img 
                      :src="article.cover || 'https://via.placeholder.com/300x150?text=相关文章'" 
                      class="card-img-top" 
                      :alt="article.title" 
                      style="height: 150px; object-fit: cover;"
                    >
                    <div class="card-body">
                      <h5 class="card-title">{{ article.title }}</h5>
                      <p class="card-text small">{{ truncateContent(article.content, 80) }}</p>
                      <router-link :to="'/news/' + article.id" class="btn btn-sm btn-outline-primary">阅读全文</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="col-md-4">
            <!-- 热门文章 -->
            <div class="card mb-4">
              <div class="card-header">热门文章</div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="article in popularNews" :key="article.id">
                  <router-link :to="'/news/' + article.id" class="text-decoration-none">
                    {{ article.title }}
                  </router-link>
                  <small class="text-muted d-block">{{ formatDate(article.createdAt) }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 文章不存在 -->
      <div v-else class="alert alert-warning">
        <h3 class="text-center">未找到文章</h3>
        <p class="text-center">请检查链接是否正确，或者<router-link to="/news">返回新闻列表</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiConnector from '../api/connector';

export default {
  name: 'NewsDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const isLoading = ref(true);
    const news = ref(null);
    const popularNews = ref([]);
    const relatedNews = ref([]);
    
    // 计算属性：获取作者名称
    const authorName = computed(() => {
      if (!news.value || !news.value.author) return '未知作者';
      // 在实际应用中，这里应该查询用户系统获取作者信息
      if (news.value.author === 'user1') return '管理员';
      if (news.value.author === 'user2') return '普通用户';
      return news.value.author;
    });
    
    // 获取新闻详情
    const fetchNewsDetail = async (id) => {
      isLoading.value = true;
      try {
        news.value = await apiConnector.request({
          resource: 'news',
          action: 'get',
          id
        });
        
        if (news.value) {
          // 获取相关文章和热门文章
          await Promise.all([
            fetchRelatedNews(news.value.tags),
            fetchPopularNews()
          ]);
        }
      } catch (error) {
        console.error(`获取文章详情失败 (ID: ${id}):`, error);
        news.value = null;
      } finally {
        isLoading.value = false;
      }
    };
    
    // 获取相关文章
    const fetchRelatedNews = async (tags) => {
      if (!tags || !tags.length) {
        relatedNews.value = [];
        return;
      }
      
      try {
        // 按标签查询相关文章
        const results = await apiConnector.request({
          resource: 'news',
          action: 'list',
          params: {
            tags: [tags[0]] // 使用第一个标签来查找相关文章
          }
        });
        
        // 移除当前文章
        const filtered = results.filter(item => item.id !== news.value.id);
        
        // 只取前4篇相关文章
        relatedNews.value = filtered.slice(0, 4);
      } catch (error) {
        console.error('获取相关文章失败:', error);
        relatedNews.value = [];
      }
    };
    
    // 获取热门文章
    const fetchPopularNews = async () => {
      try {
        const allNews = await apiConnector.request({
          resource: 'news',
          action: 'list'
        });
        
        // 按浏览量排序
        popularNews.value = [...allNews]
          .sort((a, b) => b.views - a.views)
          .filter(item => item.id !== news.value.id) // 移除当前文章
          .slice(0, 5); // 只取前5篇
      } catch (error) {
        console.error('获取热门文章失败:', error);
        popularNews.value = [];
      }
    };
    
    // 按标签进入新闻列表
    const goToTaggedNews = (tag) => {
      router.push({
        path: '/news',
        query: { tag }
      });
    };
    
    // 分享文章
    const shareArticle = (platform) => {
      if (!news.value) return;
      
      const url = window.location.href;
      const title = news.value.title;
      let shareUrl = '';
      
      switch (platform) {
        case 'weibo':
          shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
          break;
        case 'wechat':
          // 在实际环境中，这里应该调用微信JSSDK或显示二维码
          alert('请使用微信扫描二维码分享');
          return;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'link':
          // 复制链接到剪贴板
          navigator.clipboard.writeText(url).then(() => {
            alert('链接已复制到剪贴板');
          }).catch(err => {
            console.error('复制链接失败:', err);
            alert('复制链接失败，请手动复制地址栏URL');
          });
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=500');
      }
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 截断内容
    const truncateContent = (content, maxLength = 100) => {
      // 移除HTML标签
      const plainText = content.replace(/<[^>]*>/g, '');
      
      if (plainText.length <= maxLength) return plainText;
      return plainText.substring(0, maxLength) + '...';
    };
    
    onMounted(() => {
      const newsId = route.params.id;
      if (newsId) {
        fetchNewsDetail(newsId);
      } else {
        router.push('/news');
      }
    });
    
    return {
      isLoading,
      news,
      popularNews,
      relatedNews,
      authorName,
      goToTaggedNews,
      shareArticle,
      formatDate,
      truncateContent
    };
  }
};
</script>

<style scoped>
.news-detail {
  padding: 2rem 0;
}

.article-title {
  font-size: 2.25rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.article-meta {
  margin-bottom: 1.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.article-cover {
  max-height: 500px;
  object-fit: cover;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.7;
}

.article-content :deep(h2) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.article-content :deep(p) {
  margin-bottom: 1.25rem;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto;
  border-radius: 4px;
}

.sharing h5 {
  margin-bottom: 1rem;
}

.tags .badge {
  cursor: pointer;
  padding: 0.5rem 0.8rem;
  transition: all 0.2s;
}

.tags .badge:hover {
  background-color: var(--bs-primary) !important;
  color: white !important;
}
</style> 