<script setup>
import { computed, onMounted, ref, inject } from 'vue'

const messageSDK = inject('messageSDK')

const props = defineProps({
  tagInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
})
const screenPosition = computed(() => {
  if (props.tagInfo.screenPosition.isLeft) {
    return {
      x: props.tagInfo.screenPosition.left + 10, // 10 为留白，避免紧贴标签，可以自定义
      y: props.tagInfo.screenPosition.top - 150, // 150 为弹窗高度的1/2
    }
  } else {
    return {
      x: props.tagInfo.screenPosition.left - 320, // 300 （弹窗宽度）+ 10（留白）
      y: props.tagInfo.screenPosition.top - 150, // 150 为弹窗高度的1/2
    }
  }
})
</script>

<template>
  <div
    class="custom-pop-box"
    v-if="tagInfo.id"
    :style="{
      left: screenPosition.x + 'px',
      top: screenPosition.y + 'px',
    }"
  >
    <div>标签ID: {{ props.tagInfo.id }}</div>
    <div>屏幕坐标: {{ screenPosition }}</div>
    <ol style="margin-top: 30px">
      <li>这里可以自己显示任何您想要展示的内容</li>
      <li>弹窗的样式您也可以按照需求自由修改</li>
    </ol>
  </div>
</template>

<style scoped>
.custom-pop-box {
  width: 300px;
  height: 300px;
  position: absolute;
  left: -300px;
  top: -300px;
  border: 1px solid black;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  box-sizing: border-box;
  color: white;
}
</style>
