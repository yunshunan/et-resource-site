<template>
  <div class="about-us">
    <div class="container py-5">
      <h1 class="text-center mb-5">关于我们</h1>
      
      <!-- 公司简介 -->
      <section class="mb-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 class="mb-4">公司简介</h2>
            <p>ET资源小站成立于2022年，是一家专注于为用户提供优质资源分享和内容服务的互联网平台。我们致力于打造一个开放、共享、高效的资源交流社区，让每一位用户都能便捷地获取和分享有价值的信息与资源。</p>
            <p>经过多年的发展，我们已经聚集了超过10万名活跃用户和100万+优质资源，涵盖教育、设计、办公、技术等多个领域，为用户的学习和工作提供有力支持。</p>
          </div>
        </div>
      </section>
      
      <!-- 我们的使命 -->
      <section class="mb-5">
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-body p-4">
                <h3 class="mb-3">我们的使命</h3>
                <p>让知识和资源的流动更加自由，为每个人提供平等获取优质内容的机会。</p>
                <ul class="list-group list-group-flush mt-3">
                  <li class="list-group-item bg-transparent">促进知识分享与交流</li>
                  <li class="list-group-item bg-transparent">提高资源获取效率</li>
                  <li class="list-group-item bg-transparent">保障内容质量与安全</li>
                  <li class="list-group-item bg-transparent">尊重知识产权与创作者</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-body p-4">
                <h3 class="mb-3">我们的愿景</h3>
                <p>成为全球领先的资源分享平台，连接人与知识，创造更大的社会价值。</p>
                <div class="d-flex align-items-center mt-4">
                  <div class="text-center me-3">
                    <i class="bi bi-people-fill fs-1 text-primary"></i>
                    <p class="fw-bold mt-2">10万+</p>
                    <p class="text-muted">活跃用户</p>
                  </div>
                  <div class="text-center mx-3">
                    <i class="bi bi-file-earmark-fill fs-1 text-primary"></i>
                    <p class="fw-bold mt-2">100万+</p>
                    <p class="text-muted">优质资源</p>
                  </div>
                  <div class="text-center ms-3">
                    <i class="bi bi-globe fs-1 text-primary"></i>
                    <p class="fw-bold mt-2">50+</p>
                    <p class="text-muted">覆盖国家</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 团队介绍 -->
      <section>
        <h2 class="text-center mb-4">我们的团队</h2>
        <div class="row">
          <div class="col-md-4 mb-4" v-for="member in teamMembers" :key="member.id">
            <div class="card shadow-sm h-100">
              <img :src="member.avatar" class="card-img-top team-avatar" :alt="member.name">
              <div class="card-body text-center">
                <h5 class="card-title">{{ member.name }}</h5>
                <p class="text-muted">{{ member.position }}</p>
                <p class="card-text">{{ member.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutUsPage',
  data() {
    return {
      teamMembers: [
        {
          id: 1,
          name: '张云海',
          position: '创始人 & CEO',
          description: '拥有10年互联网行业经验，曾就职于多家知名科技公司，擅长产品战略和团队管理。',
          avatar: 'https://via.placeholder.com/300x300/3498db/ffffff?text=张云海'
        },
        {
          id: 2,
          name: '李明',
          position: '技术负责人',
          description: '全栈开发专家，热爱开源，在架构设计和性能优化方面有丰富经验。',
          avatar: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=李明'
        },
        {
          id: 3,
          name: '王琳',
          position: '产品经理',
          description: '专注用户体验设计，善于发现用户需求，将复杂问题简单化。',
          avatar: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=王琳'
        }
      ]
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
  overflow: hidden;
}

.team-avatar {
  height: 200px;
  object-fit: cover;
}
</style> 