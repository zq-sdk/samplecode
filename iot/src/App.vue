<script setup>
import { inject, ref, onMounted } from 'vue'
import SceneContainer from './components/SceneContainer.vue'

const space = inject('space')
const isInit = ref(false)

onMounted(async () => {
  await space.init()
  isInit.value = true
})
</script>

<template>
  <el-config-provider size="small" :z-index="3000">
    <SceneContainer v-if="isInit" />
  </el-config-provider>
</template>

<style scoped></style>
