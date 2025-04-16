<template>
  <div class="resource-detail">
    <div class="container py-4">
      <!-- Simplified Loading Indicator (Optional, shown only if resource is null initially and fetch is in progress) -->
      <div v-if="!resource && isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载资源信息中...</p>
      </div>

      <!-- Resource Content - Always render the structure, use v-if for data-dependent parts -->
      <!-- Use a wrapper div that exists even if resource is null initially -->
      <div>
        <!-- Show content only when resource data is available -->
        <div v-if="resource" class="resource-content">
          <div class="row mb-4">
            <div class="col-12">
              <router-link to="/resource-market" class="btn btn-outline-secondary mb-3">
                <i class="bi bi-arrow-left"></i> 返回资源市场
              </router-link>
            </div>
          </div>

          <div class="row">
            <!-- 资源主图和详情 -->
            <div class="col-md-8">
              <div class="card mb-4">
                <img v-if="resource.imageUrl" :src="resource.imageUrl" class="card-img-top resource-cover" :alt="resource.title">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h1 class="card-title mb-0">{{ resource.title }}</h1>
                    <span v-if="resource.category" class="badge bg-primary">{{ resource.category }}</span>
                  </div>
                  
                  <div class="resource-meta mb-3">
                    <span class="me-3">
                      <i class="bi bi-calendar-event"></i> {{ resource.createdAt ? formatDate(resource.createdAt) : '-' }}
                    </span>
                    <span class="me-3">
                      <i class="bi bi-eye"></i> {{ resource.views ?? 0 }} 浏览
                    </span>
                    <span class="me-3">
                      <i class="bi bi-download"></i> {{ resource.downloads ?? 0 }} 下载
                    </span>
                    <span class="rating">
                      <i class="bi bi-star-fill text-warning"></i> {{ resource.averageRating ? resource.averageRating.toFixed(1) : '暂无' }}
                    </span>
                  </div>
                  
                  <p class="card-text resource-description">{{ resource.description }}</p>
                  
                  <div class="tags mb-4">
                    <span class="badge bg-light text-dark me-2 mb-2" v-for="tag in resource.tags" :key="tag">
                      {{ tag }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-items-center justify-content-between mt-4">
                    <div class="price-box">
                      <span v-if="resource.price > 0" class="resource-price">¥{{ resource.price }}</span>
                      <span v-else class="resource-price free">免费</span>
                    </div>
                    
                    <div class="action-buttons">
                      <button class="btn btn-outline-primary me-2" @click="addToFavorites">
                        <i class="bi bi-heart"></i> 收藏
                      </button>
                      <button class="btn btn-primary" @click="downloadResource">
                        <i class="bi bi-download"></i> 下载资源
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 资源评论 -->
              <div class="card mb-4">
                <div class="card-header">用户评论 ({{ comments.length }})</div>
                <div class="card-body">
                   <!-- Comment loading/display logic -->
                   <div v-if="isCommentsLoading" class="text-center py-3">
                      <span class="spinner-border spinner-border-sm text-muted" role="status"></span>
                      <span class="ms-2 text-muted">加载评论中...</span>
                   </div>
                   <div v-else-if="comments.length === 0" class="text-center py-4">
                    <i class="bi bi-chat-dots display-4 text-muted"></i>
                    <p class="mt-3">暂无评论，成为第一个评论这个资源的用户吧！</p>
                  </div>
                  <div v-else class="comment-list">
                     <div class="comment-item mb-3 pb-3 border-bottom" v-for="comment in comments" :key="comment.id">
                        <div class="d-flex align-items-start">
                          <div class="avatar me-3">
                            <img :src="comment.avatarUrl || 'https://via.placeholder.com/40'" class="rounded-circle" alt="用户头像">
                          </div>
                          <div class="comment-content">
                            <div class="d-flex justify-content-between align-items-center">
                              <h6 class="mb-1">{{ comment.username || getAuthorName(comment.userId) }}</h6>
                              <small class="text-muted">{{ comment.createdAt ? formatDate(comment.createdAt) : '-' }}</small>
                            </div>
                            <p class="mb-0">{{ comment.content }}</p>
                          </div>
                        </div>
                      </div>
                  </div>


                  <!-- 评论表单 -->
                  <div class="comment-form mt-4">
                    <h5 class="mb-3">发表评论</h5>
                    <div class="mb-3">
                      <textarea
                        class="form-control"
                        rows="3"
                        placeholder="分享你对这个资源的看法..."
                        v-model="newComment"
                        :disabled="!authStore.isLoggedIn"
                      ></textarea>
                       <small v-if="!authStore.isLoggedIn" class="text-muted">请<router-link to="/login">登录</router-link>后发表评论。</small>
                    </div>
                    <div class="text-end">
                      <button class="btn btn-primary" @click="submitComment" :disabled="!newComment.trim() || !authStore.isLoggedIn">
                        提交评论
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 侧边栏 -->
            <div class="col-md-4">
               <!-- 作者信息 -->
               <div class="card mb-4">
                 <div class="card-header">资源提供者</div>
                 <div class="card-body" v-if="authorInfo">
                   <div class="d-flex align-items-center">
                     <img :src="authorInfo.avatar || 'https://via.placeholder.com/60'" class="rounded-circle me-3" alt="作者头像">
                     <div>
                       <h5 class="mb-1">{{ authorInfo.username || '未知作者' }}</h5>
                       <p class="mb-0 text-muted">已分享 {{ authorResourceCount }} 个资源</p>
                     </div>
                   </div>
                 </div>
                 <div class="card-body text-muted" v-else>加载作者信息...</div>
               </div>


              <!-- 相关资源 -->
              <div class="card mb-4">
                <div class="card-header">相关资源</div>
                <div v-if="relatedResources.length > 0" class="list-group list-group-flush">
                  <router-link
                    v-for="item in relatedResources"
                    :key="item.id"
                    :to="`/resource-market/${item.id}`"
                    class="list-group-item list-group-item-action"
                  >
                    <div class="d-flex align-items-center">
                      <img :src="item.imageUrl || 'https://via.placeholder.com/50'" class="me-3" alt="资源缩略图" style="width: 50px; height: 50px; object-fit: cover;">
                      <div>
                        <h6 class="mb-1">{{ item.title }}</h6>
                        <div class="d-flex small text-muted">
                          <span class="me-2"><i class="bi bi-eye"></i> {{ item.views ?? 0 }}</span>
                          <span><i class="bi bi-star-fill text-warning"></i> {{ item.averageRating ? item.averageRating.toFixed(1) : '暂无' }}</span>
                        </div>
                      </div>
                    </div>
                  </router-link>
                </div>
                 <div v-else class="card-body text-muted">暂无相关资源</div>
              </div>

              <!-- 推荐资源 -->
              <div class="card">
                 <div class="card-header">热门资源</div>
                 <div v-if="popularResources.length > 0" class="list-group list-group-flush">
                    <router-link
                      v-for="item in popularResources"
                      :key="item.id"
                      :to="`/resource-market/${item.id}`"
                      class="list-group-item list-group-item-action"
                    >
                     <div class="d-flex align-items-center">
                       <img :src="item.imageUrl || 'https://via.placeholder.com/50'" class="me-3" alt="资源缩略图" style="width: 50px; height: 50px; object-fit: cover;">
                       <div>
                         <h6 class="mb-1">{{ item.title }}</h6>
                         <div class="d-flex small text-muted">
                           <span class="me-2"><i class="bi bi-eye"></i> {{ item.views ?? 0 }}</span>
                           <span><i class="bi bi-star-fill text-warning"></i> {{ item.averageRating ? item.averageRating.toFixed(1) : '暂无' }}</span>
                         </div>
                       </div>
                     </div>
                   </router-link>
                 </div>
                 <div v-else class="card-body text-muted">暂无热门资源</div>
              </div>

            </div>
          </div>
        </div>

        <!-- Resource Not Found (Show only if loading is finished and resource is confirmed null) -->
        <div v-if="!isLoading && !resource" class="alert alert-warning mt-4">
          <h3 class="text-center">未找到资源</h3>
          <p class="text-center">请检查链接是否正确，或者<router-link to="/resource-market">返回资源市场</router-link></p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import resourceService from '@/services/resourceService';
import axios from '@/services/api'; // Keep axios if fetchComments uses it directly
import { useAuthStore } from '@/stores/auth';
import { useResourceStore } from '@/stores/resources'; // Import resource store if needed for related/popular

export default {
  name: 'ResourceDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const resourceStore = useResourceStore(); // Use resource store instance

    const isLoading = ref(false); // Tracks the main resource fetch
    const isCommentsLoading = ref(false); // Separate loading state for comments
    const isRelatedLoading = ref(false); // Separate loading state for related data
    const resource = ref(null);
    const comments = ref([]);
    const relatedResources = ref([]);
    const popularResources = ref([]);
    const authorInfo = ref(null); // For author details
    const authorResourceCount = ref(0);
    const newComment = ref('');
    const commentsPagination = ref({ currentPage: 1, totalPages: 1 });

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        // Use consistent formatting, e.g., YYYY-MM-DD
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } catch (e) { return '-'; }
    };

    const getAuthorName = (authorId) => `用户 ${authorId?.slice(-4) || '未知'}`;

    // Function to fetch comments
     const fetchComments = async (resourceId, page = 1) => {
       if (!resourceId) return;
       isCommentsLoading.value = true;
       try {
         const response = await axios.get(`/api/resources/${resourceId}/comments`, { params: { page } });
         if (response && Array.isArray(response.data)) {
           comments.value = response.data;
           commentsPagination.value = response.pagination || { currentPage: page, totalPages: 1 };
         } else {
           comments.value = [];
           commentsPagination.value = { currentPage: 1, totalPages: 1 };
         }
       } catch (error) {
         console.error(`Failed to fetch comments for resource ${resourceId}:`, error);
         comments.value = [];
         commentsPagination.value = { currentPage: 1, totalPages: 1 };
       } finally {
         isCommentsLoading.value = false;
       }
     };

    // Function to fetch related data (placeholders, implement actual logic if needed)
    const fetchRelatedData = async (resourceData) => {
       if (!resourceData) return;
       isRelatedLoading.value = true;
       try {
         // Replace with actual API calls using resourceStore or other services
         await Promise.allSettled([
             // Example: Fetch resources in the same category
             // resourceStore.fetchResources(1, { category: resourceData.category, limit: 5 }).then(data => relatedResources.value = data?.filter(r => r.id !== resourceData.id) || []),
             // Example: Fetch popular resources (assuming store action exists)
             // resourceStore.fetchPopularResources(5).then(data => popularResources.value = data?.filter(r => r.id !== resourceData.id) || []),
             // Example: Fetch author info (requires a user service/API)
             // userService.getUserById(resourceData.uploader).then(data => authorInfo.value = data)
         ]);
          // Simulate loading for now
         // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
         console.log("Related data fetching finished (simulated).");


       } catch (error) {
          console.error("Error fetching related data:", error);
       } finally {
          isRelatedLoading.value = false;
       }
    };


    // Main function to fetch resource details
    const fetchResourceDetail = async (id) => {
      console.log(`[fetchResourceDetail] START - Fetching resource with ID: ${id}`);
      
      // 1. 首先设置加载状态和重置数据
      isLoading.value = true;
      resource.value = null; // Reset resource before fetch
      comments.value = [];
      relatedResources.value = [];
      popularResources.value = [];
      authorInfo.value = null;
      
      console.log(`[fetchResourceDetail] Reset states: isLoading=${isLoading.value}, resource=null`);
      
      // 2. 等待下一个 DOM 更新周期以确保视图已反映状态变化
      await nextTick();
      
      try {
        console.log(`[fetchResourceDetail] Calling resourceService.getResourceById(${id})`);
        const fetchedResource = await resourceService.getResourceById(id);
        console.log(`[fetchResourceDetail] API response received:`, fetchedResource ? 'Resource found' : 'Resource null');
        
        // 设置资源数据 (如果为 null 也没关系，模板已处理)
        resource.value = fetchedResource;

        if (resource.value) {
          console.log(`[fetchResourceDetail] Resource found, fetching related data`);
          // 等待下一个 DOM 更新周期以确保资源数据已渲染
          await nextTick();
          
          // Fetch comments and related data only after main resource is confirmed found
          await Promise.allSettled([
              fetchComments(id, 1),
              fetchRelatedData(resource.value) // Fetch related data
          ]);
          console.log(`[fetchResourceDetail] All related data fetched`);
        } else {
          console.warn(`[fetchResourceDetail] Resource with ID ${id} not found.`);
        }
      } catch (error) {
        console.error(`[fetchResourceDetail] ERROR fetching data for ID ${id}:`, error);
        resource.value = null;
      } finally {
        isLoading.value = false;
        console.log(`[fetchResourceDetail] COMPLETE - Final states: isLoading=${isLoading.value}, hasResource=${!!resource.value}`);
        
        // 最后状态变更后的一次 nextTick，确保 UI 更新
        await nextTick();
      }
    };


     const submitComment = async () => {
        if (!newComment.value.trim()) return;
        
        // 首先检查资源是否已加载
        if (!resource.value?.id) {
          console.error('[submitComment] 无法提交评论：资源ID不存在');
          return;
        }
        
        // 直接访问 authStore 并检查当前用户
        if (!authStore.isLoggedIn || !authStore.currentUser) {
          console.error('[submitComment] 用户未登录或用户信息不完整', { 
            isLoggedIn: authStore.isLoggedIn, 
            hasUser: !!authStore.currentUser 
          });
          // 使用 alert 代替 Modal 来避免引入额外的覆盖层
          window.alert('请先登录后再发表评论');
          return;
        }
        
        try {
          console.log('[submitComment] 发送评论请求', { 
            resourceId: resource.value.id,
            content: newComment.value.trim()
          });
          
          const response = await axios.post(`/api/resources/${resource.value.id}/comments`, {
            content: newComment.value.trim()
          });
          
          console.log('[submitComment] 收到响应:', response);
          
          if (response && (response.success === true || response.data?.success === true)) {
            await fetchComments(resource.value.id, 1); // 重新获取评论
            newComment.value = ''; // 清空输入框
            window.alert('评论发表成功！');
          } else {
            console.warn('[submitComment] 评论发表失败:', response);
            window.alert(response.data?.message || '评论发表失败，请稍后重试');
          }
        } catch (error) {
          console.error('[submitComment] 评论请求错误:', error);
          // 简化错误处理，避免过多的嵌套逻辑
          window.alert('评论发表失败，请检查网络连接或稍后重试');
        }
     };

     // Placeholder actions
     const addToFavorites = () => alert('收藏功能待实现');
     const downloadResource = () => {
         if(resource.value?.url){
            window.open(resource.value.url, '_blank');
            // Add download count tracking here if needed (API call)
         } else {
            alert('无法获取下载链接');
         }
     };


    // Watch for route parameter changes to refetch data
    watch(() => route.params.id, (newId) => {
      if (newId) {
        fetchResourceDetail(newId);
      }
    }, { immediate: true }); // immediate: true ensures fetch on initial load

    // 组件卸载时清理
    onUnmounted(() => {
      console.log('[ResourceDetail] 组件卸载，执行清理');
      
      // 确保当前页面中没有模态框残留
      document.querySelectorAll('.modal-backdrop').forEach(el => {
        el.remove();
      });
      
      document.querySelectorAll('.modal.show').forEach(el => {
        el.classList.remove('show');
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      });
      
      // 恢复 body 状态
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
      
      // 移除所有可能存在的事件监听器
      document.body.removeAttribute('data-bs-overflow');
      document.body.removeAttribute('data-bs-padding-right');
    });

    return {
      isLoading,
      isCommentsLoading, // Expose comment loading state
      isRelatedLoading, // Expose related loading state
      resource,
      comments,
      relatedResources,
      popularResources,
      authorInfo,
      authorResourceCount,
      newComment,
      authStore, // Expose authStore for template checks
      getAuthorName,
      formatDate,
      submitComment,
      addToFavorites,
      downloadResource
    };
  }
};
</script>

<style scoped>
.resource-detail {
  padding: 2rem 0;
}

.resource-cover {
  max-height: 400px;
  object-fit: cover;
}

.resource-title {
  font-size: 2rem;
  font-weight: 700;
}

.resource-meta {
  color: #6c757d;
  font-size: 0.9rem;
}

.resource-description {
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 1.5rem 0;
}

.tags .badge {
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
}

.resource-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e74c3c;
}

.resource-price.free {
  color: #2ecc71;
}

.comment-item {
  transition: background-color 0.2s;
}

.comment-item:hover {
  background-color: #f8f9fa;
}

.avatar img {
  width: 45px;
  height: 45px;
  object-fit: cover;
}

.rating {
  font-weight: 600;
}

/* Optional: Add styles for loading states if needed */
.text-muted {
  /* Style for loading text placeholders */
}
</style> 