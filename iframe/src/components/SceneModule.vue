<script setup>
import { ref, toRaw, inject, watch } from 'vue'
const messageSDKRef = inject('messageSDKRef')
let messageSDK = null
watch(messageSDKRef, (n) => {
  messageSDK = toRaw(messageSDKRef.value)
  addEventListener()
})
const sceneList = ref([])
const curSceneId = ref('')
const handleGetSceneList = () => {
  messageSDK.scene.getScenes().then(
    (res) => {
      console.error(222, JSON.stringify(res))
      sceneList.value = res
    },
    (err) => {
      console.error('获取失败', err)
    },
  )
}

const handleSwitchScene = () => {
  messageSDK.scene.switch({
    sceneId: curSceneId.value,
  })
}

const addEventListener = () => {
  messageSDK.on('model.switch.complete', (data) => {
    curSceneId.value = data.id
  })
  messageSDK.on('work.loaded', (data) => {
    curSceneId.value = data.id
  })
}
</script>

<template>
  <el-space wrap>
    <el-button @click="handleGetSceneList">获取场景列表</el-button>
    <el-select
      v-model="curSceneId"
      placeholder="场景"
      style="width: 200px"
      @change="handleSwitchScene"
    >
      <el-option v-for="item in sceneList" :key="item.id" :label="item.name" :value="item.id" />
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
