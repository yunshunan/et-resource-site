<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <img src="../assets/logo.png" alt="ET Resource Logo" class="logo" />
        <h1>ET资源网</h1>
      </div>
      
      <div class="form-section">
        <h2>用户注册</h2>
        
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="email">电子邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            placeholder="请输入电子邮箱"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            placeholder="请输入密码"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword" 
            placeholder="请再次输入密码"
          />
        </div>
        
        <div class="agreement">
          <label class="checkbox-label">
            <input type="checkbox" v-model="registerForm.agreement" />
            <span>我已阅读并同意 <a href="#" @click.prevent="showTerms">用户协议</a> 和 <a href="#" @click.prevent="showPrivacy">隐私政策</a></span>
          </label>
        </div>
        
        <button 
          @click="handleRegister" 
          class="register-button"
          :disabled="isLoading || !registerForm.agreement"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <div class="login-link">
          已有账号? <router-link to="/login">立即登录</router-link>
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
import { useRouter } from 'vue-router';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

export default {
  name: 'RegisterView',
  setup() {
    const registerForm = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreement: false
    });
    const isLoading = ref(false);
    const error = ref(null);
    const router = useRouter();
    const authStore = useAuthStore();

    const validateEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    const showTerms = () => {
      alert('用户协议将在这里显示');
    };

    const showPrivacy = () => {
      alert('隐私政策将在这里显示');
    };

    const handleRegister = async () => {
      // 验证表单
      if (!registerForm.value.username || !registerForm.value.email || 
          !registerForm.value.password || !registerForm.value.confirmPassword) {
        error.value = '请填写所有必填字段';
        return;
      }
      
      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        error.value = '两次输入的密码不一致';
        return;
      }
      
      if (!validateEmail(registerForm.value.email)) {
        error.value = '请输入有效的电子邮箱地址';
        return;
      }
      
      if (!registerForm.value.agreement) {
        error.value = '请阅读并同意用户协议和隐私政策';
        return;
      }
      
      isLoading.value = true;
      error.value = null;
      
      try {
        // 1. 使用Firebase创建用户
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          registerForm.value.email,
          registerForm.value.password
        );
        
        console.log('Firebase注册成功:', userCredential.user.email);
        
        // 2. 获取Firebase ID令牌
        const idToken = await userCredential.user.getIdToken();
        
        // 3. 发送ID令牌和用户信息到后端
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/register`, 
          {
            idToken,
            username: registerForm.value.username
          }
        );
        
        if (response.data && response.data.token) {
          // 使用Pinia存储认证信息
          authStore.login({
            token: response.data.token,
            user: response.data.user
          });
          
          // 注册成功，重定向到首页
          router.push('/');
          console.log('注册成功，已重定向到首页');
        } else {
          // 后端注册成功但没有返回令牌，重定向到登录页
          router.push({
            path: '/login',
            query: { registered: 'success' }
          });
        }
      } catch (err) {
        console.error('注册失败:', err);
        
        // 根据错误类型提供有用的错误消息
        if (err.code === 'auth/email-already-in-use') {
          error.value = '该邮箱已被注册';
        } else if (err.code === 'auth/weak-password') {
          error.value = '密码强度不足，请使用至少6个字符';
        } else if (err.code === 'auth/invalid-email') {
          error.value = '邮箱格式无效';
        } else if (err.code === 'auth/network-request-failed') {
          error.value = '网络连接失败，请检查您的网络';
        } else {
          error.value = '注册失败: ' + (err.message || '未知错误');
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      registerForm,
      isLoading,
      error,
      handleRegister,
      showTerms,
      showPrivacy
    };
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.register-card {
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

.agreement {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 10px;
  margin-top: 3px;
}

.checkbox-label a {
  color: #3498db;
  text-decoration: none;
}

.register-button {
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

.register-button:hover {
  background-color: #2980b9;
}

.register-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.login-link a {
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