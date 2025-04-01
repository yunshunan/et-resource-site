<template>
  <div 
    ref="containerRef" 
    class="virtual-list-container" 
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>
    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="(item, index) in visibleItems"
        :key="item.id || keyFn ? keyFn(item) : index"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="startIndex + index"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

export default {
  name: 'VirtualList',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    containerHeight: {
      type: Number,
      default: 500
    },
    buffer: {
      type: Number,
      default: 5
    },
    keyFn: {
      type: Function,
      default: null
    }
  },
  setup(props) {
    const containerRef = ref(null)
    const { height: containerSize } = useElementSize(containerRef)
    
    // 滚动位置
    const scrollTop = ref(0)
    
    // 计算可见区域的起始索引
    const startIndex = computed(() => {
      return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
    });
    
    // 计算可见区域要渲染的项目数量
    const visibleCount = computed(() => {
      return Math.ceil(containerSize.value / props.itemHeight) + 2 * props.buffer;
    });
    
    // 可见项目
    const visibleItems = computed(() => {
      return props.items.slice(startIndex.value, startIndex.value + visibleCount.value);
    });
    
    // 总高度
    const totalHeight = computed(() => {
      return props.items.length * props.itemHeight;
    });
    
    // 偏移量
    const offset = computed(() => {
      return startIndex.value * props.itemHeight;
    });
    
    // 滚动处理函数
    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop;
    };
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (containerRef.value) {
        const { height } = containerRef.value.getBoundingClientRect();
        containerSize.value = height;
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      const container = containerRef.value;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
      }
    });
    
    onBeforeUnmount(() => {
      const container = containerRef.value;
      if (container) {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      }
    });
    
    // 当items变化时重置滚动位置
    watch(() => props.items, () => {
      scrollTop.value = 0;
      if (containerRef.value) {
        containerRef.value.scrollTop = 0;
      }
    }, { deep: true });
    
    return {
      containerRef,
      visibleItems,
      totalHeight,
      offset,
      startIndex
    };
  }
}
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  overflow: hidden;
}

.virtual-list-item {
  width: 100%;
  box-sizing: border-box;
}
</style> 