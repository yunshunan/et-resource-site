<template>
  <el-menu
    :default-active="activeMenu"
    class="navigation-menu"
    mode="horizontal"
    router
  >
    <el-sub-menu index="privacy">
      <template #title>
        <el-icon><Lock /></el-icon>
        <span>隐私</span>
      </template>
      <el-menu-item index="/privacy/policy">
        <el-icon><Document /></el-icon>
        <span>隐私政策</span>
      </el-menu-item>
      <el-menu-item index="/privacy/settings">
        <el-icon><Setting /></el-icon>
        <span>隐私设置</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Lock, Document, Setting } from '@element-plus/icons-vue'

export default {
  name: 'Navigation',
  
  components: {
    Lock,
    Document,
    Setting
  },
  
  setup() {
    const route = useRoute()
    
    const activeMenu = computed(() => {
      return route.path
    })
    
    return {
      activeMenu
    }
  }
}
</script>

<style scoped>
.navigation-menu {
  padding: 0 20px;
}

.el-menu-item .el-icon,
.el-sub-menu .el-icon {
  margin-right: 5px;
}
</style> 