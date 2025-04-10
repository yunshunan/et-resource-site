<template>
  <div class="test-container">
    <h1>LeanCloud 功能测试</h1>
    
    <div class="card">
      <h2>用户测试</h2>
      <div class="form-group">
        <label>用户名:</label>
        <input type="text" v-model="username" placeholder="请输入用户名" />
      </div>
      <div class="form-group">
        <label>邮箱:</label>
        <input type="email" v-model="email" placeholder="请输入邮箱" />
      </div>
      <div class="form-group">
        <label>密码:</label>
        <input type="password" v-model="password" placeholder="请输入密码" />
      </div>
      <div class="buttons">
        <button @click="register" :disabled="loading">注册</button>
        <button @click="login" :disabled="loading">登录</button>
        <button @click="logout" :disabled="loading || !isLoggedIn">登出</button>
      </div>
    </div>
    
    <div class="card">
      <h2>数据模型测试</h2>
      <div class="buttons">
        <button @click="setupResource" :disabled="loading || !isLoggedIn">创建资源</button>
        <button @click="setupComment" :disabled="loading || !isLoggedIn">创建评论</button>
        <button @click="setupCategory" :disabled="loading || !isLoggedIn">创建分类</button>
        <button @click="setupNews" :disabled="loading || !isLoggedIn">创建新闻</button>
        <button @click="setupAllModels" :disabled="loading || !isLoggedIn">创建所有模型</button>
      </div>
    </div>
    
    <div class="card">
      <h2>查询测试</h2>
      <div class="buttons">
        <button @click="fetchResources" :disabled="loading">查询资源</button>
        <button @click="fetchCategories" :disabled="loading">查询分类</button>
        <button @click="fetchNews" :disabled="loading">查询新闻</button>
      </div>
    </div>
    
    <div class="card result">
      <h2>当前用户</h2>
      <pre v-if="currentUser">{{ JSON.stringify(currentUser, null, 2) }}</pre>
      <p v-else>未登录</p>
    </div>
    
    <div class="card result">
      <h2>测试结果</h2>
      <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      <p v-else>尚未执行操作</p>
    </div>
    
    <div class="card result" v-if="error">
      <h2>错误信息</h2>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
import AV from '@/config/leancloud';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import lcTest from '@/tests/leancloud-test';

export default {
  name: 'TestLeanCloud',
  
  setup() {
    const router = useRouter();
    const username = ref('testuser');
    const email = ref('test@example.com');
    const password = ref('test123456');
    const loading = ref(false);
    const result = ref(null);
    const error = ref(null);
    const currentUser = ref(null);
    
    const isLoggedIn = computed(() => {
      return !!currentUser.value;
    });
    
    // 更新当前用户信息
    const updateCurrentUser = () => {
      const user = AV.User.current();
      if (user) {
        currentUser.value = {
          id: user.id,
          username: user.get('username'),
          email: user.get('email'),
          sessionToken: user.getSessionToken(),
          createdAt: user.createdAt
        };
      } else {
        currentUser.value = null;
      }
    };
    
    // 注册
    const register = async () => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        await lcTest.testUserRegistration(email.value, password.value, username.value);
        await login();
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 登录
    const login = async () => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        const user = await AV.User.logIn(username.value, password.value);
        result.value = {
          action: '登录成功',
          user: {
            id: user.id,
            username: user.get('username'),
            email: user.get('email')
          }
        };
        updateCurrentUser();
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 登出
    const logout = async () => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        await AV.User.logOut();
        result.value = { action: '登出成功' };
        updateCurrentUser();
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 创建数据类
    const createDataClass = async (className, data) => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        const TestObject = AV.Object.extend(className);
        const testObject = new TestObject();
        for (const [key, value] of Object.entries(data)) {
          testObject.set(key, value);
        }
        await testObject.save();
        result.value = {
          action: `创建${className}成功`,
          object: {
            id: testObject.id,
            ...data
          }
        };
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 创建资源
    const setupResource = async () => {
      await createDataClass('Resource', {
        title: '示例资源 ' + new Date().toISOString(),
        description: '这是一个示例资源描述',
        price: Math.floor(Math.random() * 100),
        category: '示例分类',
        tags: ['示例', '测试'],
        fileUrl: 'https://example.com/sample.zip',
        thumbnailUrl: 'https://example.com/sample.jpg',
        author: AV.User.current() ? AV.User.current().id : 'system',
        downloads: 0,
        views: 0,
        rating: 5,
        isActive: true,
        isFeatured: false
      });
    };
    
    // 创建评论
    const setupComment = async () => {
      await createDataClass('Comment', {
        content: '这是一个示例评论 ' + new Date().toISOString(),
        resourceId: 'sample-resource-id',
        author: AV.User.current() ? AV.User.current().id : 'system',
        rating: Math.floor(Math.random() * 5) + 1
      });
    };
    
    // 创建分类
    const setupCategory = async () => {
      await createDataClass('Category', {
        name: '示例分类 ' + new Date().toISOString(),
        description: '这是一个示例分类',
        icon: 'sample-icon',
        order: Math.floor(Math.random() * 10),
        isActive: true
      });
    };
    
    // 创建新闻
    const setupNews = async () => {
      await createDataClass('News', {
        title: '示例新闻 ' + new Date().toISOString(),
        content: '这是一个示例新闻内容',
        author: AV.User.current() ? AV.User.current().id : 'system',
        tags: ['新闻', '公告'],
        thumbnailUrl: 'https://example.com/news.jpg',
        isPublished: true
      });
    };
    
    // 创建所有模型
    const setupAllModels = async () => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        await lcTest.setupDataModels();
        result.value = { action: '所有数据模型创建成功' };
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 查询数据
    const fetchData = async (className) => {
      loading.value = true;
      error.value = null;
      result.value = null;
      
      try {
        const query = new AV.Query(className);
        query.limit(10);
        query.descending('createdAt');
        const results = await query.find();
        
        result.value = {
          action: `查询${className}成功`,
          count: results.length,
          items: results.map(item => {
            const obj = { id: item.id };
            // 获取所有字段
            item.attributes && Object.keys(item.attributes).forEach(key => {
              obj[key] = item.get(key);
            });
            return obj;
          })
        };
      } catch (err) {
        error.value = err.message || String(err);
      } finally {
        loading.value = false;
      }
    };
    
    // 查询资源
    const fetchResources = () => fetchData('Resource');
    
    // 查询分类
    const fetchCategories = () => fetchData('Category');
    
    // 查询新闻
    const fetchNews = () => fetchData('News');
    
    // 组件挂载时更新用户信息
    onMounted(() => {
      updateCurrentUser();
    });
    
    return {
      username,
      email,
      password,
      loading,
      result,
      error,
      currentUser,
      isLoggedIn,
      register,
      login,
      logout,
      setupResource,
      setupComment,
      setupCategory,
      setupNews,
      setupAllModels,
      fetchResources,
      fetchCategories,
      fetchNews
    };
  }
};
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #3a5be7;
}

button:disabled {
  background: #b4b4b4;
  cursor: not-allowed;
}

.result {
  max-height: 400px;
  overflow: auto;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 