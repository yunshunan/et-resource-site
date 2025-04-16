<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <img src="../assets/logo.png" alt="ET Resource Logo" class="logo" />
        <h1>ET资源网</h1>
      </div>
      
      <div class="form-section">
        <h2>用户登录</h2>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="loginForm.email" 
            placeholder="请输入邮箱"
            @keyup.enter="handleLogin"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </div>
        
        <div class="options-row">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember" />
            <span>记住我</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">忘记密码?</router-link>
        </div>
        
        <button 
          @click="handleLogin" 
          class="login-button"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div class="register-link">
          还没有账号? <router-link to="/register">立即注册</router-link>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'LoginView',
  setup() {
    const loginForm = ref({
      email: '',
      password: '',
      remember: false
    });
    const isLoading = ref(false);
    const error = ref(null);
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();

    // 监听 authStore 中的错误变化，并更新本地 error ref
    watch(() => authStore.error, (newError) => {
      error.value = newError;
    });

    const handleLogin = async () => {
      // 验证表单
      if (!loginForm.value.email || !loginForm.value.password) {
        error.value = '请输入邮箱和密码';
        return;
      }
      
      isLoading.value = true;
      
      // 直接调用 authStore 中的 login 方法
      const success = await authStore.login(
        loginForm.value.email, 
        loginForm.value.password
      );
      
      if (success) {
        console.log('LeanCloud + JWT 登录成功!');
        // 重定向逻辑保持不变，如果登录成功，authStore 会更新状态，导航守卫会处理
        const redirectPath = route.query.redirect || '/';
        router.push(redirectPath);
        console.log('登录成功，已重定向到', redirectPath);
      } else {
        // 错误信息会通过 watch 自动更新到 error.value
        console.error('登录失败:', authStore.error);
      }

      isLoading.value = false; // 无论成功失败，结束 loading
    };

    return {
      loginForm,
      isLoading,
      error,
      handleLogin
    };
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.logo-section h1 {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 500;
}

.form-section {
  padding: 30px;
}

.form-section h2 {
  margin-bottom: 25px;
  text-align: center;
  font-size: 22px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  margin-right: 6px;
}

.forgot-password {
  color: #3498db;
  text-decoration: none;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  text-align: center;
}
</style> 