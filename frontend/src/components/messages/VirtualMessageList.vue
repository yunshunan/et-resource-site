<template>
  <div class="virtual-message-list">
    <RecycleScroller
      class="scroller"
      :items="messages"
      :item-size="estimateSize"
      :buffer="500"
      key-field="id"
      v-slot="{ item: message }"
      ref="scroller"
    >
      <div class="message-row" :key="message.id">
        <MessageBubble 
          :message="message" 
          @retry="$emit('retry', message.id)" 
          @height-change="handleMessageHeightChange"
        />
      </div>
    </RecycleScroller>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, defineComponent } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import MessageBubble from './MessageBubble.vue'

export default defineComponent({
  name: 'VirtualMessageList',
  components: {
    RecycleScroller,
    MessageBubble
  },
  props: {
    messages: {
      type: Array,
      required: true,
      default: () => []
    },
    scrollToBottom: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry', 'scroll'],
  setup(props, { emit }) {
    const scroller = ref(null)
    const avgMessageHeight = ref(80) // 初始估计的消息高度
    const messageSizeCache = ref({}) // 缓存每条消息的高度
    const isFirstRender = ref(true) // 标记是否首次渲染
    
    // 估计消息高度的函数
    const estimateSize = (message) => {
      // 如果已经有缓存的高度，优先使用缓存值
      if (messageSizeCache.value[message.id]) {
        return messageSizeCache.value[message.id]
      }
      
      // 根据消息类型估算高度
      let estimatedHeight = 50 // 基础高度
      
      // 日期分隔符消息
      if (message.type === 'date') {
        return 50 // 日期分隔符高度相对固定
      }
      
      // 文本消息根据内容长度估算
      const contentLength = message.content ? message.content.length : 0
      estimatedHeight += Math.ceil(contentLength / 50) * 20
      
      // 对不同类型的消息特殊处理
      if (message.contentType === 'image') {
        estimatedHeight = Math.max(estimatedHeight, 150) // 图片消息最小高度
      } else if (message.contentType === 'video') {
        estimatedHeight = Math.max(estimatedHeight, 200) // 视频消息最小高度
      } else if (message.contentType === 'file') {
        estimatedHeight = 70 // 文件消息高度相对固定
      } else if (message.contentType === 'link' && message.linkPreview) {
        estimatedHeight = 150 // 带预览的链接消息
      }
      
      // 更新平均高度（采用移动平均）
      avgMessageHeight.value = Math.round((avgMessageHeight.value * 0.8) + (estimatedHeight * 0.2))
      
      // 缓存计算的高度
      messageSizeCache.value[message.id] = estimatedHeight
      
      return estimatedHeight
    }
    
    // 处理消息高度变化
    const handleMessageHeightChange = (messageId) => {
      if (!scroller.value) return
      
      nextTick(() => {
        // 通知 RecycleScroller 重新计算高度
        scroller.value.updatePositions()
      })
    }
    
    // 监听消息变化
    watch(() => props.messages, (newMessages, oldMessages) => {
      // 仅当消息列表变化时更新缓存
      if (newMessages.length !== oldMessages.length) {
        // 清除已不存在的消息缓存
        const messageIds = new Set(newMessages.map(msg => msg.id))
        Object.keys(messageSizeCache.value).forEach(id => {
          if (!messageIds.has(id)) {
            delete messageSizeCache.value[id]
          }
        })
      }
      
      if (props.scrollToBottom && scroller.value) {
        nextTick(() => {
          scrollToEnd()
        })
      }
    }, { deep: true })
    
    // 监听scrollToBottom属性变化
    watch(() => props.scrollToBottom, (newVal) => {
      if (newVal && scroller.value) {
        scrollToEnd()
      }
    })
    
    // 组件首次挂载后，滚动到底部
    watch(() => scroller.value, (newVal) => {
      if (newVal && isFirstRender.value) {
        isFirstRender.value = false
        if (props.scrollToBottom) {
          nextTick(() => {
            scrollToEnd()
          })
        }
      }
    })
    
    // 滚动到底部
    const scrollToEnd = () => {
      if (scroller.value) {
        const scrollComponent = scroller.value
        // 获取要滚动到的位置
        const scrollPosition = scrollComponent.$el.scrollHeight
        // 使用 scrollTo 实现滚动
        scrollComponent.$el.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      }
    }
    
    // 处理滚动事件
    const handleScroll = (event) => {
      // 通知父组件滚动事件
      emit('scroll', event)
    }
    
    // 在组件挂载后添加滚动事件监听
    const setupScrollListener = () => {
      if (scroller.value && scroller.value.$el) {
        scroller.value.$el.addEventListener('scroll', handleScroll)
      }
    }
    
    // 确保在组件挂载和更新后设置滚动监听
    watch(() => scroller.value, (newVal) => {
      if (newVal) {
        nextTick(setupScrollListener)
      }
    })
    
    return {
      scroller,
      estimateSize,
      scrollToEnd,
      handleScroll,
      handleMessageHeightChange
    }
  }
})
</script>

<style scoped>
.virtual-message-list {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.scroller {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.message-row {
  padding: 4px 0;
  width: 100%;
}
</style> 