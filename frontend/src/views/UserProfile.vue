<template>
  <div class="user-profile container py-5">
    <div class="row">
      <!-- 侧边导航 -->
      <div class="col-md-3">
        <div class="card mb-4">
          <div class="card-body text-center">
            <div class="avatar mb-3">
              <img 
                :src="userAvatar" 
                alt="用户头像" 
                class="rounded-circle img-fluid" 
                style="width: 120px;"
              >
            </div>
            <h5 class="mb-1">{{ authStore.user?.username || '用户名' }}</h5>
            <p class="text-muted mb-3">{{ authStore.user?.email || '邮箱' }}</p>
          </div>
        </div>
        
        <div class="list-group">
          <button 
            v-for="(tab, index) in tabs" 
            :key="index"
            class="list-group-item list-group-item-action"
            :class="{ 'active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon" class="me-2"></i>
            {{ tab.name }}
          </button>
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="col-md-9">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0">{{ activeTabName }}</h5>
          </div>
          <div class="card-body">
            <!-- 个人信息 -->
            <div v-if="activeTab === 'info'">
              <form @submit.prevent="updateUserInfo">
                <div class="mb-3">
                  <label for="username" class="form-label">用户名</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="userForm.username" 
                    placeholder="请输入用户名"
                  >
                  <div v-if="userFormErrors.username" class="form-text text-danger">
                    {{ userFormErrors.username }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">电子邮箱</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="userForm.email" 
                    disabled
                  >
                  <div class="form-text">邮箱为账号主要凭证，无法修改</div>
                </div>
                
                <div class="mb-3">
                  <label for="avatar" class="form-label">头像</label>
                  <input 
                    type="file" 
                    class="form-control" 
                    id="avatar" 
                    @change="handleAvatarChange"
                    accept="image/*"
                  >
                </div>
                
                <button type="submit" class="btn btn-primary">
                  保存修改
                </button>
              </form>
            </div>
            
            <!-- 安全设置 -->
            <div v-if="activeTab === 'security'">
              <form @submit.prevent="updatePassword">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">当前密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="currentPassword" 
                    v-model="passwordForm.currentPassword"
                    placeholder="请输入当前密码"
                    required
                  >
                  <div v-if="passwordFormErrors.currentPassword" class="form-text text-danger">
                    {{ passwordFormErrors.currentPassword }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="newPassword" class="form-label">新密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword"
                    placeholder="请输入新密码"
                    required
                  >
                  <div v-if="passwordFormErrors.newPassword" class="form-text text-danger">
                    {{ passwordFormErrors.newPassword }}
                  </div>
                  <div class="form-text">密码长度至少6个字符</div>
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">确认新密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    v-model="passwordForm.confirmPassword"
                    placeholder="请再次输入新密码"
                    required
                  >
                  <div v-if="passwordFormErrors.confirmPassword" class="form-text text-danger">
                    {{ passwordFormErrors.confirmPassword }}
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary">
                  更新密码
                </button>
              </form>
            </div>
            
            <!-- 我的资源 -->
            <div v-if="activeTab === 'resources'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="text-muted">管理您上传的资源</p>
                <router-link to="/resources/upload" class="btn btn-primary btn-sm">
                  <i class="bi bi-plus-lg me-2"></i>上传新资源
                </router-link>
              </div>
              
              <router-link to="/resources/my" class="btn btn-outline-primary d-block">
                <i class="bi bi-grid me-2"></i>查看我的全部资源
              </router-link>
            </div>
            
            <!-- 收藏夹 -->
            <div v-if="activeTab === 'favorites'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="text-muted">管理您收藏的资源</p>
              </div>
              
              <router-link to="/resources/favorites" class="btn btn-outline-primary d-block">
                <i class="bi bi-bookmark-heart me-2"></i>查看我的收藏夹
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { 
  isValidUsername, 
  isValidPassword, 
  isPasswordMatch, 
  validateForm 
} from '@/utils/formValidator'

export default {
  name: 'UserProfileView',
  setup() {
    const authStore = useAuthStore()
    const activeTab = ref('info')
    
    // 默认头像
    const defaultAvatar = 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
    const userAvatar = ref(authStore.user?.avatar || defaultAvatar)
    
    // 导航选项卡
    const tabs = [
      { id: 'info', name: '个人信息', icon: 'bi bi-person' },
      { id: 'security', name: '安全设置', icon: 'bi bi-shield-lock' },
      { id: 'resources', name: '我的资源', icon: 'bi bi-file-earmark' },
      { id: 'favorites', name: '收藏夹', icon: 'bi bi-bookmark-heart' },
    ]
    
    // 当前选中选项卡名称
    const activeTabName = computed(() => {
      const tab = tabs.find(t => t.id === activeTab.value)
      return tab ? tab.name : ''
    })
    
    // 用户信息表单
    const userForm = reactive({
      username: authStore.user?.username || '',
      email: authStore.user?.email || '',
      avatar: null
    })
    
    // 用户信息表单错误
    const userFormErrors = reactive({
      username: '',
      email: ''
    })
    
    // 密码表单
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 密码表单错误
    const passwordFormErrors = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 验证用户信息表单
    const validateUserForm = () => {
      // 定义验证规则
      const rules = {
        username: [
          { required: true, message: '用户名不能为空' },
          { validator: (value) => isValidUsername(value, 3), message: '用户名至少需要3个字符' }
        ]
      }
      
      // 重置错误信息
      Object.keys(userFormErrors).forEach(key => {
        userFormErrors[key] = ''
      })
      
      // 验证表单
      const { isValid, errors } = validateForm(userForm, rules)
      
      // 设置错误信息
      if (!isValid) {
        Object.entries(errors).forEach(([field, message]) => {
          userFormErrors[field] = message
        })
      }
      
      return isValid
    }
    
    // 验证密码表单
    const validatePasswordForm = () => {
      // 定义验证规则
      const rules = {
        currentPassword: [
          { required: true, message: '当前密码不能为空' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空' },
          { validator: (value) => isValidPassword(value, { minLength: 6 }), message: '密码至少需要6个字符' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码' },
          { validator: (value) => isPasswordMatch(passwordForm.newPassword, value), message: '两次输入的密码不一致' }
        ]
      }
      
      // 重置错误信息
      Object.keys(passwordFormErrors).forEach(key => {
        passwordFormErrors[key] = ''
      })
      
      // 验证表单
      const { isValid, errors } = validateForm(passwordForm, rules)
      
      // 设置错误信息
      if (!isValid) {
        Object.entries(errors).forEach(([field, message]) => {
          passwordFormErrors[field] = message
        })
      }
      
      return isValid
    }
    
    // 处理头像上传
    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        // 预览头像
        const reader = new FileReader()
        reader.onload = (e) => {
          userAvatar.value = e.target.result
        }
        reader.readAsDataURL(file)
        
        // 保存头像文件引用
        userForm.avatar = file
      }
    }
    
    // 更新用户信息
    const updateUserInfo = async () => {
      if (!validateUserForm()) {
        return
      }
      
      try {
        // TODO: 实现头像上传和用户信息更新API
        alert('用户信息更新功能将在下一版本实现')
      } catch (error) {
        console.error('更新用户信息失败:', error)
      }
    }
    
    // 更新密码
    const updatePassword = async () => {
      if (!validatePasswordForm()) {
        return
      }
      
      try {
        // TODO: 实现密码更新API
        alert('密码更新功能将在下一版本实现')
        
        // 清空表单
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        console.error('更新密码失败:', error)
      }
    }
    
    // 获取最新用户信息
    onMounted(async () => {
      if (authStore.isLoggedIn) {
        await authStore.fetchCurrentUser()
        
        // 更新表单数据
        userForm.username = authStore.user?.username || ''
        userForm.email = authStore.user?.email || ''
        userAvatar.value = authStore.user?.avatar || defaultAvatar
      }
    })
    
    return {
      authStore,
      activeTab,
      tabs,
      activeTabName,
      userForm,
      userFormErrors,
      passwordForm,
      passwordFormErrors,
      userAvatar,
      handleAvatarChange,
      updateUserInfo,
      updatePassword
    }
  }
}
</script>

<style scoped>
.user-profile {
  min-height: calc(100vh - 200px);
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.avatar img {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style> 