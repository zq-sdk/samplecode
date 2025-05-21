<script setup>
import {
  TAG_NORMAL_TYPE_ENUM,
  IOT_TYPE_ENUM,
  DEVICE_STATE_ENUM,
  DEVICE_STATE_DESC,
  CAMERA_VIDEO_MODE_DESC,
} from '@/constants'

const _props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const getTagTypeDesc = type => {
  return type && TAG_NORMAL_TYPE_ENUM[type]
    ? TAG_NORMAL_TYPE_ENUM[type]
    : '未知'
}

const getDeviceStateDesc = state => {
  return state !== undefined && DEVICE_STATE_DESC[state]
    ? DEVICE_STATE_DESC[state]
    : '未知'
}

const getCameraModeDesc = mode => {
  return mode !== undefined && CAMERA_VIDEO_MODE_DESC[mode]
    ? CAMERA_VIDEO_MODE_DESC[mode]
    : '未知'
}
</script>
<template>
  <div class="tag-content">
    <span
      class="tag-name"
      @click.stop="
        () => {
          console.log('复制tagName', item.content?.title_info?.text)
        }
      "
    >
      热点名称：{{ item.content?.title_info?.text || '未知' }}
    </span>
    <span class="tag-type">
      热点类型：{{ getTagTypeDesc(item.content?.type) }}
    </span>
    <span
      class="tag-id"
      @click.stop="
        () => {
          console.log('复制tagId', item.id)
        }
      "
      >tagId: {{ item.id }}</span
    >
  </div>
  <div v-if="item.isIotTag" class="tag-content">
    <span class="tag-iot-type"
      >iot类型：{{ item.iotData?.type || '未知' }}</span
    >
    <span
      class="tag-device-id"
      @click.stop="
        () => {
          console.log('复制deviceId', item.iotData?.deviceId)
        }
      "
      >绑定的ID: {{ item.iotData?.deviceId || '未知' }}</span
    >
    <span
      v-if="item.iotData?.type === IOT_TYPE_ENUM.IOT"
      class="tag-state"
      :class="
        item.iotData?.state === DEVICE_STATE_ENUM.NORMAL
          ? 'state-normal'
          : 'state-error'
      "
    >
      状态:
      {{ getDeviceStateDesc(item.iotData?.state) }}
    </span>
    <span v-if="item.iotData?.type === IOT_TYPE_ENUM.CAMERA" class="tag-mode">
      模式:
      {{ getCameraModeDesc(item.iotData?.mode) }}
    </span>
  </div>
</template>

<style lang="less" scoped>
.tag-content {
  color: #333;
  display: flex;
  align-items: center;
  gap: 16px;

  > span {
    width: 33%;
  }

  &:last-child {
    margin-top: 6px;
  }
}

.tag-state.state-normal {
  background-color: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.tag-state.state-error {
  background-color: rgba(244, 67, 54, 0.1);
  color: #c62828;
}

.tag-mode,
.tag-state,
.tag-iot-type,
.tag-device-id {
  background-color: rgba(0, 0, 0, 0.276);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
