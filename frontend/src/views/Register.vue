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
import { 
  isValidUsername, 
  isValidEmail, 
  isValidPassword, 
  isPasswordMatch, 
  validateForm 
} from '@/utils/formValidator'

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
    
    const validateFormData = () => {
      // 定义验证规则
      const rules = {
        username: [
          { required: true, message: '用户名不能为空' },
          { validator: (value) => isValidUsername(value, 3), message: '用户名至少需要3个字符' }
        ],
        email: [
          { required: true, message: '邮箱不能为空' },
          { validator: isValidEmail, message: '请输入有效的邮箱地址' }
        ],
        password: [
          { required: true, message: '密码不能为空' },
          { validator: (value) => isValidPassword(value, { minLength: 6 }), message: '密码至少需要6个字符' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码' },
          { validator: (value) => isPasswordMatch(formData.password, value), message: '两次输入的密码不一致' }
        ],
        agreement: [
          { validator: (value) => value === true, message: '请阅读并同意服务条款和隐私政策' }
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
    
    const handleRegister = async () => {
      if (!validateFormData()) {
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
    
    // 保留这个注释和函数以避免ESLint错误
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