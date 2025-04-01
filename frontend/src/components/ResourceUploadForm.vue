<template>
  <div class="resource-upload-form">
    <div v-if="resourceStore.error" class="alert alert-danger" role="alert">
      {{ resourceStore.error }}
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="title" class="form-label">资源标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="formData.title" 
          class="form-control" 
          :class="{ 'is-invalid': formErrors.title }" 
          required
        >
        <div v-if="formErrors.title" class="invalid-feedback">
          {{ formErrors.title }}
        </div>
        <small class="text-muted">3-100个字符</small>
      </div>
      
      <div class="mb-3">
        <label for="category" class="form-label">分类</label>
        <select 
          id="category" 
          v-model="formData.category" 
          class="form-select" 
          :class="{ 'is-invalid': formErrors.category }" 
          required
        >
          <option value="" disabled>选择分类</option>
          <option value="办公资源">办公资源</option>
          <option value="设计资源">设计资源</option>
          <option value="营销资源">营销资源</option>
          <option value="教育资源">教育资源</option>
          <option value="开发资源">开发资源</option>
          <option value="其他">其他</option>
        </select>
        <div v-if="formErrors.category" class="invalid-feedback">
          {{ formErrors.category }}
        </div>
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">资源描述</label>
        <textarea 
          id="description" 
          v-model="formData.description" 
          class="form-control" 
          :class="{ 'is-invalid': formErrors.description }" 
          rows="3" 
          required
        ></textarea>
        <div v-if="formErrors.description" class="invalid-feedback">
          {{ formErrors.description }}
        </div>
        <small class="text-muted">10-500个字符</small>
      </div>
      
      <div class="mb-3">
        <label for="tags" class="form-label">标签</label>
        <div class="input-group">
          <input 
            type="text" 
            id="tag-input" 
            v-model="tagInput" 
            class="form-control" 
            placeholder="输入标签并按回车添加"
            @keydown.enter.prevent="addTag"
          >
          <button 
            type="button" 
            class="btn btn-outline-primary" 
            @click="addTag"
          >
            添加
          </button>
        </div>
        <div v-if="formErrors.tags" class="text-danger small mt-1">
          {{ formErrors.tags }}
        </div>
        <div class="tag-list mt-2">
          <span 
            v-for="(tag, index) in formData.tags" 
            :key="index" 
            class="badge bg-primary me-2 mb-2 p-2"
          >
            {{ tag }}
            <i class="bi bi-x ms-1" style="cursor: pointer;" @click="removeTag(index)"></i>
          </span>
        </div>
        <small class="text-muted">最多10个标签</small>
      </div>
      
      <div class="mb-3">
        <label for="image" class="form-label">封面图片</label>
        <input 
          type="file" 
          id="image" 
          class="form-control" 
          :class="{ 'is-invalid': formErrors.imageUrl }" 
          @change="handleImageUpload" 
          accept="image/jpeg,image/png,image/gif" 
          required
        >
        <div v-if="formErrors.imageUrl" class="invalid-feedback">
          {{ formErrors.imageUrl }}
        </div>
        <small class="text-muted">支持JPG、PNG、GIF格式，最大5MB</small>
        <div v-if="imagePreview" class="mt-2">
          <img :src="imagePreview" alt="预览" class="img-thumbnail" style="max-height: 200px">
        </div>
      </div>
      
      <div class="mb-3">
        <label for="file" class="form-label">资源文件</label>
        <input 
          type="file" 
          id="file" 
          class="form-control" 
          :class="{ 'is-invalid': formErrors.downloadLink }" 
          @change="handleFileUpload" 
          required
        >
        <div v-if="formErrors.downloadLink" class="invalid-feedback">
          {{ formErrors.downloadLink }}
        </div>
        <small class="text-muted">支持PDF、Word、Excel、ZIP格式，最大20MB</small>
        <div v-if="formData.fileSize" class="form-text">
          文件大小: {{ formData.fileSize }} | 类型: {{ formData.fileType }}
        </div>
      </div>
      
      <div class="d-grid gap-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="resourceStore.loading"
        >
          <span 
            v-if="resourceStore.loading" 
            class="spinner-border spinner-border-sm me-2" 
            role="status"
          ></span>
          {{ props.editMode ? '更新资源' : '上传资源' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useResourceStore } from '@/stores/resources'

// 允许的图片类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
// 文件大小限制 (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;
// 图片大小限制 (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default {
  name: 'ResourceUploadForm',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    resourceId: {
      type: String,
      default: ''
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const resourceStore = useResourceStore()
    
    // 表单数据
    const formData = reactive({
      title: props.initialData.title || '',
      description: props.initialData.description || '',
      category: props.initialData.category || '',
      tags: props.initialData.tags || [],
      imageUrl: props.initialData.imageUrl || '',
      downloadLink: props.initialData.downloadLink || '',
      fileSize: props.initialData.fileSize || '',
      fileType: props.initialData.fileType || '',
      // 文件对象
      imageFile: null,
      resourceFile: null
    })
    
    // 表单验证错误
    const formErrors = reactive({
      title: '',
      description: '',
      category: '',
      tags: '',
      imageUrl: '',
      downloadLink: ''
    })
    
    // 图片预览
    const imagePreview = ref(props.initialData.imageUrl || '')
    
    // 标签输入
    const tagInput = ref('')
    
    // 添加标签
    const addTag = () => {
      if (!tagInput.value.trim()) return
      
      // 检查标签数量限制
      if (formData.tags.length >= 10) {
        formErrors.tags = '标签不能超过10个'
        return
      }
      
      // 避免重复标签
      if (!formData.tags.includes(tagInput.value.trim())) {
        formData.tags.push(tagInput.value.trim())
      }
      
      tagInput.value = ''
      formErrors.tags = ''
    }
    
    // 移除标签
    const removeTag = (index) => {
      formData.tags.splice(index, 1)
      formErrors.tags = ''
    }
    
    // 处理图片上传
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      formErrors.imageUrl = '';
      
      if (file) {
        // 检查图片类型
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          formErrors.imageUrl = '只支持JPG、PNG和GIF格式的图片';
          event.target.value = '';
          return;
        }
        
        // 检查图片大小
        if (file.size > MAX_IMAGE_SIZE) {
          formErrors.imageUrl = `图片大小不能超过${MAX_IMAGE_SIZE/1024/1024}MB`;
          event.target.value = '';
          return;
        }
        
        formData.imageFile = file
        
        // 预览图片
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      formErrors.downloadLink = '';
      
      if (file) {
        // 检查文件类型
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          formErrors.downloadLink = '不支持的文件类型，请上传PDF、Word、Excel或ZIP文件';
          event.target.value = '';
          return;
        }
        
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
          formErrors.downloadLink = `文件大小不能超过${MAX_FILE_SIZE/1024/1024}MB`;
          event.target.value = '';
          return;
        }
        
        formData.resourceFile = file
        formData.fileSize = formatFileSize(file.size)
        formData.fileType = file.type
      }
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    }
    
    // 验证表单
    const validateForm = () => {
      let isValid = true
      
      // 重置错误
      Object.keys(formErrors).forEach(key => {
        formErrors[key] = ''
      })
      
      // 标题验证
      if (!formData.title.trim()) {
        formErrors.title = '请填写资源标题'
        isValid = false
      } else if (formData.title.trim().length < 3) {
        formErrors.title = '标题至少需要3个字符'
        isValid = false
      } else if (formData.title.trim().length > 100) {
        formErrors.title = '标题不能超过100个字符'
        isValid = false
      }
      
      // 分类验证
      if (!formData.category) {
        formErrors.category = '请选择资源分类'
        isValid = false
      }
      
      // 描述验证
      if (!formData.description.trim()) {
        formErrors.description = '请填写资源描述'
        isValid = false
      } else if (formData.description.trim().length < 10) {
        formErrors.description = '描述至少需要10个字符'
        isValid = false
      } else if (formData.description.trim().length > 500) {
        formErrors.description = '描述不能超过500个字符'
        isValid = false
      }
      
      // 标签验证
      if (formData.tags.length > 10) {
        formErrors.tags = '标签不能超过10个'
        isValid = false
      }
      
      // 图片验证
      if (!props.editMode && !formData.imageFile) {
        formErrors.imageUrl = '请上传资源封面图'
        isValid = false
      }
      
      // 文件验证
      if (!props.editMode && !formData.resourceFile) {
        formErrors.downloadLink = '请上传资源文件'
        isValid = false
      }
      
      return isValid
    }
    
    // 处理表单提交
    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }
      
      try {
        // 创建FormData对象用于上传文件
        const formDataObj = new FormData()
        formDataObj.append('title', formData.title.trim())
        formDataObj.append('description', formData.description.trim())
        formDataObj.append('category', formData.category)
        formDataObj.append('tags', JSON.stringify(formData.tags))
        
        if (formData.fileSize) {
          formDataObj.append('fileSize', formData.fileSize)
        }
        
        if (formData.fileType) {
          formDataObj.append('fileType', formData.fileType)
        }
        
        if (formData.imageFile) {
          formDataObj.append('image', formData.imageFile)
        }
        
        if (formData.resourceFile) {
          formDataObj.append('resource', formData.resourceFile)
        }
        
        let result
        
        if (props.editMode) {
          // 更新资源
          result = await resourceStore.updateResource(props.resourceId, formDataObj)
        } else {
          // 创建新资源
          result = await resourceStore.createResource(formDataObj)
        }
        
        if (result) {
          // 成功上传，发出事件
          emit('upload-success', result)
        }
      } catch (error) {
        console.error('资源上传失败:', error)
      }
    }
    
    return {
      resourceStore,
      formData,
      formErrors,
      imagePreview,
      tagInput,
      addTag,
      removeTag,
      handleImageUpload,
      handleFileUpload,
      handleSubmit,
      props
    }
  }
}
</script>

<style scoped>
.resource-upload-form {
  max-width: 700px;
  margin: 0 auto;
}

.tag-list .badge {
  font-size: 0.85rem;
}
</style> 