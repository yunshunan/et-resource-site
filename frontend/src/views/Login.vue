<template>
  <div class="login-page container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">用户登录</h2>
            
            <div v-if="authStore.error" class="alert alert-danger" role="alert">
              {{ authStore.error }}
            </div>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">电子邮箱</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="formData.email" 
                  required
                  placeholder="请输入您的邮箱"
                >
                <div v-if="formErrors.email" class="form-text text-danger">
                  {{ formErrors.email }}
                </div>
              </div>
              
              <div class="mb-4">
                <label for="password" class="form-label">密码</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="formData.password" 
                  required
                  placeholder="请输入密码"
                >
                <div v-if="formErrors.password" class="form-text text-danger">
                  {{ formErrors.password }}
                </div>
                <div class="form-text text-end">
                  <router-link to="/forgot-password" class="text-decoration-none">忘记密码?</router-link>
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  登录
                </button>
                
                <div class="text-center mt-3">
                  还没有账号? 
                  <router-link to="/register" class="text-decoration-none">立即注册</router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isValidEmail, validateForm } from '@/utils/formValidator'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const formData = reactive({
      email: '',
      password: ''
    })
    
    const formErrors = reactive({
      email: '',
      password: ''
    })
    
    const validateFormData = () => {
      // 定义验证规则
      const rules = {
        email: [
          { required: true, message: '邮箱不能为空' },
          { validator: isValidEmail, message: '请输入有效的邮箱地址' }
        ],
        password: [
          { required: true, message: '密码不能为空' }
        ]
      }
      
      // 重置错误信息
      Object.keys(formErrors).forEach(key => {
        formErrors[key] = ''
      })
      
      // 验证表单
      const { isValid, errors } = validateForm(formData, rules)
      
      // 设置错误信息
      if (!isValid) {
        Object.entries(errors).forEach(([field, message]) => {
          formErrors[field] = message
        })
      }
      
      return isValid
    }
    
    const handleLogin = async () => {
      if (!validateFormData()) {
        return
      }
      
      const success = await authStore.login(formData.email, formData.password)
      
      if (success) {
        // 登录成功，跳转到首页或之前的页面
        const redirectPath = router.currentRoute.value.query.redirect || '/'
        router.push(redirectPath)
      }
    }
    
    return {
      formData,
      formErrors,
      authStore,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.card {
  border-radius: 10px;
  border: none;
}
</style> 