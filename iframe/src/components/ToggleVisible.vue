<script setup>
import { ref, inject } from 'vue'

const handleVisible = inject('handleVisible')
const isVisible = ref(true)

const toggleVisible = () => {
  isVisible.value = !isVisible.value
  handleVisible(isVisible.value)
}
</script>

<template>
  <div class="toggle-visible" @click="toggleVisible">
    {{ isVisible ? '隐藏' : '显示' }}
  </div>
</template>

<style scoped>
.toggle-visible {
  position: absolute;
  width: 35px;
  height: 35px;
  font-size: 12px;
  background: white;
  text-align: center;
  line-height: 35px;
  border-radius: 50%;
  cursor: pointer;
  left: 50%;
  bottom: -20px;
  z-index: 1000;
}
</style>
