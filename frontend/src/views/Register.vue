<template>
  <div class="register-page container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">用户注册</h2>
            
            <div v-if="authStore.error" class="alert alert-danger" role="alert">
              {{ authStore.error }}
            </div>
            
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="formData.username" 
                  required
                  placeholder="请输入用户名"
                >
                <div v-if="formErrors.username" class="form-text text-danger">
                  {{ formErrors.username }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">电子邮箱</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="formData.email" 
                  required
                  placeholder="请输入邮箱"
                >
                <div v-if="formErrors.email" class="form-text text-danger">
                  {{ formErrors.email }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="formData.password" 
                  required
                  placeholder="请设置密码"
                >
                <div v-if="formErrors.password" class="form-text text-danger">
                  {{ formErrors.password }}
                </div>
                <div class="form-text">密码长度至少6个字符</div>
              </div>
              
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">确认密码</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword" 
                  v-model="formData.confirmPassword" 
                  required
                  placeholder="请再次输入密码"
                >
                <div v-if="formErrors.confirmPassword" class="form-text text-danger">
                  {{ formErrors.confirmPassword }}
                </div>
              </div>
              
              <div class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="agreement" 
                  v-model="formData.agreement" 
                  required
                >
                <label class="form-check-label" for="agreement">
                  我已阅读并同意 <a href="#" class="text-decoration-none">服务条款</a> 和 <a href="#" class="text-decoration-none">隐私政策</a>
                </label>
                <div v-if="formErrors.agreement" class="form-text text-danger">
                  {{ formErrors.agreement }}
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  注册
                </button>
                
                <div class="text-center mt-3">
                  已有账号? 
                  <router-link to="/login" class="text-decoration-none">立即登录</router-link>
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

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const formData = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreement: false
    })
    
    const formErrors = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreement: ''
    })
    
    const validateForm = () => {
      // 重置错误信息
      Object.keys(formErrors).forEach(key => {
        formErrors[key] = ''
      })
      
      let isValid = true
      
      // 用户名验证
      if (formData.username.length < 3) {
        formErrors.username = '用户名至少需要3个字符'
        isValid = false
      }
      
      // 邮箱验证
      const emailRegex = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(formData.email)) {
        formErrors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      // 密码验证
      if (formData.password.length < 6) {
        formErrors.password = '密码至少需要6个字符'
        isValid = false
      }
      
      // 确认密码
      if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      // 协议勾选
      if (!formData.agreement) {
        formErrors.agreement = '请阅读并同意服务条款和隐私政策'
        isValid = false
      }
      
      return isValid
    }
    
    const handleRegister = async () => {
      if (!validateForm()) {
        return
      }
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      }
      
      const success = await authStore.register(userData)
      
      if (success) {
        // 注册成功，跳转到首页
        router.push('/')
      }
    }
    
    // 修复不必要的转义字符
    // eslint-disable-next-line no-unused-vars
    const validatePassword = (rule, value, callback) => {
      // 密码必须包含数字、字母和特殊字符
      const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/
      if (!regex.test(value)) {
        callback(new Error('密码必须包含数字、字母和特殊字符'))
      } else {
        callback()
      }
    }
    
    return {
      formData,
      formErrors,
      authStore,
      handleRegister,
      validatePassword
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.card {
  border-radius: 10px;
  border: none;
}
</style> 