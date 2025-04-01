<template>
  <LazyLoad 
    :root-margin="rootMargin" 
    :threshold="threshold"
    :immediate="immediate"
    :placeholder="loadingText"
    @visible="onVisible"
  >
    <img
      :src="loadedSrc"
      :alt="alt"
      :class="imgClass"
      :style="imgStyle"
      @load="onImageLoaded"
      @error="onImageError"
    />
    <div v-if="error" class="lazy-image-error">
      {{ errorText }}
    </div>
  </LazyLoad>
</template>

<script>
import { ref, computed } from 'vue'
import LazyLoad from '@/components/common/LazyLoad.vue'

export default {
  name: 'LazyImage',
  components: {
    LazyLoad
  },
  props: {
    // 图片URL
    src: {
      type: String,
      required: true
    },
    // 图片alt属性
    alt: {
      type: String,
      default: ''
    },
    // 图片加载失败时显示的替代图片
    fallbackSrc: {
      type: String,
      default: ''
    },
    // 图片加载中显示的占位图片
    placeholderSrc: {
      type: String,
      default: ''
    },
    // 加载中显示的文本
    loadingText: {
      type: String,
      default: '加载中...'
    },
    // 错误时显示的文本
    errorText: {
      type: String,
      default: '加载失败'
    },
    // 根元素的边距
    rootMargin: {
      type: String,
      default: '50px 0px'
    },
    // 相交比例的阈值
    threshold: {
      type: [Number, Array],
      default: 0.1
    },
    // 是否立即加载
    immediate: {
      type: Boolean,
      default: false
    },
    // 图片样式
    imgStyle: {
      type: Object,
      default: () => ({})
    },
    // 图片类名
    imgClass: {
      type: [String, Object, Array],
      default: ''
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref(false)
    
    // 计算实际显示的图片URL
    const loadedSrc = computed(() => {
      if (!isLoaded.value && props.placeholderSrc) {
        return props.placeholderSrc
      }
      
      if (error.value && props.fallbackSrc) {
        return props.fallbackSrc
      }
      
      return isLoaded.value ? props.src : ''
    })
    
    // 图片进入视口时触发
    const onVisible = () => {
      if (!isLoaded.value && !isLoading.value) {
        isLoading.value = true
        
        // 如果没有设置占位图，则直接开始加载目标图片
        if (!props.placeholderSrc) {
          isLoaded.value = true
        }
      }
    }
    
    // 图片加载成功
    const onImageLoaded = (event) => {
      if (isLoading.value && event.target.src === props.src) {
        isLoaded.value = true
        isLoading.value = false
        error.value = false
        emit('load', event)
      }
    }
    
    // 图片加载失败
    const onImageError = (event) => {
      if (event.target.src === props.src) {
        error.value = true
        isLoading.value = false
        emit('error', event)
      }
    }
    
    return {
      isLoaded,
      isLoading,
      error,
      loadedSrc,
      onVisible,
      onImageLoaded,
      onImageError
    }
  }
}
</script>

<style scoped>
.lazy-image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fef2f2;
  color: #ef4444;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style> 