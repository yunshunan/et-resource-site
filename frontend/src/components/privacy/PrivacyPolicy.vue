<template>
  <div class="privacy-policy">
    <h2>隐私政策</h2>
    <p class="last-updated">最后更新：{{ lastUpdated }}</p>

    <div class="policy-section">
      <h3>1. 信息收集</h3>
      <p>我们收集以下类型的信息：</p>
      <ul>
        <li>基本信息：用户名、邮箱地址等</li>
        <li>使用数据：浏览历史、搜索记录等</li>
        <li>性能数据：页面加载时间、错误日志等</li>
        <li>设备信息：浏览器类型、操作系统等</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>2. 信息使用</h3>
      <p>我们使用收集的信息用于：</p>
      <ul>
        <li>提供和改进服务</li>
        <li>个性化用户体验</li>
        <li>分析和优化性能</li>
        <li>发送服务通知</li>
        <li>防止欺诈和滥用</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>3. 信息共享</h3>
      <p>我们不会出售您的个人信息。仅在以下情况下共享信息：</p>
      <ul>
        <li>获得您的明确同意</li>
        <li>遵守法律法规要求</li>
        <li>保护我们的合法权益</li>
        <li>与授权合作伙伴共享必要信息</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>4. 数据安全</h3>
      <p>我们采取多种安全措施保护您的信息：</p>
      <ul>
        <li>数据加密存储和传输</li>
        <li>访问控制和权限管理</li>
        <li>定期安全审计</li>
        <li>员工安全培训</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>5. 数据保留</h3>
      <p>我们保留数据的时间：</p>
      <ul>
        <li>分析数据：30天</li>
        <li>错误日志：7天</li>
        <li>性能数据：90天</li>
        <li>用户行为数据：30天</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>6. 您的权利</h3>
      <p>您对个人信息拥有以下权利：</p>
      <ul>
        <li>访问和查看个人信息</li>
        <li>更正或更新个人信息</li>
        <li>删除个人信息</li>
        <li>导出个人信息</li>
        <li>撤回同意</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>7. Cookie使用</h3>
      <p>我们使用Cookie和类似技术：</p>
      <ul>
        <li>保持登录状态</li>
        <li>记住用户偏好</li>
        <li>分析网站使用情况</li>
        <li>提供个性化体验</li>
      </ul>
      <p>您可以通过浏览器设置管理Cookie。</p>
    </div>

    <div class="policy-section">
      <h3>8. 第三方服务</h3>
      <p>我们使用以下第三方服务：</p>
      <ul>
        <li>分析服务：Google Analytics</li>
        <li>支付服务：Stripe</li>
        <li>存储服务：AWS</li>
        <li>CDN服务：Cloudflare</li>
      </ul>
      <p>这些服务可能收集和处理您的信息。</p>
    </div>

    <div class="policy-section">
      <h3>9. 儿童隐私</h3>
      <p>我们的服务不面向13岁以下儿童。如果发现误收集了儿童信息，我们会尽快删除。</p>
    </div>

    <div class="policy-section">
      <h3>10. 政策更新</h3>
      <p>我们可能不时更新本隐私政策。更新后，我们会：</p>
      <ul>
        <li>在网站上发布更新通知</li>
        <li>通过邮件通知重要变更</li>
        <li>更新"最后更新"日期</li>
      </ul>
    </div>

    <div class="policy-section">
      <h3>11. 联系我们</h3>
      <p>如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
      <ul>
        <li>邮箱：privacy@example.com</li>
        <li>电话：+1 (555) 123-4567</li>
        <li>地址：123 Privacy Street, Security City, 12345</li>
      </ul>
    </div>

    <div class="policy-actions">
      <el-button type="primary" @click="acceptPolicy">接受隐私政策</el-button>
      <el-button @click="declinePolicy">拒绝</el-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { privacyService } from '@/services/privacy'

export default {
  name: 'PrivacyPolicy',
  
  setup() {
    const lastUpdated = ref('2024-03-20')

    const acceptPolicy = () => {
      const consent = privacyService.getUserConsent()
      consent.privacyPolicyAccepted = true
      consent.privacyPolicyVersion = '1.0'
      consent.privacyPolicyAcceptedDate = new Date().toISOString()
      
      if (privacyService.updateUserConsent(consent)) {
        ElMessage.success('已接受隐私政策')
      } else {
        ElMessage.error('更新失败，请重试')
      }
    }

    const declinePolicy = () => {
      ElMessage.warning('您需要接受隐私政策才能使用我们的服务')
    }

    return {
      lastUpdated,
      acceptPolicy,
      declinePolicy
    }
  }
}
</script>

<style scoped>
.privacy-policy {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.last-updated {
  color: #909399;
  font-size: 14px;
  margin-bottom: 30px;
}

.policy-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.policy-section h3 {
  color: #303133;
  margin-bottom: 15px;
}

.policy-section p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.policy-section ul {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 10px;
}

.policy-section li {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 5px;
}

.policy-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}
</style> 