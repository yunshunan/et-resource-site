<template>
  <div class="auth-form">
    <h2 class="text-center mb-4">{{ isLoginMode ? '登录' : '注册' }}</h2>
    
    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>
    
    <form @submit.prevent="handleSubmit">
      <!-- 邮箱 -->
      <div class="mb-3">
        <label for="email" class="form-label">邮箱</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          class="form-control" 
          :class="{ 'is-invalid': emailError }"
          placeholder="请输入邮箱"
          required
        >
        <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
      </div>
      
      <!-- 密码 -->
      <div class="mb-3">
        <label for="password" class="form-label">密码</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="form-control" 
          :class="{ 'is-invalid': passwordError }"
          placeholder="请输入密码"
          required
          minlength="6"
        >
        <div v-if="passwordError" class="invalid-feedback">{{ passwordError }}</div>
        <div class="form-text" v-if="!isLoginMode">密码长度至少6个字符</div>
      </div>
      
      <!-- 密码强度指示器（注册模式） -->
      <div v-if="!isLoginMode && password" class="mb-3">
        <div class="password-strength">
          <div class="strength-text">密码强度：{{ passwordStrengthText }}</div>
          <div class="strength-meter">
            <div 
              class="strength-value" 
              :style="{ width: passwordStrength + '%', backgroundColor: passwordStrengthColor }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 提交按钮 -->
      <div class="mb-3">
        <button 
          type="submit" 
          class="btn btn-primary w-100" 
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoginMode ? '登录' : '注册' }}
        </button>
      </div>
      
      <!-- 模式切换 -->
      <div class="text-center">
        <a href="#" @click.prevent="toggleMode">
          {{ isLoginMode ? '还没有账号？去注册' : '已有账号？去登录' }}
        </a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

// Props
const props = defineProps({
  // 默认模式：true = 登录，false = 注册
  initialMode: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['success', 'error']);

// 状态
const email = ref('');
const password = ref('');
const isLoginMode = ref(props.initialMode);
const error = ref('');
const emailError = ref('');
const passwordError = ref('');

// 获取Auth存储
const authStore = useAuthStore();
const loading = computed(() => authStore.loading);

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  clearErrors();
};

// 清除错误信息
const clearErrors = () => {
  error.value = '';
  emailError.value = '';
  passwordError.value = '';
};

// 验证表单
const validateForm = () => {
  let isValid = true;
  clearErrors();
  
  // 邮箱验证
  if (!email.value) {
    emailError.value = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '请输入有效的邮箱';
    isValid = false;
  }
  
  // 密码验证
  if (!password.value) {
    passwordError.value = '请输入密码';
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.value = '密码长度至少6个字符';
    isValid = false;
  }
  
  return isValid;
};

// 表单是否有效
const isFormValid = computed(() => {
  if (!email.value || !password.value) return false;
  if (password.value.length < 6) return false;
  return true;
});

// 密码强度计算
const passwordStrength = computed(() => {
  if (!password.value) return 0;
  
  let strength = 0;
  
  // 长度检查
  if (password.value.length >= 6) strength += 20;
  if (password.value.length >= 10) strength += 10;
  
  // 字符类型检查
  if (/[A-Z]/.test(password.value)) strength += 20; // 大写字母
  if (/[a-z]/.test(password.value)) strength += 20; // 小写字母
  if (/[0-9]/.test(password.value)) strength += 20; // 数字
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 20; // 特殊字符
  
  return Math.min(strength, 100);
});

// 密码强度文本
const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  
  if (strength < 40) return '弱';
  if (strength < 70) return '中';
  return '强';
});

// 密码强度颜色
const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value;
  
  if (strength < 40) return '#dc3545'; // 弱 - 红色
  if (strength < 70) return '#ffc107'; // 中 - 黄色
  return '#28a745'; // 强 - 绿色
});

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    let success = false;
    
    if (isLoginMode.value) {
      // 登录操作
      success = await authStore.login(email.value, password.value);
    } else {
      // 注册操作
      success = await authStore.register(email.value, password.value);
    }
    
    if (success) {
      emit('success', { mode: isLoginMode.value ? 'login' : 'register' });
    } else {
      error.value = authStore.error || `${isLoginMode.value ? '登录' : '注册'}失败，请稍后重试`;
      emit('error', error.value);
    }
  } catch (err) {
    error.value = err.message || `${isLoginMode.value ? '登录' : '注册'}过程中出现错误`;
    emit('error', error.value);
  }
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.password-strength {
  margin-top: 5px;
}

.strength-text {
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.strength-meter {
  height: 5px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.strength-value {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}
</style> 