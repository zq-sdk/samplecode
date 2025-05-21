<!--
  应用根组件
  负责初始化空间服务并渲染主要场景容器
-->
<script setup>
import { inject, ref, onMounted } from 'vue'
import SceneContainer from './components/SceneContainer.vue'

// 注入空间服务实例
const space = inject('space')
// 初始化状态标识
const isInit = ref(false)

/**
 * 组件挂载后初始化空间服务
 */
onMounted(async () => {
  await space.init()
  isInit.value = true
})
</script>

<template>
  <!-- Element Plus 全局配置 -->
  <el-config-provider size="small" :z-index="3000">
    <!-- 场景容器组件，仅在初始化完成后渲染 -->
    <SceneContainer v-if="isInit" />
  </el-config-provider>
</template>

<style scoped></style>
