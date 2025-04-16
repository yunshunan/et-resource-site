<template>
  <div class="user-resources-page py-5">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="mb-1">我的资源</h2>
            <p class="text-muted">管理您上传的资源</p>
          </div>
          <router-link to="/resource-upload" class="btn btn-primary">
            <i class="bi bi-plus-lg me-2"></i>上传新资源
          </router-link>
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
      
      <!-- 空资源提示 -->
      <div v-else-if="!resourceStore.resources.length" class="text-center py-5">
        <i class="bi bi-file-earmark-plus display-1 text-muted"></i>
        <h3 class="mt-3">您还没有上传任何资源</h3>
        <p class="text-muted">分享您的资源，帮助更多人</p>
        <router-link to="/resource-upload" class="btn btn-primary mt-3">
          上传第一个资源
        </router-link>
      </div>
      
      <!-- 资源列表 -->
      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th scope="col" style="width: 50px;">#</th>
                <th scope="col">资源信息</th>
                <th scope="col" style="width: 120px;">分类</th>
                <th scope="col" style="width: 120px;">统计</th>
                <th scope="col" style="width: 120px;">评分</th>
                <th scope="col" style="width: 120px;">上传时间</th>
                <th scope="col" style="width: 120px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(resource, index) in resourceStore.resources" :key="resource._id">
                <th scope="row">{{ (resourceStore.pagination.currentPage - 1) * 10 + index + 1 }}</th>
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      :src="resource.imageUrl" 
                      class="rounded me-3" 
                      alt="资源封面" 
                      width="60" 
                      height="40" 
                      style="object-fit: cover;"
                    >
                    <div>
                      <h6 class="mb-0">{{ resource.title }}</h6>
                      <small class="text-muted">{{ truncateText(resource.description, 60) }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge bg-primary">{{ resource.category }}</span></td>
                <td>
                  <div>
                    <i class="bi bi-eye me-1"></i> {{ resource.viewCount || 0 }}
                  </div>
                  <div>
                    <i class="bi bi-download me-1"></i> {{ resource.downloadCount || 0 }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-star-fill text-warning me-1"></i>
                    <span>{{ resource.averageRating || '暂无评分' }}</span>
                  </div>
                </td>
                <td>{{ formatDate(resource.createdAt) }}</td>
                <td>
                  <div class="btn-group">
                    <router-link :to="`/resource-market/${resource._id}`" class="btn btn-sm btn-outline-primary me-1" title="查看">
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link 
                      :to="`/resources/edit/${resource._id}`" 
                      class="btn btn-sm btn-outline-secondary"
                      title="编辑"
                    >
                      <i class="bi bi-pencil"></i>
                    </router-link>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      title="删除"
                      @click="confirmDelete(resource)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 分页 -->
        <div v-if="resourceStore.pagination.totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav aria-label="资源分页">
            <ul class="pagination">
              <li 
                class="page-item" 
                :class="{ disabled: resourceStore.pagination.currentPage ===
                1 }"
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
    
    <!-- 删除确认对话框 -->
    <div 
      class="modal fade" 
      id="deleteModal" 
      tabindex="-1" 
      aria-labelledby="deleteModalLabel" 
      aria-hidden="true"
      ref="deleteModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">确认删除</h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>您确定要删除资源 <strong>{{ resourceToDelete?.title }}</strong> 吗？</p>
            <p class="text-danger">此操作不可逆，删除后将无法恢复！</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteResource"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resources'
import { useAuthStore } from '@/stores/auth'
import { Modal } from 'bootstrap'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'UserResourcesView',
  setup() {
    const resourceStore = useResourceStore()
    const authStore = useAuthStore()
    const router = useRouter()
    const route = useRoute()
    const deleteModal = ref(null)
    const resourceToDelete = ref(null)
    const isDeleting = ref(false)
    let modalInstance = null

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    // 切割过长文本
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    }
    
    // 分页处理
    const changePage = (page) => {
      if (page < 1 || page > resourceStore.pagination.totalPages || page === resourceStore.pagination.currentPage) {
        return
      }
      // Update URL query parameter for better UX and state restoration
      router.push({ query: { page } })
      // Load resources for the new page
      loadResources(page)
    }
    
    // 计算页码数组
    const pageNumbers = computed(() => {
      const total = resourceStore.pagination.totalPages;
      const current = resourceStore.pagination.currentPage;
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      range.push(1);
      for (let i = current - delta; i <= current + delta; i++) {
        if (i > 1 && i < total) {
          range.push(i);
        }
      }
      range.push(total);

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    });
    
    // 获取用户上传的资源
    const loadResources = (page = 1) => {
      resourceStore.fetchUserResources(page)
    }
    
    // 显示删除确认对话框
    const confirmDelete = (resource) => {
      resourceToDelete.value = resource;
      
      // 显示模态框
      if (modalInstance) {
        modalInstance.show()
      }
    }
    
    // 删除资源
    const deleteResource = async () => {
      if (!resourceToDelete.value) return;
      
      isDeleting.value = true;
      
      try {
        const success = await resourceStore.deleteResource(resourceToDelete.value._id)
        if (success) {
          // Optionally: reload current page or handle state update locally
          loadResources(resourceStore.pagination.currentPage)
          if (modalInstance) {
            modalInstance.hide()
          }
           resourceToDelete.value = null // Reset
          // TODO: Add success notification
        } else {
          // TODO: Add error notification
        }
      } catch (error) {
        console.error("Delete error:", error)
        // TODO: Add error notification
      } finally {
        isDeleting.value = false
      }
    }
    
    // 初始加载
    onMounted(() => {
      // Initialize modal instance
      if (deleteModal.value) {
        modalInstance = new Modal(deleteModal.value)
      }
      // Fetch initial data based on current page from query or default to 1
      const currentPage = parseInt(route.query.page, 10) || 1;
      loadResources(currentPage)
    });
    
    return {
      resourceStore,
      authStore,
      deleteModal,
      resourceToDelete,
      isDeleting,
      formatDate,
      truncateText,
      changePage,
      pageNumbers,
      confirmDelete,
      deleteResource
    }
  }
}
</script>

<style scoped>
.user-resources-page {
  min-height: calc(100vh - 200px);
}
</style> 