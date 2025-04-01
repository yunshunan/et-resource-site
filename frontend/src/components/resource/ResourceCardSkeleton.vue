<template>
  <div class="resource-card-skeleton">
    <SkeletonLoader type="card" animated />
  </div>
</template>

<script>
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

export default {
  name: 'ResourceCardSkeleton',
  components: {
    SkeletonLoader
  }
}
</script>

<style scoped>
.resource-card-skeleton {
  height: 320px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}
</style> 