<template>
  <div class="resource-upload-page py-5">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-12">
          <h2 class="text-center mb-4">上传资源</h2>
          <p class="text-center text-muted">分享您的资源，帮助更多人</p>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <resource-upload-form @upload-success="handleUploadSuccess" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 上传成功提示 -->
    <div 
      class="modal fade" 
      id="successModal" 
      tabindex="-1" 
      aria-labelledby="successModalLabel" 
      aria-hidden="true"
      ref="successModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="successModalLabel">上传成功</h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>您的资源已成功上传！</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              继续上传
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="goToResource"
            >
              查看资源
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import ResourceUploadForm from '@/components/ResourceUploadForm.vue'

export default {
  name: 'ResourceUploadView',
  components: {
    ResourceUploadForm
  },
  setup() {
    const router = useRouter()
    const successModal = ref(null)
    const uploadedResource = ref(null)
    
    // 处理上传成功
    const handleUploadSuccess = (resource) => {
      // 保存上传的资源信息
      uploadedResource.value = resource
      
      // 显示成功提示
      if (successModal.value) {
        const modal = new Modal(successModal.value)
        modal.show()
      } else {
        // 如果模态框还没准备好，等待DOM更新
        setTimeout(() => {
          const modal = new Modal(successModal.value)
          modal.show()
        }, 100)
      }
    }
    
    // 跳转到资源详情页
    const goToResource = () => {
      if (uploadedResource.value && uploadedResource.value._id) {
        router.push(`/resources/${uploadedResource.value._id}`)
      }
    }
    
    return {
      successModal,
      handleUploadSuccess,
      goToResource
    }
  }
}
</script>

<style scoped>
.resource-upload-page {
  min-height: calc(100vh - 200px);
}
</style> 