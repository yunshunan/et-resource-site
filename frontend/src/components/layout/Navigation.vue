<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <span class="fw-bold text-primary">Et 资源小站</span>
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarMain">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" exact-active-class="active-nav-link">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/resource-market" active-class="active-nav-link">资源市场</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/news" active-class="active-nav-link">新闻资讯</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/contact" active-class="active-nav-link">联系我们</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about-us" active-class="active-nav-link">关于我们</router-link>
          </li>
        </ul>
        
        <!-- 搜索框 -->
        <form class="d-flex me-2" @submit.prevent="handleSearch">
          <div class="input-group">
            <input 
              class="form-control form-control-sm search-input" 
              type="search" 
              placeholder="搜索资源..." 
              aria-label="Search"
              v-model="searchQuery"
            >
            <button class="btn btn-sm btn-outline-primary" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>
        
        <div class="d-flex align-items-center">
          <template v-if="isLoggedIn">
            <div class="dropdown">
              <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i>
                {{ userName }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><router-link class="dropdown-item" to="/profile"><i class="bi bi-person me-2"></i>个人中心</router-link></li>
                <li><router-link class="dropdown-item" to="/user-resources"><i class="bi bi-file-earmark me-2"></i>我的资源</router-link></li>
                <li><router-link class="dropdown-item" to="/user-favorites"><i class="bi bi-heart me-2"></i>我的收藏</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>退出登录</a></li>
              </ul>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-outline-primary me-2 login-btn">登录</router-link>
            <router-link to="/register" class="btn btn-primary register-btn">注册</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
  <div style="height: 72px;"></div> <!-- 占位元素，防止内容被固定导航栏遮挡 -->
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Navigation',
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    ...mapState(useAuthStore, ['isLoggedIn', 'currentUser']),
    userName() {
      return this.currentUser?.username || this.currentUser?.email || '用户';
    }
  },
  methods: {
    ...mapActions(useAuthStore, { storeLogout: 'logout' }),
    async handleLogout() {
      await this.storeLogout();
      if (this.$route.path !== '/') {
          this.$router.push('/');
      }
    },
    initDropdowns() {
      if (window.bootstrap && window.bootstrap.Dropdown) {
        document.querySelectorAll('.dropdown-toggle').forEach(dropdownToggle => {
          new window.bootstrap.Dropdown(dropdownToggle);
        });
      }
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/resource-market',
          query: { search: this.searchQuery }
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initDropdowns();
    });
  },
  updated() {
    this.$nextTick(() => {
      this.initDropdowns();
    });
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.75rem 1rem;
  z-index: 1030;
}

.nav-link {
  color: var(--bs-dark);
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: var(--bs-primary);
}

/* 增强的当前页面高亮样式 */
.active-nav-link {
  color: var(--bs-primary) !important;
  font-weight: 700;
}

.active-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0.5rem;
  right: 0.5rem;
  height: 3px;
  background-color: var(--bs-primary);
  border-radius: 3px 3px 0 0;
}

.navbar-brand {
  font-size: 1.5rem;
}

/* 搜索框样式 */
.search-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  width: 200px;
}

.search-input:focus {
  box-shadow: none;
  border-color: var(--bs-primary);
}

.btn-outline-primary {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* 添加移动端导航样式 */
@media (max-width: 991.98px) {
  .navbar-collapse {
    padding: 1rem 0;
  }
  
  .nav-item {
    margin-bottom: 0.5rem;
  }

  .search-input, .search-input:focus {
    width: 100%;
  }
  
  .d-flex.align-items-center {
    margin-top: 1rem;
    justify-content: center;
    width: 100%;
  }
}

/* 登录注册按钮样式优化 */
.login-btn, .register-btn {
  padding: 0.375rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn {
  border: 1px solid var(--bs-primary);
}

.login-btn:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

.register-btn {
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}
</style> 