<template>
  <div class="message-sender">
    <div class="message-input-wrapper">
      <!-- 预览区域 -->
      <div v-if="mediaPreview" class="media-preview-container mb-2">
        <div class="media-preview">
          <!-- 图片预览 -->
          <img v-if="mediaType === 'image'" :src="mediaPreview" class="preview-image" alt="图片预览" />
          
          <!-- 视频预览 -->
          <video v-else-if="mediaType === 'video'" controls class="preview-video">
            <source :src="mediaPreview" :type="mediaFile?.type">
            您的浏览器不支持视频预览
          </video>
          
          <!-- 文件预览 -->
          <div v-else-if="mediaType === 'file'" class="file-preview">
            <i class="bi bi-file-earmark me-2"></i>
            <span class="file-name">{{ mediaFile?.name }}</span>
            <span class="file-size" v-if="mediaFile">{{ formatFileSize(mediaFile.size) }}</span>
          </div>
        </div>
        
        <!-- 删除媒体按钮 -->
        <button class="btn btn-sm btn-close clear-media-btn" @click="clearMediaPreview"></button>
      </div>
      
      <div class="d-flex align-items-end">
        <!-- 附件菜单 -->
        <div class="dropdown">
          <button 
            class="btn btn-sm btn-icon me-2 dropdown-toggle"
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            title="添加附件" 
            :disabled="isSending || !!mediaPreview"
          >
            <i class="bi bi-paperclip"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <label class="dropdown-item attach-label">
                <i class="bi bi-image me-2"></i>图片
                <input 
                  type="file" 
                  ref="imageInput"
                  class="d-none" 
                  accept="image/*"
                  @change="handleFileSelected"
                />
              </label>
            </li>
            <li>
              <label class="dropdown-item attach-label">
                <i class="bi bi-camera-video me-2"></i>视频
                <input 
                  type="file" 
                  ref="videoInput"
                  class="d-none" 
                  accept="video/*"
                  @change="handleFileSelected"
                />
              </label>
            </li>
            <li>
              <label class="dropdown-item attach-label">
                <i class="bi bi-file-earmark me-2"></i>文件
                <input 
                  type="file" 
                  ref="fileInput"
                  class="d-none" 
                  @change="handleFileSelected"
                />
              </label>
            </li>
          </ul>
        </div>
        
        <!-- Emoji button -->
        <button 
          class="btn btn-sm btn-icon me-2" 
          title="添加表情" 
          @click="toggleEmojiPicker"
          :disabled="isSending"
        >
          <i class="bi bi-emoji-smile"></i>
        </button>
        
        <!-- Text input -->
        <div class="form-group flex-grow-1">
          <textarea 
            v-model="message" 
            class="form-control message-input" 
            placeholder="输入消息..." 
            @input="autoResize"
            @keyup="handleTyping"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.ctrl.enter.prevent="sendMessage"
            :disabled="isSending || !chatId"
            rows="1"
            ref="messageInput"
          ></textarea>
        </div>
        
        <!-- Send button -->
        <button 
          class="btn btn-primary ms-2 send-button" 
          :disabled="(!message.trim() && !mediaPreview) || isSending || !chatId"
          @click="sendMessage"
        >
          <i v-if="isSending" class="spinner-border spinner-border-sm" role="status"></i>
          <i v-else class="bi bi-send"></i>
          <span class="ms-1 d-none d-sm-inline">发送</span>
        </button>
      </div>
      
      <!-- Emoji picker (hidden by default) -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-picker-header">
          <span>表情选择</span>
          <button class="btn btn-sm btn-close" @click="toggleEmojiPicker"></button>
        </div>
        <div class="emoji-grid">
          <!-- Common emoji set -->
          <button 
            v-for="emoji in commonEmojis" 
            :key="emoji" 
            class="emoji-btn"
            @click="insertEmoji(emoji)"
          >{{ emoji }}</button>
        </div>
      </div>
      
      <!-- Keyboard shortcuts info -->
      <div class="keyboard-shortcuts-info small text-muted mt-1 ps-1">
        按 Enter 发送消息 | Ctrl+Enter 换行
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useMessagesStore } from '@/stores/messages'

