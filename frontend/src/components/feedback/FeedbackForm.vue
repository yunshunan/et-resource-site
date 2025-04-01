<template>
  <div class="feedback-form">
    <div class="feedback-header">
      <h3>反馈与建议</h3>
      <p>您的反馈对我们很重要，帮助我们不断改进产品</p>
    </div>

    <form @submit.prevent="submitFeedback" class="feedback-content">
      <div class="form-group">
        <label for="feedbackType">反馈类型</label>
        <select 
          id="feedbackType" 
          v-model="feedback.type"
          required
        >
          <option value="bug">问题反馈</option>
          <option value="feature">功能建议</option>
          <option value="performance">性能问题</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div class="form-group">
        <label for="feedbackTitle">标题</label>
        <input 
          type="text" 
          id="feedbackTitle"
          v-model="feedback.title"
          placeholder="请简要描述您的反馈"
          required
        >
      </div>

      <div class="form-group">
        <label for="feedbackContent">详细描述</label>
        <textarea 
          id="feedbackContent"
          v-model="feedback.content"
          rows="5"
          placeholder="请详细描述您遇到的问题或建议"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="feedbackPriority">优先级</label>
        <select 
          id="feedbackPriority" 
          v-model="feedback.priority"
          required
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">紧急</option>
        </select>
      </div>

      <div class="form-group">
        <label>复现步骤</label>
        <div 
          v-for="(step, index) in feedback.steps" 
          :key="index"
          class="step-item"
        >
          <input 
            type="text"
            v-model="feedback.steps[index]"
            :placeholder="`步骤 ${index + 1}`"
          >
          <button 
            type="button" 
            @click="removeStep(index)"
            class="remove-step"
          >
            删除
          </button>
        </div>
        <button 
          type="button" 
          @click="addStep"
          class="add-step"
        >
          添加步骤
        </button>
      </div>

      <div class="form-group">
        <label>附件</label>
        <div class="file-upload">
          <input 
            type="file" 
            @change="handleFileUpload"
            multiple
            accept="image/*,.pdf,.doc,.docx"
          >
          <div class="file-list" v-if="feedback.attachments.length">
            <div 
              v-for="(file, index) in feedback.attachments" 
              :key="index"
              class="file-item"
            >
              <span>{{ file.name }}</span>
              <button 
                type="button" 
                @click="removeFile(index)"
                class="remove-file"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="submit-btn"
        >
          {{ isSubmitting ? '提交中...' : '提交反馈' }}
        </button>
        <button 
          type="button" 
          @click="resetForm"
          class="reset-btn"
        >
          重置
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'FeedbackForm',
  setup() {
    const notificationStore = useNotificationStore()
    const isSubmitting = ref(false)

    const feedback = reactive({
      type: 'bug',
      title: '',
      content: '',
      priority: 'medium',
      steps: [''],
      attachments: []
    })

    const addStep = () => {
      feedback.steps.push('')
    }

    const removeStep = (index) => {
      feedback.steps.splice(index, 1)
    }

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      feedback.attachments.push(...files)
    }

    const removeFile = (index) => {
      feedback.attachments.splice(index, 1)
    }

    const resetForm = () => {
      feedback.type = 'bug'
      feedback.title = ''
      feedback.content = ''
      feedback.priority = 'medium'
      feedback.steps = ['']
      feedback.attachments = []
    }

    const submitFeedback = async () => {
      try {
        isSubmitting.value = true
        
        const formData = new FormData()
        formData.append('type', feedback.type)
        formData.append('title', feedback.title)
        formData.append('content', feedback.content)
        formData.append('priority', feedback.priority)
        formData.append('steps', JSON.stringify(feedback.steps))
        
        feedback.attachments.forEach(file => {
          formData.append('attachments', file)
        })

        const response = await axios.post('/api/feedback', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        notificationStore.addNotification({
          type: 'success',
          title: '反馈提交成功',
          message: '感谢您的反馈，我们会尽快处理'
        })

        resetForm()
      } catch (error) {
        console.error('提交反馈失败:', error)
        notificationStore.addNotification({
          type: 'error',
          title: '提交失败',
          message: '提交反馈时发生错误，请稍后重试'
        })
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      feedback,
      isSubmitting,
      addStep,
      removeStep,
      handleFileUpload,
      removeFile,
      resetForm,
      submitFeedback
    }
  }
}
</script>

<style scoped>
.feedback-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feedback-header {
  text-align: center;
  margin-bottom: 30px;
}

.feedback-header h3 {
  margin: 0;
  color: #333;
}

.feedback-header p {
  margin: 10px 0 0;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.step-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.step-item input {
  flex: 1;
}

.remove-step,
.add-step {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remove-step {
  background: #ffebee;
  color: #c62828;
}

.add-step {
  background: #e3f2fd;
  color: #1565c0;
}

.file-upload {
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 5px;
}

.remove-file {
  padding: 4px 8px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.submit-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn {
  background: #2196f3;
  color: white;
}

.submit-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

@media (max-width: 768px) {
  .feedback-form {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
  }
}
</style> 