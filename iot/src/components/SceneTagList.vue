<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { DEVICE_STATE_ENUM, DEVICE_STATE_DESC } from '@/constants'
import { equipmentService } from '../services/equipment'
import { videoService } from '../services/video'
import {
  getTagDeviceListByIotType,
  getTypedTagData,
} from '@/plugins/Space/DataCenter/iot'

const space = inject('space')
const hoveredTag = ref(null)
const deviceStates = ref({}) // 存储设备状态的对象

// 状态变化监听器
const handleStateChange = (deviceId, state) => {
  deviceStates.value[deviceId] = state
}

// 过滤和转换标签列表
const filteredTagList = computed(() => {
  const { iot, camera } = getTypedTagData()
  return { iot, camera }
})

// 获取设备状态描述
const getDeviceStateDesc = deviceId => {
  const state = equipmentService.getDeviceState(deviceId)
  return DEVICE_STATE_DESC[state]
}

// 获取状态对应的类名
const getStateClassName = computed(() => deviceId => {
  const state =
    deviceStates.value[deviceId] || equipmentService.getDeviceState(deviceId)
  return state === DEVICE_STATE_ENUM.NORMAL ? 'state-normal' : 'state-error'
})

const handleListClick = async event => {
  const tagItem = event.target.closest('.tag-item')
  if (!tagItem) {
    return
  }

  const { type, id } = tagItem.dataset
  const tagList = filteredTagList.value[type]
  const clickedTag = tagList.find(tag => tag.id === id)

  if (clickedTag) {
    console.log('标签被点击：', { type, tag: clickedTag })

    // 飞入到标签位置，如果是摄像头则播放视频
    space.feature.tag.flyToTag(
      id,
      type === 'camera'
        ? async () => {
            await videoService.playCamera(id)
          }
        : null
    )
  }
}

const handleTagHover = tag => {
  hoveredTag.value = tag
}

const handleTagLeave = () => {
  hoveredTag.value = null
}

onMounted(() => {
  // 添加设备状态变化监听器
  equipmentService.addStateChangeListener(handleStateChange)
  // 获取设备列表
  const deviceList = getTagDeviceListByIotType('iot') ?? []
  // 启动全局设备状态更新
  equipmentService.startGlobalUpdate(deviceList, 2000)
})

onBeforeUnmount(() => {
  // 移除状态变化监听器
  equipmentService.removeStateChangeListener(handleStateChange)
})
</script>

<template>
  <div class="scene-tag-list">
    <div
      v-for="(tags, type) in filteredTagList"
      :key="type"
      class="tag-category"
      @click="handleListClick"
    >
      <h3 class="category-title">
        {{ type === 'iot' ? 'IoT设备' : '摄像头' }}
        <span class="tag-count">({{ tags.length }})</span>
      </h3>
      <ul class="tag-list">
        <li
          v-for="tag in tags"
          :key="tag.id"
          class="tag-item"
          :class="{
            'tag-hovered': hoveredTag === tag,
            [getStateClassName(tag.iotData.deviceId)]: type === 'iot',
          }"
          :data-type="type"
          :data-id="tag.id"
          @mouseenter="handleTagHover(tag)"
          @mouseleave="handleTagLeave"
        >
          <div class="tag-content">
            <span class="tag-icon">{{ type === 'iot' ? '🔌' : '📷' }}</span>
            <span class="tag-name">{{ tag.content.title_info.text }}</span>
            <span
              v-if="type === 'iot'"
              class="tag-state-indicator"
              :class="getStateClassName(tag.iotData.deviceId)"
            ></span>
          </div>
          <div class="tag-info">
            <template v-if="type === 'camera'">
              <span class="tag-mode"
                >模式: {{ tag.iotData.mode === 0 ? '点播' : '直播' }}</span
              >
            </template>
            <template v-else>
              <span
                class="tag-state"
                :class="getStateClassName(tag.iotData.deviceId)"
              >
                状态: {{ getDeviceStateDesc(tag.iotData.deviceId) }}
              </span>
              <span class="tag-device-id">ID: {{ tag.iotData.deviceId }}</span>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.scene-tag-list {
  position: absolute;
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.tag-category {
  margin-bottom: 24px;
}

.category-title {
  font-size: 18px;
  color: #000000;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
  display: flex;
  align-items: center;
}

.tag-count {
  color: #000000;
  margin-left: 8px;
}

.tag-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-item {
  padding: 12px 16px;
  margin: 8px 0;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.state-normal {
  border-left-color: #4caf50;
}

.state-error {
  border-left-color: #f44336;
}

.tag-item:hover,
.tag-hovered {
  background-color: #e0e0e0;
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tag-content {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.tag-icon {
  margin-right: 12px;
  font-size: 20px;
}

.tag-name {
  font-size: 16px;
  color: #333;
  flex: 1;
}

.tag-state-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 8px;
}

.tag-state-indicator.state-normal {
  background-color: #4caf50;
}

.tag-state-indicator.state-error {
  background-color: #f44336;
}

.tag-info {
  padding-left: 32px;
  font-size: 14px;
  color: #666;
  display: flex;
  gap: 16px;
}

.tag-mode,
.tag-state,
.tag-device-id {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-state.state-normal {
  background-color: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.tag-state.state-error {
  background-color: rgba(244, 67, 54, 0.1);
  color: #c62828;
}
</style>
