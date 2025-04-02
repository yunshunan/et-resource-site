<template>
  <div class="container py-5 text-center">
    <div class="row">
      <div class="col-md-12">
        <h1 class="display-1">404</h1>
        <h2 class="mb-4">页面未找到</h2>
        <p class="lead mb-5">您访问的页面不存在或已被移除</p>
        <router-link to="/" class="btn btn-primary btn-lg">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.display-1 {
  font-size: 8rem;
  color: #0d6efd;
}
</style>