export default {
  name: 'MessageSender',
  props: {
    chatId: {
      type: String,
      default: ''
    }
  },
  emits: ['sent', 'typing'],
  setup(props, { emit }) {
    const messagesStore = useMessagesStore()
    const message = ref('')
    const messageInput = ref(null)
    const isSending = ref(false)
    const showEmojiPicker = ref(false)
    
    // 文件输入引用
    const imageInput = ref(null)
    const videoInput = ref(null)
    const fileInput = ref(null)
    
    // 媒体预览状态
    const mediaPreview = ref(null)
    const mediaType = ref(null)
    const mediaFile = ref(null)
    
    // 常用表情列表
    const commonEmojis = [
      '😊', '😂', '❤️', '👍', '🙏', '😍', 
      '😒', '😘', '🤔', '😁', '💪', '👏',
      '🎉', '🔥', '👀', '💯', '🤣', '😢'
    ]
    
    // 自动调整文本框高度
    const autoResize = () => {
      if (!messageInput.value) return
      
      // 重置高度以获取正确的scrollHeight
      messageInput.value.style.height = 'auto'
      
      // 设置新高度
      const newHeight = Math.min(Math.max(38, messageInput.value.scrollHeight), 100)
      messageInput.value.style.height = `${newHeight}px`
    }
    
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
    
    // 处理文件选择
    const handleFileSelected = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      mediaFile.value = file
      
      // 根据输入类型确定媒体类型
      if (event.target === imageInput.value) {
        mediaType.value = 'image'
      } else if (event.target === videoInput.value) {
        mediaType.value = 'video'
      } else {
        mediaType.value = 'file'
      }
      
      // 为图片和视频创建预览URL
      if (mediaType.value === 'image' || mediaType.value === 'video') {
        mediaPreview.value = URL.createObjectURL(file)
      } else {
        // 文件类型不需要URL预览
        mediaPreview.value = 'file-preview'
      }
      
      // 清除文件输入的值，以便重新选择相同文件时也能触发change事件
      event.target.value = ''
    }
    
    // 清除媒体预览
    const clearMediaPreview = () => {
      if (mediaPreview.value && mediaPreview.value !== 'file-preview') {
        URL.revokeObjectURL(mediaPreview.value)
      }
      mediaPreview.value = null
      mediaType.value = null
      mediaFile.value = null
    }
    
    // 发送消息
    const sendMessage = async () => {
      if ((!message.value.trim() && !mediaPreview.value) || !props.chatId) return
      
      try {
        isSending.value = true
        
        if (mediaPreview.value) {
          // 如果有媒体文件，模拟上传文件过程
          await simulateFileUpload(mediaFile.value)
          
          // 根据媒体类型准备消息内容
          let content = '';
          let contentType = mediaType.value;
          let additionalData = {};
          
          if (mediaType.value === 'image') {
            // 在实际应用中，这里应该是上传后返回的URL
            content = mediaPreview.value;
          } else if (mediaType.value === 'video') {
            // 在实际应用中，这里应该是上传后返回的URL
            content = mediaPreview.value;
            additionalData.mimeType = mediaFile.value.type;
          } else if (mediaType.value === 'file') {
            // 在实际应用中，这里应该是上传后返回的URL
            content = URL.createObjectURL(mediaFile.value); // 临时URL用于演示
            additionalData.fileName = mediaFile.value.name;
            additionalData.fileSize = mediaFile.value.size;
          }
          
          // 发送媒体消息
          await messagesStore.sendMessage(props.chatId, content, {
            contentType: contentType,
            ...additionalData,
            // 如果有文本消息，可以作为附加说明
            caption: message.value.trim()
          });
          
          // 清除媒体预览
          clearMediaPreview();
        } else {
          // 发送纯文本消息
          await messagesStore.sendMessage(props.chatId, message.value.trim());
        }
        
        // 清空输入框
        message.value = '';
        
        // 重置输入框高度
        nextTick(() => {
          if (messageInput.value) {
            messageInput.value.style.height = 'auto';
            messageInput.value.focus();
          }
        });
        
        // 通知父组件消息已发送
        emit('sent');
      } catch (error) {
        console.error('发送消息失败:', error);
      } finally {
        isSending.value = false;
      }
    };
    
    // 模拟文件上传过程
    const simulateFileUpload = (file) => {
      return new Promise((resolve) => {
        // 模拟上传延迟
        setTimeout(() => {
          console.log('文件上传成功:', file.name);
          resolve();
        }, 1500);
      });
    };
    
    // 处理用户输入
    let typingTimeout = null
    const handleTyping = () => {
      // 防抖处理，避免频繁触发
      clearTimeout(typingTimeout)
      
      // 通知父组件用户正在输入
      emit('typing')
      
      // 设置新的超时
      typingTimeout = setTimeout(() => {
        // 停止输入状态
      }, 3000)
    }
    
    // 处理附件
    const handleAttachment = () => {
      // 暂时使用简单的提示
      alert('附件功能即将推出')
    }
    
    // 切换表情选择器显示状态
    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }
    
    // 插入表情到消息中
    const insertEmoji = (emoji) => {
      message.value += emoji
      // 聚焦回输入框
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus()
          // 更新输入框高度
          autoResize()
        }
      })
    }
    
    // 监听聊天ID变化
    watch(() => props.chatId, () => {
      message.value = ''
      showEmojiPicker.value = false
      clearMediaPreview()
      
      // 重置输入框高度
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.style.height = 'auto'
        }
      })
    })
    
    // 初始化自动聚焦
    nextTick(() => {
      if (messageInput.value && props.chatId) {
        messageInput.value.focus()
      }
    })
    
    // 清理定时器和对象URL
    const cleanup = () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      clearMediaPreview()
    }
    
    return {
      message,
      messageInput,
      isSending,
      showEmojiPicker,
      commonEmojis,
      imageInput,
      videoInput,
      fileInput,
      mediaPreview,
      mediaType,
      mediaFile,
      sendMessage,
      autoResize,
      handleTyping,
      handleAttachment,
      toggleEmojiPicker,
      insertEmoji,
      handleFileSelected,
      clearMediaPreview,
      formatFileSize,
      cleanup
    }
  },
  unmounted() {
    this.cleanup()
  }
}
</script>

<style scoped>
.message-sender {
  width: 100%;
  background-color: white;
  border-top: 1px solid #e9ecef;
  padding: 15px;
  position: relative;
}

.message-input-wrapper {
  width: 100%;
  position: relative;
}

.message-input {
  resize: none;
  min-height: 38px;
  max-height: 100px;
  overflow-y: auto;
  border-radius: 20px;
  padding-right: 40px;
}

.send-button {
  border-radius: 20px;
  min-width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: none;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #e9ecef;
}

/* 表情选择器样式 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 250px;
  overflow: hidden;
}

.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-btn:hover {
  background-color: #f8f9fa;
}

.keyboard-shortcuts-info {
  font-size: 0.75rem;
}

/* 媒体预览样式 */
.media-preview-container {
  position: relative;
  border-radius: 8px;
  background-color: #f8f9fa;
  overflow: hidden;
}

.media-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  min-height: 50px;
}

.preview-image {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
}

.preview-video {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
}

.file-preview {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.file-name {
  font-weight: 500;
  margin-right: 10px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #6c757d;
  font-size: 0.8rem;
}

.clear-media-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.7);
}

.attach-label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .message-sender {
    padding: 10px;
  }
}
</style> 