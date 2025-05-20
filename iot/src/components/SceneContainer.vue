<script setup>
import ViewModeSwitch from './ViewModeSwitch/Container.vue'
import TagPopup from './TagPopup/Container.vue'
import SceneTagList from './SceneTagList.vue'
import VideoPlayer from './VideoPlayer/VideoPlayer.vue'
import { useSceneLoading } from '../hooks/useSceneLoading'
import { inject, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import dataCenter from '../plugins/Space/DataCenter/offline'
import { equipmentService } from '../services/equipment'
import { videoService } from '../services/video'
import { createIotTextScreen } from '@/components/IOTScreen/iotScreenText'
import { createIotDashboardScreen } from '@/components/IOTScreen/iotScreenDashboard'
import {
  getDeviceListByDisplayType,
  getTagDeviceListByIotType,
} from '@/plugins/Space/DataCenter/iot'
import { DEVICE_DATA_DISPLAY_TYPE_ENUM } from '@/constants'

const space = inject('space')
const coverPic = dataCenter.getSettingData()?.basic.cover_pic
const { isModelLoaded } = useSceneLoading(space)

// 获取视频状态
const videoState = videoService.getState()
const isVideoVisible = computed(() => videoState.videoVisible)
const currentVideoUrl = computed(() => videoState.currentVideoUrl)

// 关闭视频处理
const handleCloseVideo = () => {
  videoService.stopPlaying()
}

console.log('settingData', dataCenter.getSettingData())

// 在根组件中启动和管理全局状态更新
onMounted(async () => {
  // 只在模型加载完成后初始化设备状态更新
  if (isModelLoaded.value) {
    await initializeDeviceService()
  } else {
    const stopWatch = watch(isModelLoaded, async (loaded) => {
      if (loaded) {
        await initializeDeviceService()
        stopWatch()
      }
    })
  }
})

// 应用关闭前停止全局状态更新
onBeforeUnmount(() => {
  equipmentService.stopGlobalUpdate()
})

// 初始化设备服务
const initializeDeviceService = async () => {
  // 获取所有IoT设备（Tag 绑定的设备）
  const deviceList = getTagDeviceListByIotType('iot') ?? []
  // 获取以大屏方式展示的 IOT 设备列表（2D物品绑定的设备）
  const put2dDeviceList = getDeviceListByDisplayType('put2d') ?? []
  // 启动全局设备状态更新
  equipmentService.startGlobalUpdate(deviceList, 2000)

  console.log('设备服务已初始化，设备数量:', deviceList.length)

  put2dDeviceList.forEach((deviceData) => {
    if (deviceData.mode === DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS) {
      createIotTextScreen(space.feature.put2dContent.plugin.put2d, deviceData)
    }

    if (deviceData.mode === DEVICE_DATA_DISPLAY_TYPE_ENUM.CSS3D) {
      createIotDashboardScreen(deviceData)
    }
  })
}
</script>

<template>
  <div id="container">
    <template v-if="isModelLoaded">
      <ViewModeSwitch />
      <TagPopup />
      <SceneTagList />

      <!-- 视频播放器组件 -->
      <VideoPlayer
        :visible="isVideoVisible"
        :video-url="currentVideoUrl"
        @close="handleCloseVideo"
      />
    </template>
    <template v-else>
      <div class="workCover">
        <img :src="coverPic" alt="work cover" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.workCover {
  width: 100%;
  height: 100%;
}
</style>
