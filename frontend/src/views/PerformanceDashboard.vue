<template>
  <div class="performance-dashboard container py-5">
    <h1 class="mb-4">性能监控仪表板</h1>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0">核心Web指标</h5>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>当前值</th>
                  <th>目标值</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(metric, index) in coreWebVitals" :key="index">
                  <td>{{ metric.name }}</td>
                  <td>{{ metric.value }}</td>
                  <td>{{ metric.target }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="metric.status === 'good' ? 'bg-success' : metric.status === 'needs-improvement' ? 'bg-warning' : 'bg-danger'"
                    >
                      {{ getStatusText(metric.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0">路由导航性能</h5>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>路由</th>
                  <th>加载时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(route, index) in routePerformance" :key="index">
                  <td>{{ route.name }}</td>
                  <td>{{ route.time }}ms</td>
                  <td>
                    <span 
                      class="badge"
                      :class="route.status === 'good' ? 'bg-success' : route.status === 'needs-improvement' ? 'bg-warning' : 'bg-danger'"
                    >
                      {{ getStatusText(route.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0">资源加载性能</h5>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>资源类型</th>
                  <th>数量</th>
                  <th>总大小</th>
                  <th>平均加载时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(resource, index) in resourcePerformance" :key="index">
                  <td>{{ resource.type }}</td>
                  <td>{{ resource.count }}</td>
                  <td>{{ formatSize(resource.size) }}</td>
                  <td>{{ resource.avgTime }}ms</td>
                  <td>
                    <span 
                      class="badge"
                      :class="resource.status === 'good' ? 'bg-success' : resource.status === 'needs-improvement' ? 'bg-warning' : 'bg-danger'"
                    >
                      {{ getStatusText(resource.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-primary" @click="runLighthouseTest">
        运行 Lighthouse 测试
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'PerformanceDashboard',
  setup() {
    // 核心Web指标数据
    const coreWebVitals = ref([
      { 
        name: 'LCP (最大内容绘制)', 
        value: '2.4s', 
        target: '< 2.5s', 
        status: 'good'
      },
      { 
        name: 'FID (首次输入延迟)', 
        value: '120ms', 
        target: '< 100ms', 
        status: 'needs-improvement'
      },
      { 
        name: 'CLS (累积布局偏移)', 
        value: '0.05', 
        target: '< 0.1', 
        status: 'good'
      },
      { 
        name: 'FCP (首次内容绘制)', 
        value: '1.2s', 
        target: '< 1.8s', 
        status: 'good'
      },
      { 
        name: 'TTFB (首字节时间)', 
        value: '210ms', 
        target: '< 200ms', 
        status: 'needs-improvement'
      }
    ])
    
    // 路由导航性能数据
    const routePerformance = ref([
      { 
        name: '首页 (Home)', 
        time: 320, 
        status: 'good'
      },
      { 
        name: '资源市场 (ResourceMarket)', 
        time: 580, 
        status: 'needs-improvement'
      },
      { 
        name: '登录页 (Login)', 
        time: 220, 
        status: 'good'
      },
      { 
        name: '个人中心 (UserProfile)', 
        time: 480, 
        status: 'good'
      },
      { 
        name: '我的收藏 (UserFavorites)', 
        time: 620, 
        status: 'needs-improvement'
      }
    ])
    
    // 资源加载性能数据
    const resourcePerformance = ref([
      { 
        type: 'JavaScript', 
        count: 12, 
        size: 845000, 
        avgTime: 240, 
        status: 'needs-improvement'
      },
      { 
        type: 'CSS', 
        count: 4, 
        size: 124000, 
        avgTime: 90, 
        status: 'good'
      },
      { 
        type: '图片', 
        count: 18, 
        size: 2450000, 
        avgTime: 350, 
        status: 'poor'
      },
      { 
        type: '字体', 
        count: 2, 
        size: 98000, 
        avgTime: 110, 
        status: 'good'
      },
      { 
        type: 'API请求', 
        count: 5, 
        size: 35000, 
        avgTime: 180, 
        status: 'good'
      }
    ])
    
    // 格式化文件大小
    const formatSize = (bytes) => {
      if (bytes < 1024) {
        return bytes + ' B'
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB'
      } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'good':
          return '良好'
        case 'needs-improvement':
          return '需改进'
        case 'poor':
          return '较差'
        default:
          return '未知'
      }
    }
    
    // 运行Lighthouse测试
    const runLighthouseTest = () => {
      alert('此功能需要在后端接口支持后实现。目前可以通过npm run perf:baseline命令在命令行中运行Lighthouse测试。')
    }
    
    // 页面加载时获取性能数据
    onMounted(() => {
      console.log('性能仪表板已加载')
      // 这里可以添加获取实际性能数据的逻辑
      // 例如从localStorage或API获取之前收集的性能数据
    })
    
    return {
      coreWebVitals,
      routePerformance,
      resourcePerformance,
      formatSize,
      getStatusText,
      runLighthouseTest
    }
  }
}
</script>

<style scoped>
.performance-dashboard {
  min-height: calc(100vh - 200px);
}

.card {
  margin-bottom: 1.5rem;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.table th {
  font-weight: 500;
  border-bottom-width: 1px;
}
</style> 