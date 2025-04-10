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
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

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

    const handleLogin = async () => {
      // 验证表单
      if (!loginForm.value.email || !loginForm.value.password) {
        error.value = '请输入邮箱和密码';
        return;
      }
      
      isLoading.value = true;
      error.value = null;
      
      try {
        // 1. 使用Firebase进行身份验证
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          loginForm.value.email, 
          loginForm.value.password
        );
        
        console.log('Firebase登录成功:', userCredential.user.email);
        
        // 2. 获取Firebase ID令牌
        const idToken = await userCredential.user.getIdToken();
        
        // 3. 发送ID令牌到后端以获取JWT
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/verify-token`, 
          { idToken }
        );
        
        // 4. 存储JWT并更新认证状态
        if (response.data && response.data.token) {
          // 使用Pinia存储认证信息
          authStore.login({
            token: response.data.token,
            user: response.data.user
          });
          
          // 如果勾选了"记住我"，保存7天，否则仅保存会话期
          if (loginForm.value.remember) {
            localStorage.setItem('auth_remember', 'true');
          }
          
          // 重定向到首页或目标页面
          const redirectPath = route.query.redirect || '/';
          router.push(redirectPath);
          
          console.log('登录成功，已重定向到', redirectPath);
        } else {
          throw new Error('后端返回的数据格式不正确');
        }
      } catch (err) {
        console.error('登录失败:', err);
        
        // 根据错误类型提供有用的错误消息
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          error.value = '邮箱或密码错误';
        } else if (err.code === 'auth/too-many-requests') {
          error.value = '登录尝试次数过多，请稍后再试';
        } else if (err.code === 'auth/network-request-failed') {
          error.value = '网络连接失败，请检查您的网络';
        } else {
          error.value = '登录失败: ' + (err.message || '未知错误');
        }
      } finally {
        isLoading.value = false;
      }
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