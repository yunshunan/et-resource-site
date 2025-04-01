<template>
  <div v-memo="dependencies">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MemoComponent',
  props: {
    dependencies: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script> 