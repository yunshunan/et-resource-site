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
                  v-model="email" 
                  required
                  placeholder="请输入您的邮箱"
                >
              </div>
              
              <div class="mb-4">
                <label for="password" class="form-label">密码</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password" 
                  required
                  placeholder="请输入密码"
                >
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const email = ref('')
    const password = ref('')
    
    const handleLogin = async () => {
      const success = await authStore.login(email.value, password.value)
      
      if (success) {
        // 登录成功，跳转到首页或之前的页面
        const redirectPath = router.currentRoute.value.query.redirect || '/'
        router.push(redirectPath)
      }
    }
    
    return {
      email,
      password,
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