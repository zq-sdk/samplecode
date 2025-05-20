<script setup>
import { ref, toRaw, inject, watch } from 'vue'
const messageSDKRef = inject('messageSDKRef')
let messageSDK = null
watch(messageSDKRef, (n) => {
  messageSDK = toRaw(messageSDKRef.value)
  addEventListener()
})
const curMode = ref('')
const modeList = ref([
  { label: '漫游模式', value: 'panorama' },
  { label: '3D模式', value: 'dollhouse' },
  { label: '平面模式', value: 'floorplan' },
])
const handleSwitchMode = ()=>{
  messageSDK.mode.switch(curMode.value)
}

const addEventListener = () => {
  messageSDK.on('mode.change', (data) => {
    console.error(111, JSON.stringify(data))
    curMode.value = data
  })
  messageSDK.on('model.switch.complete', (data) => {
    curMode.value = data?.mode
  })
  messageSDK.on('work.loaded', (data) => {
    curMode.value = data?.mode
  })
}
</script>

<template>
  <el-space wrap>
    <span>切换模式：</span>
    <el-select v-model="curMode" placeholder="模式" style="width: 200px" @change="handleSwitchMode">
      <el-option
        v-for="item in modeList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </el-space>
</template>

<style scoped>
.toggle-visible-box {
  background: white;
  width: 35px;
  height: 35px;
  border-radius: 25px;
  position: absolute;
  left: 50%;
  bottom: -18px;
  text-align: center;
  line-height: 35px;
  cursor: pointer;
  font-size: 12px;
  margin-left: -12px;
}
</style>
