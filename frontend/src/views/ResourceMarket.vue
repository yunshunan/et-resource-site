<template>
  <div class="resource-market">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="section-heading text-center">资源市场</h1>
          <p class="text-center text-muted">探索优质资源，助力高效工作</p>
        </div>
      </div>

      <!-- 资源分类 -->
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

      <!-- 搜索栏 -->
      <div class="row mb-4">
        <div class="col-md-8 offset-md-2">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="搜索资源..." v-model="searchQuery">
            <button class="btn btn-primary" @click="searchResources">搜索</button>
          </div>
        </div>
      </div>

      <!-- 资源列表 -->
      <div class="row">
        <div class="col-md-4 mb-4" v-for="resource in filteredResources" :key="resource.id">
          <div class="card h-100">
            <div class="card-img-container">
              <img :src="resource.imageUrl" class="card-img-top" :alt="resource.title" style="height: 200px; object-fit: cover;">
              <span class="category-badge">{{ resource.category }}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ resource.title }}</h5>
              <p class="card-text">{{ resource.description }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">{{ resource.date }}</span>
                <router-link :to="'/resource-market/' + resource.id" class="btn btn-sm btn-primary">查看详情</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
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
    </div>
  </div>
</template>

<script>
import { resourceApi } from '@/services/api'

export default {
  name: 'ResourceMarketPage',
  data() {
    return {
      resources: [],
      categories: [
        { id: 1, name: '办公资源' },
        { id: 2, name: '设计资源' },
        { id: 3, name: '营销资源' },
        { id: 4, name: '教育资源' },
        { id: 5, name: '开发资源' }
      ],
      activeCategory: '',
      searchQuery: '',
      currentPage: 1,
      pageSize: 9,
      totalResources: 0
    }
  },
  computed: {
    filteredResources() {
      let result = this.resources

      if (this.activeCategory) {
        result = result.filter(resource => resource.category === this.activeCategory)
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query)
        )
      }

      return result
    },
    totalPages() {
      return Math.ceil(this.totalResources / this.pageSize)
    }
  },
  methods: {
    filterByCategory(category) {
      this.activeCategory = category
      this.currentPage = 1
      this.fetchResources()
    },
    searchResources() {
      this.currentPage = 1
      this.fetchResources()
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchResources()
    },
    async fetchResources() {
      try {
        // 模拟数据，实际项目中应该从API获取
        // const response = await resourceApi.getResources(this.currentPage, this.activeCategory)
        // this.resources = response.resources
        // this.totalResources = response.total

        // 使用静态数据
        this.resources = [
          {
            id: 1,
            title: '高质量PPT模板集合',
            description: '包含50+ 精美商务PPT模板，适用于各种场景',
            imageUrl: 'https://via.placeholder.com/400x300/3498db/ffffff?text=PPT模板',
            category: '办公资源',
            date: '2025-03-15'
          },
          {
            id: 2,
            title: 'UI设计资源包',
            description: '最新UI设计素材，包括图标、插图和界面组件',
            imageUrl: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=UI设计资源',
            category: '设计资源',
            date: '2025-03-10'
          },
          {
            id: 3,
            title: '电商营销策略指南',
            description: '详细的电商营销策略与案例分析',
            imageUrl: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=营销策略',
            category: '营销资源',
            date: '2025-03-05'
          },
          {
            id: 4,
            title: 'Excel数据分析模板',
            description: '专业的Excel数据分析模板，包含自动化报表',
            imageUrl: 'https://via.placeholder.com/400x300/f39c12/ffffff?text=Excel模板',
            category: '办公资源',
            date: '2025-03-02'
          },
          {
            id: 5,
            title: '网页设计套件',
            description: '现代网页设计元素及模板集合',
            imageUrl: 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=网页设计',
            category: '设计资源',
            date: '2025-02-28'
          },
          {
            id: 6,
            title: '社交媒体营销工具包',
            description: '提升社交媒体营销效果的综合工具与策略',
            imageUrl: 'https://via.placeholder.com/400x300/34495e/ffffff?text=社交媒体',
            category: '营销资源',
            date: '2025-02-25'
          },
          {
            id: 7,
            title: '教育课件模板',
            description: '适用于各年龄段的教育课件模板',
            imageUrl: 'https://via.placeholder.com/400x300/16a085/ffffff?text=教育课件',
            category: '教育资源',
            date: '2025-02-20'
          },
          {
            id: 8,
            title: '前端开发组件库',
            description: '高质量响应式前端UI组件',
            imageUrl: 'https://via.placeholder.com/400x300/2980b9/ffffff?text=前端组件',
            category: '开发资源',
            date: '2025-02-15'
          },
          {
            id: 9,
            title: '数据可视化工具包',
            description: '专业的数据可视化图表与模板',
            imageUrl: 'https://via.placeholder.com/400x300/c0392b/ffffff?text=数据可视化',
            category: '开发资源',
            date: '2025-02-10'
          }
        ]
        
        this.totalResources = 18 // 模拟总资源数
      } catch (error) {
        console.error('获取资源列表失败:', error)
      }
    }
  },
  mounted() {
    this.fetchResources()
  }
}
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
</style> 