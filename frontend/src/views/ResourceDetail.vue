<template>
  <div class="resource-detail">
    <div class="container py-4">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载资源信息中...</p>
      </div>

      <!-- 资源内容 -->
      <div v-else-if="resource" class="resource-content">
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
              <img :src="resource.cover" class="card-img-top resource-cover" :alt="resource.title">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h1 class="card-title mb-0">{{ resource.title }}</h1>
                  <span class="badge bg-primary">{{ resource.category }}</span>
                </div>
                
                <div class="resource-meta mb-3">
                  <span class="me-3">
                    <i class="bi bi-calendar-event"></i> {{ formatDate(resource.createdAt) }}
                  </span>
                  <span class="me-3">
                    <i class="bi bi-eye"></i> {{ resource.views }} 浏览
                  </span>
                  <span class="me-3">
                    <i class="bi bi-download"></i> {{ resource.downloads }} 下载
                  </span>
                  <span class="rating">
                    <i class="bi bi-star-fill text-warning"></i> {{ resource.rating }}
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
                <div v-if="comments.length === 0" class="text-center py-4">
                  <i class="bi bi-chat-dots display-4 text-muted"></i>
                  <p class="mt-3">暂无评论，成为第一个评论这个资源的用户吧！</p>
                </div>
                
                <div v-else class="comment-list">
                  <div class="comment-item mb-3 pb-3 border-bottom" v-for="comment in comments" :key="comment.id">
                    <div class="d-flex align-items-start">
                      <div class="avatar me-3">
                        <img src="https://via.placeholder.com/40" class="rounded-circle" alt="用户头像">
                      </div>
                      <div class="comment-content">
                        <div class="d-flex justify-content-between align-items-center">
                          <h6 class="mb-1">{{ getAuthorName(comment.author) }}</h6>
                          <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
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
                    ></textarea>
                  </div>
                  <div class="text-end">
                    <button class="btn btn-primary" @click="submitComment" :disabled="!newComment.trim()">
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
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <img src="https://via.placeholder.com/60" class="rounded-circle me-3" alt="作者头像">
                  <div>
                    <h5 class="mb-1">{{ authorName }}</h5>
                    <p class="mb-0 text-muted">已分享 {{ authorResourceCount }} 个资源</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 相关资源 -->
            <div class="card mb-4" v-if="relatedResources.length > 0">
              <div class="card-header">相关资源</div>
              <div class="list-group list-group-flush">
                <router-link 
                  v-for="item in relatedResources" 
                  :key="item.id"
                  :to="`/resource-market/${item.id}`" 
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex align-items-center">
                    <img :src="item.cover" class="me-3" alt="资源缩略图" style="width: 50px; height: 50px; object-fit: cover;">
                    <div>
                      <h6 class="mb-1">{{ item.title }}</h6>
                      <div class="d-flex small text-muted">
                        <span class="me-2">
                          <i class="bi bi-eye"></i> {{ item.views }}
                        </span>
                        <span>
                          <i class="bi bi-star-fill text-warning"></i> {{ item.rating }}
                        </span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
            
            <!-- 推荐资源 -->
            <div class="card">
              <div class="card-header">热门资源</div>
              <div class="list-group list-group-flush">
                <router-link 
                  v-for="item in popularResources" 
                  :key="item.id"
                  :to="`/resource-market/${item.id}`" 
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex align-items-center">
                    <img :src="item.cover" class="me-3" alt="资源缩略图" style="width: 50px; height: 50px; object-fit: cover;">
                    <div>
                      <h6 class="mb-1">{{ item.title }}</h6>
                      <div class="d-flex small text-muted">
                        <span class="me-2">
                          <i class="bi bi-eye"></i> {{ item.views }}
                        </span>
                        <span>
                          <i class="bi bi-star-fill text-warning"></i> {{ item.rating }}
                        </span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 资源不存在 -->
      <div v-else class="alert alert-warning">
        <h3 class="text-center">未找到资源</h3>
        <p class="text-center">请检查链接是否正确，或者<router-link to="/resource-market">返回资源市场</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import resourceService from '@/services/resourceService';
import apiConnector from '@/api/connector';

