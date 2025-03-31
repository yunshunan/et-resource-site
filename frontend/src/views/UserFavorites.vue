<template>
  <div class="user-favorites-page py-5">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-12">
          <h2 class="text-center mb-4">我的收藏</h2>
          <p class="text-center text-muted">管理您收藏的资源</p>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="resourceStore.loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载中...</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-else-if="resourceStore.error" class="alert alert-danger" role="alert">
        {{ resourceStore.error }}
      </div>
      
      <!-- 空收藏提示 -->
      <div v-else-if="!resourceStore.favorites.length" class="text-center py-5">
        <i class="bi bi-bookmark-heart display-1 text-muted"></i>
        <h3 class="mt-3">您还没有收藏任何资源</h3>
        <p class="text-muted">浏览资源市场，发现您感兴趣的内容</p>
        <router-link to="/resource-market" class="btn btn-primary mt-3">
          浏览资源市场
        </router-link>
      </div>
      
      <!-- 收藏列表 -->
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="resource in resourceStore.favorites" :key="resource._id" class="col">
          <div class="card h-100 shadow-sm">
            <img 
              :src="resource.imageUrl" 
              class="card-img-top" 
              alt="资源封面"
              style="height: 180px; object-fit: cover;"
            >
            
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary">{{ resource.category }}</span>
                <div class="d-flex align-items-center">
                  <i class="bi bi-star-fill text-warning me-1"></i>
                  <small>{{ resource.averageRating || '暂无评分' }}</small>
                </div>
              </div>
              
              <h5 class="card-title">{{ resource.title }}</h5>
              <p class="card-text text-muted small">
                {{ truncateText(resource.description, 80) }}
              </p>
            </div>
            
            <div class="card-footer bg-white d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <img 
                  :src="resource.user?.avatar || defaultAvatar" 
                  class="rounded-circle me-2" 
                  width="24" 
                  height="24"
                  alt="用户头像"
                >
                <small class="text-muted">{{ resource.user?.username || '未知用户' }}</small>
              </div>
              
              <div>
                <button 
                  class="btn btn-outline-danger btn-sm me-2" 
                  @click="unfavoriteResource(resource._id)"
                  title="取消收藏"
                >
                  <i class="bi bi-heart-fill"></i>
                </button>
                
                <router-link 
                  :to="`/resources/${resource._id}`" 
                  class="btn btn-outline-primary btn-sm"
                  title="查看详情"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="resourceStore.pagination.totalPages > 1" class="d-flex justify-content-center mt-5">
        <nav aria-label="资源分页">
          <ul class="pagination">
            <li 
              class="page-item" 
              :class="{ disabled: resourceStore.pagination.currentPage === 1 }"
            >
              <a 
                class="page-link" 
                href="#" 
                @click.prevent="changePage(resourceStore.pagination.currentPage - 1)"
              >
                上一页
              </a>
            </li>
            
            <li 
              v-for="page in pageNumbers" 
              :key="page" 
              class="page-item"
              :class="{ active: page === resourceStore.pagination.currentPage }"
            >
              <a 
                class="page-link" 
                href="#" 
                @click.prevent="changePage(page)"
              >
                {{ page }}
              </a>
            </li>
            
            <li 
              class="page-item" 
              :class="{ disabled: resourceStore.pagination.currentPage === resourceStore.pagination.totalPages }"
            >
              <a 
                class="page-link" 
                href="#" 
                @click.prevent="changePage(resourceStore.pagination.currentPage + 1)"
              >
                下一页
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resources'

export default {
  name: 'UserFavoritesView',
  setup() {
    const resourceStore = useResourceStore()
    const defaultAvatar = 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
    
    // 切割过长文本
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    }
    
    // 取消收藏
    const unfavoriteResource = async (resourceId) => {
      await resourceStore.toggleFavorite(resourceId);
      // 刷新收藏列表
      await resourceStore.fetchFavorites();
    }
    
    // 分页处理
    const changePage = (page) => {
      if (page < 1 || page > resourceStore.pagination.totalPages) return;
      resourceStore.fetchFavorites(page);
    }
    
    // 计算页码数组
    const pageNumbers = computed(() => {
      const totalPages = resourceStore.pagination.totalPages;
      const currentPage = resourceStore.pagination.currentPage;
      
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      if (currentPage <= 3) {
        return [1, 2, 3, 4, 5];
      }
      
      if (currentPage >= totalPages - 2) {
        return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
      
      return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    });
    
    // 初始加载
    onMounted(() => {
      resourceStore.fetchFavorites();
    });
    
    return {
      resourceStore,
      defaultAvatar,
      truncateText,
      unfavoriteResource,
      changePage,
      pageNumbers
    }
  }
}
</script>

<style scoped>
.user-favorites-page {
  min-height: calc(100vh - 200px);
}

.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}
</style> 