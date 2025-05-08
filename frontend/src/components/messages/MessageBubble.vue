<template>
  <!-- 如果是日期分隔符 -->
  <div v-if="message.type === 'date'" class="date-separator">
    <span class="date-label">{{ message.content }}</span>
  </div>
  
  <!-- 如果是普通消息 -->
  <div 
    v-else
    class="message-bubble-wrapper"
    :class="[
      message.sender === 'self' ? 'message-sent' : 'message-received',
      { 'message-failed': message.status === 'failed' }
    ]"
  >
    <!-- 根据消息内容类型渲染不同内容 -->
    <div class="message-content" :class="{'has-media': isMediaContent}">
      <!-- 普通文本消息 -->
      <template v-if="!message.contentType || message.contentType === 'text'">
        {{ message.content }}
      </template>
      
      <!-- 图片消息 -->
      <template v-else-if="message.contentType === 'image'">
        <div class="media-container image-container">
          <img 
            :src="message.content" 
            :alt="'图片'" 
            class="message-image"
            @click="handleImageClick(message.content)"
            @load="handleMediaLoaded"
            loading="lazy"
          />
          <div v-if="isImageLoading" class="image-loading">
            <div class="spinner-border spinner-border-sm text-light" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 视频消息 -->
      <template v-else-if="message.contentType === 'video'">
        <div class="media-container video-container">
          <video 
            controls 
            class="message-video"
            preload="metadata"
            @loadedmetadata="handleMediaLoaded"
          >
            <source :src="message.content" :type="message.mimeType || 'video/mp4'">
            您的浏览器不支持视频播放
          </video>
          <div v-if="isVideoLoading" class="video-loading">
            <div class="spinner-border spinner-border-sm text-light" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 文件消息 -->
      <template v-else-if="message.contentType === 'file'">
        <div class="file-container">
          <i class="bi bi-file-earmark me-2"></i>
          <a :href="message.content" target="_blank" class="file-link" download>
            {{ message.fileName || '下载文件' }}
          </a>
          <span class="file-size" v-if="message.fileSize">{{ formatFileSize(message.fileSize) }}</span>
        </div>
      </template>
      
      <!-- 链接预览 -->
      <template v-else-if="message.contentType === 'link'">
        <div class="link-preview-container">
          <a :href="message.content" target="_blank" rel="noopener noreferrer" class="link-url">
            {{ message.content }}
          </a>
          <div v-if="message.linkPreview" class="link-preview">
            <img v-if="message.linkPreview.image" :src="message.linkPreview.image" class="link-image" />
            <div class="link-info">
              <div class="link-title">{{ message.linkPreview.title || '链接' }}</div>
              <div class="link-description">{{ message.linkPreview.description || '' }}</div>
              <div class="link-domain">{{ extractDomain(message.content) }}</div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 默认情况：未知类型显示为文本 -->
      <template v-else>
        {{ message.content }}
      </template>
    </div>
    
    <div class="message-meta">
      <span class="message-time">{{ formattedTime }}</span>
      <span v-if="message.sender === 'self'" class="message-status">
        <i v-if="message.status === 'sending'" class="bi bi-clock text-muted" title="发送中"></i>
        <i v-else-if="message.status === 'sent'" class="bi bi-check text-muted" title="已发送"></i>
        <i v-else-if="message.status === 'delivered'" class="bi bi-check text-muted" title="已送达"></i>
        <i v-else-if="message.status === 'read'" class="bi bi-check-all text-primary" title="已读"></i>
        <i 
          v-else-if="message.status === 'failed'" 
          class="bi bi-exclamation-circle text-danger" 
          title="发送失败"
        ></i>
      </span>
    </div>
    
    <button 
      v-if="message.status === 'failed'" 
      class="btn btn-sm retry-button"
      @click="$emit('retry', message.id)"
    >
      重试
    </button>
  </div>
  
  <!-- 大图预览弹窗 -->
  <div v-if="showImagePreview" class="image-preview-overlay" @click="closeImagePreview">
    <div class="image-preview-container">
      <img :src="previewImageUrl" class="preview-image" @click.stop />
      <button class="btn btn-close btn-close-white close-preview-btn" @click="closeImagePreview"></button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'

