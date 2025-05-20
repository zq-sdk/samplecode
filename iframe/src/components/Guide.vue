<script setup>
import { ref, toRaw, inject, watch } from 'vue'
const messageSDKRef = inject('messageSDKRef')
let messageSDK = null
watch(messageSDKRef, (n) => {
  messageSDK = toRaw(messageSDKRef.value)
})
const isPlay = ref(false)
const handlePlay = () => {
  isPlay.value = !isPlay.value
  isPlay.value ? messageSDK.guide.play() : messageSDK.guide.pause()
}

const isShow = ref(false)
const handleVisible = () => {
  isShow.value = !isShow.value
  isShow.value ? messageSDK.guide.barShow() : messageSDK.guide.barHide()
}
</script>

<template>
  <el-space wrap>
    <el-button @click="handlePlay">{{ isPlay ? '暂停导览' : '播放导览' }}</el-button>
    <el-button @click="handleVisible">{{ isShow ? '导览条隐藏' : '导览条显示' }}</el-button>
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