export default {
  name: 'ResourceDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const isLoading = ref(true);
    const resource = ref(null);
    const comments = ref([]);
    const relatedResources = ref([]);
    const popularResources = ref([]);
    const newComment = ref('');
    const authorResourceCount = ref(0);
    
    // 获取作者名称
    const authorName = computed(() => {
      if (!resource.value || !resource.value.author) return '未知作者';
      
      // 在实际应用中，这里应该查询用户系统获取作者信息
      if (resource.value.author === 'user1') return '管理员';
      if (resource.value.author === 'user2') return '普通用户';
      
      return resource.value.author;
    });
    
    // 获取用户名
    const getAuthorName = (authorId) => {
      if (authorId === 'user1') return '管理员';
      if (authorId === 'user2') return '普通用户';
      return '用户' + authorId;
    };
    
    // 获取资源详情
    const fetchResourceDetail = async (id) => {
      isLoading.value = true;
      
      try {
        resource.value = await resourceService.getResourceById(id);
        
        if (resource.value) {
          // 获取评论、相关资源和热门资源
          await Promise.all([
            fetchComments(id),
            fetchRelatedResources(resource.value.category, id),
            fetchPopularResources(id),
            fetchAuthorResources(resource.value.author)
          ]);
        }
      } catch (error) {
        console.error(`Failed to fetch resource with ID ${id}:`, error);
        resource.value = null;
      } finally {
        isLoading.value = false;
      }
    };
    
    // 获取评论
    const fetchComments = async (resourceId) => {
      try {
        comments.value = await apiConnector.request({
          resource: 'comments',
          action: 'list',
          params: {
            resourceId
          }
        });
      } catch (error) {
        console.error(`Failed to fetch comments for resource ${resourceId}:`, error);
        comments.value = [];
      }
    };
    
    // 获取相关资源
    const fetchRelatedResources = async (category, currentId) => {
      try {
        const resources = await resourceService.getResourcesByCategory(category);
        
        // 过滤掉当前资源，并只取最多4个
        relatedResources.value = resources
          .filter(item => item.id !== currentId)
          .slice(0, 4);
      } catch (error) {
        console.error(`Failed to fetch related resources for category ${category}:`, error);
        relatedResources.value = [];
      }
    };
    
    // 获取热门资源
    const fetchPopularResources = async (currentId) => {
      try {
        const resources = await resourceService.getPopularResources(5);
        
        // 过滤掉当前资源
        popularResources.value = resources.filter(item => item.id !== currentId);
      } catch (error) {
        console.error('Failed to fetch popular resources:', error);
        popularResources.value = [];
      }
    };
    
    // 获取作者的资源数量
    const fetchAuthorResources = async (authorId) => {
      try {
        const resources = await resourceService.getResourcesByAuthor(authorId);
        authorResourceCount.value = resources.length;
      } catch (error) {
        console.error(`Failed to fetch resources for author ${authorId}:`, error);
        authorResourceCount.value = 0;
      }
    };
    
    // 提交评论
    const submitComment = async () => {
      if (!newComment.value.trim()) return;
      
      try {
        const commentData = {
          content: newComment.value.trim(),
          author: 'user2', // 模拟当前用户
          resourceId: resource.value.id
        };
        
        await apiConnector.request({
          resource: 'comments',
          action: 'create',
          data: commentData
        });
        
        // 重新获取评论列表
        await fetchComments(resource.value.id);
        
        // 清空评论框
        newComment.value = '';
        
        // 显示成功提示
        alert('评论发表成功！');
      } catch (error) {
        console.error('Failed to submit comment:', error);
        alert('评论发表失败，请稍后重试。');
      }
    };
    
    // 收藏资源
    const addToFavorites = () => {
      // 模拟收藏功能，实际项目中应与后端交互
      alert('收藏成功！');
    };
    
    // 下载资源
    const downloadResource = () => {
      if (!resource.value) return;
      
      // 实际项目中，这里应该检查用户权限、支付状态等
      if (resource.value.price > 0) {
        // 显示支付对话框
        if (confirm(`此资源价格为 ¥${resource.value.price}，确认购买吗？`)) {
          // 模拟支付过程
          alert('支付成功，开始下载...');
          simulateDownload();
        }
      } else {
        // 免费资源直接下载
        simulateDownload();
      }
    };
    
    // 模拟下载过程
    const simulateDownload = () => {
      if (!resource.value || !resource.value.downloadUrl) return;
      
      // 在实际应用中，这里应该增加下载计数并记录下载历史
      // 为了演示，我们直接打开一个新窗口
      window.open(resource.value.downloadUrl, '_blank');
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
    
    onMounted(() => {
      const resourceId = route.params.id;
      if (resourceId) {
        fetchResourceDetail(resourceId);
      } else {
        router.push('/resource-market');
      }
    });
    
    return {
      isLoading,
      resource,
      comments,
      relatedResources,
      popularResources,
      authorName,
      authorResourceCount,
      newComment,
      getAuthorName,
      submitComment,
      addToFavorites,
      downloadResource,
      formatDate
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
</style> 