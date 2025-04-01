<template>
  <div class="contact">
    <div class="container py-5">
      <h1 class="text-center mb-5">联系我们</h1>
      
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h4><i class="bi bi-geo-alt-fill text-primary me-2"></i>公司地址</h4>
              <p class="mt-3">上海市浦东新区张江高科技园区博云路2号浦软大厦8楼</p>
              
              <h4 class="mt-4"><i class="bi bi-telephone-fill text-primary me-2"></i>联系电话</h4>
              <p class="mt-3">客服热线: 400-888-8888<br>业务合作: 021-6666-8888</p>
              
              <h4 class="mt-4"><i class="bi bi-envelope-fill text-primary me-2"></i>电子邮箱</h4>
              <p class="mt-3">客户服务: support@et-resource.com<br>商务合作: business@et-resource.com</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h4 class="mb-4">给我们留言</h4>
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label for="name" class="form-label">您的姓名</label>
                  <input type="text" class="form-control" id="name" v-model="form.name" required>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">电子邮箱</label>
                  <input type="email" class="form-control" id="email" v-model="form.email" required>
                </div>
                
                <div class="mb-3">
                  <label for="subject" class="form-label">主题</label>
                  <input type="text" class="form-control" id="subject" v-model="form.subject" required>
                </div>
                
                <div class="mb-3">
                  <label for="message" class="form-label">留言内容</label>
                  <textarea class="form-control" id="message" rows="5" v-model="form.message" required></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary w-100" :disabled="submitting">
                  <span v-if="submitting">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    提交中...
                  </span>
                  <span v-else>提交留言</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
  data() {
    return {
      submitting: false,
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
    }
  },
  methods: {
    submitForm() {
      this.submitting = true;
      
      // 模拟API请求
      setTimeout(() => {
        alert('感谢您的留言，我们会尽快回复！');
        this.resetForm();
        this.submitting = false;
      }, 1500);
    },
    
    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}
</style> 