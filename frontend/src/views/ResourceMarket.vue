<template>
  <div class="resource-market">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="section-heading text-center">资源市场</h1>
          <p class="text-center text-muted">探索优质资源，助力高效工作</p>
        </div>
      </div>

      <!-- 资源分类 - 使用MemoComponent避免不必要的重新渲染 -->
      <MemoComponent :dependencies="[activeCategory]">
      <div class="row mb-4">
        <div class="col-12">
          <div class="category-tabs">
            <ul class="nav nav-pills justify-content-center">
              <li class="nav-item">
                <button class="nav-link"
                  :class="{ active: activeCategory === '' }"
                  @click="filterByCategory('')">
                  全部资源
                </button>
              </li>
              <li class="nav-item" v-for="category in categories" :key="category.id">
                <button class="nav-link"
                  :class="{ active: activeCategory === category.name }"
                  @click="filterByCategory(category.name)">
                  {{ category.name }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </MemoComponent>

      <!-- 搜索栏 -->
      <div class="row mb-4">
        <div class="col-md-8 offset-md-2">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="搜索资源..." v-model="searchQuery">
            <button class="btn btn-primary" @click="searchResources">搜索</button>
          </div>
        </div>
      </div>

      <!-- 加载状态 - 骨架屏 -->
      <div v-if="loading" class="row">
        <div class="col-md-4 mb-4" v-for="n in 6" :key="n">
          <ResourceCardSkeleton />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="retryLoading">
          <i class="bi bi-arrow-clockwise"></i> 重试
        </button>
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="filteredResources.length === 0" class="text-center py-5">
        <i class="bi bi-search display-1 text-muted"></i>
        <h3 class="mt-3">未找到符合条件的资源</h3>
        <p class="text-muted">请尝试使用其他搜索条件或浏览全部资源</p>
        <button class="btn btn-primary mt-3" @click="resetFilters">
          查看全部资源
        </button>
      </div>

      <!-- 资源列表 - 使用虚拟列表优化大量资源展示 -->
      <div v-else class="row">
        <div class="col-12">
          <VirtualList
            :items="filteredResources"
            :item-height="320"
            :container-height="900"
            :buffer="2"
            v-slot="{ item }"
          >
            <div class="card h-100 mb-4">
            <div class="card-img-container">
                <LazyImage 
                  :src="item.imageUrl" 
                  :alt="item.title"
                  loading-text="资源加载中..." 
                  fallback-src="https://via.placeholder.com/400x300/cccccc/666666?text=加载失败"
                  img-style="height: 200px; object-fit: cover;"
                  class="card-img-top"
                />
                <span class="category-badge">{{ item.category }}</span>
            </div>
            <div class="card-body">
                <h5 class="card-title">{{ item.title }}</h5>
                <p class="card-text">{{ item.description }}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">{{ item.date }}</span>
                  <router-link :to="'/resource-market/' + item.id" class="btn btn-sm btn-primary">查看详情</router-link>
                </div>
              </div>
            </div>
          </VirtualList>
        </div>
      </div>

      <!-- 分页 - 使用MemoComponent避免不必要的重新渲染 -->
      <MemoComponent :dependencies="[currentPage, totalPages]">
      <div class="row mt-4">
        <div class="col-12">
          <nav aria-label="Page navigation">
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
      </div>
      </MemoComponent>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VirtualList from '@/components/common/VirtualList.vue'
import MemoComponent from '@/components/common/MemoComponent.vue'
import LazyImage from '@/components/common/LazyImage.vue'
import ResourceCardSkeleton from '@/components/resource/ResourceCardSkeleton.vue'
import resourceService from '@/services/resourceService'

export default {
  name: 'ResourceMarketPage',
  components: {
    VirtualList,
    MemoComponent,
    LazyImage,
    ResourceCardSkeleton
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 状态
    const resources = ref([])
    const categories = ref([])
    const activeCategory = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(9)
    const totalResources = ref(0)
    const loading = ref(false)
    const error = ref(null)

    // 计算属性
    const filteredResources = computed(() => {
      let result = resources.value;
      
      if (activeCategory.value) {
        result = result.filter(resource => resource.category === activeCategory.value);
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query)
        );
      }
      
      // 计算分页后的总页数
      totalResources.value = result.length;
      
      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      
      return result.slice(startIndex, endIndex);
    });

    const totalPages = computed(() => {
      return Math.ceil(totalResources.value / pageSize.value);
    });

    // 处理URL查询参数
    watchEffect(() => {
      if (route.query.search) {
        searchQuery.value = route.query.search;
        fetchResources();
      }
      
      if (route.query.category) {
        activeCategory.value = route.query.category;
        fetchResources();
      }
    });

    // 方法
    const fetchCategories = async () => {
      try {
        categories.value = await resourceService.getCategories();
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // 使用默认分类作为备选
        categories.value = [
          { id: 'cat1', name: '开发资源', count: 0 },
          { id: 'cat2', name: '设计资源', count: 0 },
          { id: 'cat3', name: '办公资源', count: 0 },
          { id: 'cat4', name: '营销资源', count: 0 },
          { id: 'cat5', name: '教育资源', count: 0 }
        ];
      }
    };

    const filterByCategory = (category) => {
      activeCategory.value = category;
      currentPage.value = 1;
      
      // 更新URL，但不触发页面刷新
      router.replace({
        query: { 
          ...route.query,
          category: category || undefined 
        }
      });
      
      fetchResources();
    };

    const searchResources = () => {
      currentPage.value = 1;
      
      // 更新URL，但不触发页面刷新
      router.replace({
        query: { 
          ...route.query,
          search: searchQuery.value || undefined 
        }
      });
      
      fetchResources();
    };

    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      window.scrollTo(0, 0); // 回到顶部
    };

    // 重置过滤条件
    const resetFilters = () => {
      activeCategory.value = '';
      searchQuery.value = '';
      currentPage.value = 1;
      
      // 清除URL查询参数
      router.replace({ query: {} });
      
      fetchResources();
    };

    // 重试加载资源
    const retryLoading = () => {
      error.value = null;
      fetchResources();
    };

    const fetchResources = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // 构建查询参数
        const params = {};
        
        if (activeCategory.value) {
          params.category = activeCategory.value;
        }
        
        if (searchQuery.value) {
          params.search = searchQuery.value;
        }
        
        // 获取资源
        resources.value = await resourceService.getResources(params);
        totalResources.value = resources.value.length;
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        error.value = '加载资源时出错，请稍后重试。';
        resources.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await Promise.all([
        fetchCategories(),
        fetchResources()
      ]);
    });

    return {
      resources,
      categories,
      activeCategory,
      searchQuery,
      currentPage,
      totalPages,
      loading,
      error,
      filteredResources,
      filterByCategory,
      searchResources,
      changePage,
      resetFilters,
      retryLoading
    };
  }
};
</script>

<style scoped>
.resource-market {
  padding: 2rem 0;
}

.category-tabs {
  margin-bottom: 2rem;
}

.category-tabs .nav-link {
  margin: 0 0.5rem;
  color: var(--text-color);
}

.category-tabs .nav-link.active {
  background-color: var(--primary-color);
}

.card-img-container {
  position: relative;
}

.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* 虚拟列表样式优化 */
.virtual-list-item {
  padding: 0 15px;
}
</style> 