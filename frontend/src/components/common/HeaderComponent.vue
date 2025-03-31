<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <img src="@/assets/logo.png" alt="Et 资源小站" height="40" v-if="false">
          <span class="fw-bold text-primary">Et 资源小站</span>
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" active-class="active">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/resource-market" active-class="active">资源市场</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/news" active-class="active">新闻资讯</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/contact" active-class="active">联系我们</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent'
}
</script>

<style scoped>
.navbar {
  padding: 0.75rem 1rem;
}

.nav-link {
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0.5rem;
  transition: color 0.3s ease;
}

.nav-link:hover, .nav-link.active {
  color: var(--primary-color);
}
</style> 