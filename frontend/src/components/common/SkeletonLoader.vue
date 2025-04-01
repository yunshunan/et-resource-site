<template>
  <div 
    class="skeleton-loader"
    :class="[
      type ? `skeleton-${type}` : '',
      animated ? 'skeleton-animated' : '',
      rounded ? 'skeleton-rounded' : ''
    ]"
    :style="customStyle"
  >
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-image"></div>
      <div class="skeleton-card-content">
        <div class="skeleton-card-title"></div>
        <div class="skeleton-card-text"></div>
        <div class="skeleton-card-text"></div>
        <div class="skeleton-card-actions"></div>
      </div>
    </div>
    <div v-else-if="type === 'article'" class="skeleton-article">
      <div class="skeleton-article-header">
        <div class="skeleton-article-title"></div>
        <div class="skeleton-article-subtitle"></div>
      </div>
      <div class="skeleton-article-content">
        <div class="skeleton-article-text"></div>
        <div class="skeleton-article-text"></div>
        <div class="skeleton-article-text"></div>
        <div class="skeleton-article-text"></div>
      </div>
    </div>
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div 
        v-for="n in count" 
        :key="n" 
        class="skeleton-list-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <div class="skeleton-list-avatar" v-if="avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-list-title"></div>
          <div class="skeleton-list-text"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'SkeletonLoader',
  props: {
    // 骨架屏类型：card, article, list, 或自定义宽高
    type: {
      type: String,
      default: '',
      validator: (value) => ['', 'card', 'article', 'list'].includes(value)
    },
    // 是否显示加载动画
    animated: {
      type: Boolean,
      default: true
    },
    // 是否圆角
    rounded: {
      type: Boolean,
      default: true
    },
    // 宽度 (px或%)
    width: {
      type: [Number, String],
      default: null
    },
    // 高度 (px)
    height: {
      type: [Number, String],
      default: null
    },
    // 列表类型专用：项目数量
    count: {
      type: Number,
      default: 3
    },
    // 列表类型专用：项目高度
    itemHeight: {
      type: Number,
      default: 60
    },
    // 列表类型专用：是否显示头像
    avatar: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 计算自定义样式
    const customStyle = computed(() => {
      const style = {};
      
      if (props.width) {
        style.width = isNaN(props.width) ? props.width : `${props.width}px`;
      }
      
      if (props.height) {
        style.height = isNaN(props.height) ? props.height : `${props.height}px`;
      }
      
      return style;
    });
    
    return {
      customStyle
    };
  }
}
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.skeleton-animated::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-rounded {
  border-radius: 4px;
}

/* Card skeleton */
.skeleton-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.skeleton-card-image {
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
}

.skeleton-card-content {
  padding: 16px;
  flex: 1;
}

.skeleton-card-title {
  height: 24px;
  margin-bottom: 16px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 70%;
}

.skeleton-card-text {
  height: 16px;
  margin-bottom: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.skeleton-card-text:last-of-type {
  width: 80%;
}

.skeleton-card-actions {
  height: 36px;
  margin-top: 16px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 40%;
}

/* Article skeleton */
.skeleton-article {
  width: 100%;
  height: 100%;
}

.skeleton-article-header {
  margin-bottom: 24px;
}

.skeleton-article-title {
  height: 32px;
  margin-bottom: 16px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 60%;
}

.skeleton-article-subtitle {
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 80%;
}

.skeleton-article-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-article-text {
  height: 16px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.skeleton-article-text:nth-child(2) {
  width: 90%;
}

.skeleton-article-text:nth-child(3) {
  width: 85%;
}

.skeleton-article-text:nth-child(4) {
  width: 70%;
}

/* List skeleton */
.skeleton-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.skeleton-list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 16px;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-list-title {
  height: 18px;
  margin-bottom: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 60%;
}

.skeleton-list-text {
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 80%;
}
</style> 