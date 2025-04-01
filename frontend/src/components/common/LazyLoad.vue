<template>
  <div ref="container" class="lazy-load-container">
    <div v-if="!isVisible && placeholder" class="lazy-load-placeholder">
      {{ placeholder }}
    </div>
    <div v-show="isVisible" class="lazy-load-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LazyLoad',
  props: {
    // 观察器的根元素，默认为浏览器视口
    root: {
      type: Object,
      default: null
    },
    // 根元素的边距，用于扩展或缩小视口的判定范围
    rootMargin: {
      type: String,
      default: '0px'
    },
    // 目标元素与根元素相交比例的阈值
    threshold: {
      type: [Number, Array],
      default: 0
    },
    // 是否立即加载，不等待滚动
    immediate: {
      type: Boolean,
      default: false
    },
    // 占位内容
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['visible'],
  setup(props, { emit }) {
    const container = ref(null)
    const isVisible = ref(props.immediate)
    let observer = null

    const handleIntersect = (entries) => {
      const [entry] = entries
      
      if (entry.isIntersecting) {
        isVisible.value = true
        emit('visible')
        
        // 元素已经可见后，停止观察
        if (observer && container.value) {
          observer.unobserve(container.value)
        }
      }
    }

    onMounted(() => {
      // 如果设置为立即加载，则不需要使用IntersectionObserver
      if (props.immediate) {
        isVisible.value = true
        emit('visible')
        return
      }

      // 如果浏览器支持IntersectionObserver
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(handleIntersect, {
          root: props.root,
          rootMargin: props.rootMargin,
          threshold: props.threshold
        })

        // 开始观察元素
        if (container.value) {
          observer.observe(container.value)
        }
      } else {
        // 对于不支持IntersectionObserver的浏览器，直接显示内容
        isVisible.value = true
        emit('visible')
      }
    })

    onUnmounted(() => {
      // 清理观察器
      if (observer && container.value) {
        observer.unobserve(container.value)
        observer = null
      }
    })

    return {
      container,
      isVisible
    }
  }
}
</script>

<style scoped>
.lazy-load-container {
  min-height: 1px;
  position: relative;
}

.lazy-load-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #9ca3af;
  height: 100%;
  width: 100%;
}
</style> 