export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  emits: ['retry', 'heightChange'],
  setup(props, { emit }) {
    // 媒体加载状态
    const isImageLoading = ref(true)
    const isVideoLoading = ref(true)
    
    // 图片预览状态
    const showImagePreview = ref(false)
    const previewImageUrl = ref('')
    
    // 判断是否为媒体内容
    const isMediaContent = computed(() => {
      return ['image', 'video', 'file', 'link'].includes(props.message.contentType)
    })
    
    // 格式化消息时间
    const formattedTime = computed(() => {
      // 如果是日期分隔符，直接返回空
      if (props.message.type === 'date') {
        return '';
      }

      try {
        let date;
        // 尝试使用 parseISO 解析
        try {
          date = parseISO(props.message.createdAt)
        } catch (e) {
          // 如果 parseISO 失败，尝试直接使用 Date 构造函数
          date = new Date(props.message.createdAt)
        }
        
        if (isNaN(date.getTime())) {
          return '';
        }
        
        return format(date, 'HH:mm')
      } catch (e) {
        console.error('无法格式化消息时间:', e)
        return ''
      }
    })
    
    // 格式化文件大小
    const formatFileSize = (sizeInBytes) => {
      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`
      } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`
      } else if (sizeInBytes < 1024 * 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
      } else {
        return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      }
    }
    
    // 提取链接域名
    const extractDomain = (url) => {
      try {
        const domain = new URL(url).hostname
        return domain
      } catch (e) {
        return url
      }
    }
    
    // 处理图片点击，打开大图预览
    const handleImageClick = (imageUrl) => {
      previewImageUrl.value = imageUrl
      showImagePreview.value = true
      // 阻止滚动
      document.body.style.overflow = 'hidden'
    }
    
    // 关闭图片预览
    const closeImagePreview = () => {
      showImagePreview.value = false
      // 恢复滚动
      document.body.style.overflow = ''
    }
    
    // 媒体加载完成回调
    const handleMediaLoaded = () => {
      if (props.message.contentType === 'image') {
        isImageLoading.value = false
      } else if (props.message.contentType === 'video') {
        isVideoLoading.value = false
      }
      
      // 通知父组件可能的高度变化
      emit('heightChange', props.message.id)
    }
    
    // 组件挂载时
    onMounted(() => {
      // 监听ESC键关闭预览
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && showImagePreview.value) {
          closeImagePreview()
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      
      // 卸载时移除监听
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })
    
    return {
      formattedTime,
      isMediaContent,
      isImageLoading,
      isVideoLoading,
      showImagePreview,
      previewImageUrl,
      formatFileSize,
      extractDomain,
      handleImageClick,
      closeImagePreview,
      handleMediaLoaded
    }
  }
}
</script>

<style scoped>
.message-bubble-wrapper {
  position: relative;
  max-width: 75%;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.message-sent {
  margin-left: auto;
  align-items: flex-end;
}

.message-received {
  margin-right: auto;
  align-items: flex-start;
}

.message-content {
  padding: 10px 12px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
  hyphens: auto;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-content.has-media {
  padding: 4px;
  overflow: hidden;
}

.message-sent .message-content {
  background-color: #0d6efd;
  color: white;
  border-top-right-radius: 4px;
}

.message-received .message-content {
  background-color: white;
  color: #212529;
  border-top-left-radius: 4px;
}

.message-failed .message-content {
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
}

.message-meta {
  font-size: 0.75rem;
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.message-sent .message-meta {
  color: #6c757d;
}

.message-received .message-meta {
  color: #6c757d;
}

.message-status {
  margin-left: 5px;
}

.retry-button {
  font-size: 0.75rem;
  padding: 2px 8px;
  margin-top: 5px;
  color: #dc3545;
  background: transparent;
  border: 1px solid #dc3545;
  border-radius: 12px;
}

.retry-button:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* 日期分隔符样式 */
.date-separator {
  text-align: center;
  position: relative;
  margin: 20px 0;
  width: 100%;
}

.date-separator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #dee2e6;
  z-index: 1;
}

.date-label {
  position: relative;
  background-color: #f8f9fa;
  padding: 0 10px;
  font-size: 0.75rem;
  color: #6c757d;
  z-index: 2;
}

/* 媒体消息样式 */
.media-container {
  position: relative;
  max-width: 250px;
  border-radius: 14px;
  overflow: hidden;
}

.message-image {
  max-width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: filter 0.3s ease;
}

.message-video {
  max-width: 100%;
  max-height: 250px;
  display: block;
  border-radius: 14px;
}

.image-loading,
.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

/* 文件消息样式 */
.file-container {
  display: flex;
  align-items: center;
  padding: 5px;
}

.file-link {
  color: inherit;
  text-decoration: none;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-sent .file-link {
  color: white;
}

.file-size {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-left: 5px;
}

/* 链接预览样式 */
.link-preview-container {
  display: flex;
  flex-direction: column;
}

.link-url {
  color: inherit;
  margin-bottom: 5px;
  word-break: break-all;
  text-decoration: none;
}

.message-sent .link-url {
  color: white;
}

.link-preview {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
}

.link-image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
}

.link-info {
  padding: 8px;
}

.link-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.link-description {
  font-size: 0.8rem;
  margin-bottom: 3px;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.link-domain {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* 图片预览弹窗 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-preview-container {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-preview-btn {
  position: absolute;
  top: 15px;
  right: 15px;
}

@media (max-width: 576px) {
  .message-bubble-wrapper {
    max-width: 85%;
  }
  
  .media-container {
    max-width: 200px;
  }
}
</style> 