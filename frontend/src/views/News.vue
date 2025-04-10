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
      <div class="row mb-5" v-if="featuredNews.length > 0">
        <div class="col-12">
          <div class="card mb-3 featured-news">
            <div class="row g-0">
              <div class="col-md-5">
                <img :src="featuredNews[0].cover || 'https://via.placeholder.com/800x400/3498db/ffffff?text=新闻封面'" 
                     class="img-fluid rounded-start h-100" 
                     :alt="featuredNews[0].title" 
                     style="object-fit: cover;">
              </div>
              <div class="col-md-7">
                <div class="card-body">
                  <span class="badge bg-primary mb-2">置顶</span>
                  <h3 class="card-title">{{ featuredNews[0].title }}</h3>
                  <p class="card-text">{{ truncateContent(featuredNews[0].content, 200) }}</p>
                  <p class="card-text"><small class="text-muted">发布日期: {{ formatDate(featuredNews[0].createdAt) }}</small></p>
                  <router-link :to="'/news/' + featuredNews[0].id" class="btn btn-primary">阅读全文</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div class="row">
        <div class="col-md-8">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2">加载新闻数据中...</p>
          </div>
          <div v-else class="news-list">
            <div class="card mb-4" v-for="news in newsList" :key="news.id">
              <div class="row g-0">
                <div class="col-md-4">
                  <img :src="news.cover || 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=新闻'" 
                       class="img-fluid rounded-start h-100" 
                       :alt="news.title" 
                       style="object-fit: cover;">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">{{ news.title }}</h5>
                    <p class="card-text">{{ truncateContent(news.content, 100) }}</p>
                    <p class="card-text d-flex justify-content-between">
                      <small class="text-muted">{{ formatDate(news.createdAt) }}</small>
                      <router-link :to="'/news/' + news.id" class="btn btn-sm btn-outline-primary">阅读全文</router-link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <nav aria-label="Page navigation" class="mt-4" v-if="!isLoading && totalPages > 0">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: isPreviousDisabled }">
                <a class="page-link" href="#" @click.prevent="goToPreviousPage">上一页</a>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: isNextDisabled }">
                <a class="page-link" href="#" @click.prevent="goToNextPage">下一页</a>
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
                <span 
                  class="badge bg-light text-dark me-2 mb-2" 
                  v-for="tag in allTags" 
                  :key="tag"
                  @click="filterByTag(tag)"
                  :class="{'bg-primary text-white': selectedTag === tag}"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 热门文章 -->
          <div class="card">
            <div class="card-header">热门文章</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="article in popularNews" :key="article.id">
                <router-link :to="'/news/' + article.id" class="text-decoration-none">{{ article.title }}</router-link>
                <small class="text-muted d-block">{{ formatDate(article.createdAt) }}</small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import apiConnector from '../api/connector';

export default {
  name: 'NewsPage',
  setup() {
    const isLoading = ref(true);
    const featuredNews = ref([]);
    const newsList = ref([]);
    const popularNews = ref([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const perPage = 5;
    const selectedTag = ref(null);
    const allTags = ref([]);

    const isPreviousDisabled = computed(() => currentPage.value <= 1);
    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    // 提取所有文章中的标签，并去重
    const extractTags = (newsArray) => {
      const tags = new Set();
      newsArray.forEach(news => {
        if (news.tags && news.tags.length) {
          news.tags.forEach(tag => tags.add(tag));
        }
      });
      return Array.from(tags);
    };

    // 按标签筛选新闻
    const filterByTag = (tag) => {
      if (selectedTag.value === tag) {
        selectedTag.value = null;
        fetchNewsList(1);
      } else {
        selectedTag.value = tag;
        fetchNewsListByTag(tag, 1);
      }
    };

    // 获取置顶新闻
    const fetchFeaturedNews = async () => {
      try {
        featuredNews.value = await apiConnector.request({
          resource: 'news',
          action: 'list',
          params: {
            isFeature: true
          }
        });
      } catch (error) {
        console.error('获取置顶新闻失败:', error);
        featuredNews.value = [];
      }
    };

    // 获取热门新闻
    const fetchPopularNews = async () => {
      try {
        const allNews = await apiConnector.request({
          resource: 'news',
          action: 'list'
        });
        
        // 按浏览量排序
        popularNews.value = [...allNews]
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);
          
        // 提取所有标签
        allTags.value = extractTags(allNews);
      } catch (error) {
        console.error('获取热门新闻失败:', error);
        popularNews.value = [];
      }
    };

    // 获取分页新闻列表
    const fetchNewsList = async (page = 1) => {
      isLoading.value = true;
      try {
        const allNews = await apiConnector.request({
          resource: 'news',
          action: 'list',
          params: {
            isFeature: false
          }
        });
        
        // 按日期排序（最新在前）
        const sortedNews = [...allNews].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // 计算分页
        totalPages.value = Math.ceil(sortedNews.length / perPage);
        
        // 获取当前页的数据
        const startIndex = (page - 1) * perPage;
        newsList.value = sortedNews.slice(startIndex, startIndex + perPage);
        
        currentPage.value = page;
      } catch (error) {
        console.error('获取新闻列表失败:', error);
        newsList.value = [];
        totalPages.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // 按标签获取新闻列表
    const fetchNewsListByTag = async (tag, page = 1) => {
      isLoading.value = true;
      try {
        const taggedNews = await apiConnector.request({
          resource: 'news',
          action: 'list',
          params: {
            tags: [tag]
          }
        });
        
        // 按日期排序（最新在前）
        const sortedNews = [...taggedNews].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // 计算分页
        totalPages.value = Math.ceil(sortedNews.length / perPage);
        
        // 获取当前页的数据
        const startIndex = (page - 1) * perPage;
        newsList.value = sortedNews.slice(startIndex, startIndex + perPage);
        
        currentPage.value = page;
      } catch (error) {
        console.error(`获取标签 "${tag}" 的新闻失败:`, error);
        newsList.value = [];
        totalPages.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // 分页导航方法
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      if (selectedTag.value) {
        fetchNewsListByTag(selectedTag.value, page);
      } else {
        fetchNewsList(page);
      }
    };

    const goToPreviousPage = () => {
      if (!isPreviousDisabled.value) {
        goToPage(currentPage.value - 1);
      }
    };

    const goToNextPage = () => {
      if (!isNextDisabled.value) {
        goToPage(currentPage.value + 1);
      }
    };

    // 格式化日期显示
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // 截断内容以便预览
    const truncateContent = (content, maxLength = 100) => {
      // 移除HTML标签
      const plainText = content.replace(/<[^>]*>/g, '');
      
      if (plainText.length <= maxLength) return plainText;
      return plainText.substring(0, maxLength) + '...';
    };

    onMounted(async () => {
      try {
        await Promise.all([
          fetchFeaturedNews(),
          fetchNewsList(1),
          fetchPopularNews()
        ]);
      } catch (error) {
        console.error('初始化新闻页面失败:', error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      isLoading,
      featuredNews,
      newsList,
      popularNews,
      currentPage,
      totalPages,
      isPreviousDisabled,
      isNextDisabled,
      allTags,
      selectedTag,
      filterByTag,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      formatDate,
      truncateContent
    };
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
  background-color: var(--bs-primary);
  color: white;
}
</style> 