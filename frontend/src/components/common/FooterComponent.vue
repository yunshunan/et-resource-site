<template>
  <footer class="bg-dark text-white py-4 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5 class="mb-3">Et 资源小站</h5>
          <p>Et 资源小站是一个专注于提供高质量资源的平台，致力于为用户提供便捷的资源获取体验。</p>
        </div>
        <div class="col-md-2">
          <h5 class="mb-3">快速链接</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-white text-decoration-none">首页</router-link></li>
            <li><router-link to="/resource-market" class="text-white text-decoration-none">资源市场</router-link></li>
            <li><router-link to="/news" class="text-white text-decoration-none">新闻资讯</router-link></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">关于我们</h5>
          <ul class="list-unstyled">
            <li><router-link to="/about-us" class="text-white text-decoration-none">关于我们</router-link></li>
            <li><router-link to="/business-cooperation" class="text-white text-decoration-none">商务合作</router-link></li>
            <li><router-link to="/contact" class="text-white text-decoration-none">联系我们</router-link></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">联系方式</h5>
          <p>
            <i class="bi bi-envelope"></i> Email: contact@zyxz123.com<br>
            <i class="bi bi-telephone"></i> 电话: 400-123-4567<br>
            <i class="bi bi-geo-alt"></i> 地址: 北京市朝阳区
          </p>
        </div>
      </div>
      <hr>
      <div class="text-center">
        <p class="mb-0">&copy; 2025 Et 资源小站. 保留所有权利.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
footer a {
  transition: opacity 0.3s;
}

footer a:hover {
  opacity: 0.8;
}

footer li {
  margin-bottom: 0.5rem;
}
</style> 