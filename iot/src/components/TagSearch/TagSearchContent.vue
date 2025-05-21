<script setup>
import { inject, computed } from 'vue'
import TagSearchContentItem from './TagSearchContentItem.vue'
import { videoService } from '@/services/video'
import { DEVICE_STATE_ENUM } from '../../constants'

const props = defineProps({
  tagList: {
    type: Array,
    default: () => [],
  },
})

const space = inject('space')

/* 热点点击——飞向热点所在位置 */
const handleListClick = async event => {
  const target = event.target
  const tagItem = target.closest('.tag-search-content__item')
  if (!tagItem) {
    return
  }

  const { type, id } = tagItem.dataset
  if (!id) {
    return
  }

  const clickedTag = props.tagList.find(tag => tag && tag.id === id)

  if (clickedTag) {
    console.log('热点被点击：', { type, tag: clickedTag })

    // 飞入到热点位置，如果是摄像头则播放视频
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

const normalTagCount = computed(
  () => props.tagList.filter(t => t && !t.isIotTag).length
)

const iotTagCount = computed(
  () => props.tagList.filter(t => t && t.isIotTag).length
)

const normalIotDeviceCount = computed(
  () =>
    props.tagList.filter(
      t =>
        t &&
        t.isIotTag &&
        t.iotData &&
        t.iotData.state === DEVICE_STATE_ENUM.NORMAL
    ).length
)

const abnormalIotDeviceCount = computed(
  () =>
    props.tagList.filter(
      t =>
        t &&
        t.isIotTag &&
        t.iotData &&
        t.iotData.state === DEVICE_STATE_ENUM.ERROR
    ).length
)
</script>

<template>
  <div class="container">
    <div class="tag-search-header">
      <span>热点总数：{{ tagList?.length || 0 }}</span>
      <span>普通热点总数：{{ normalTagCount }}</span>
      <span>IoT热点总数：{{ iotTagCount }}</span>
      <span>正常设备总数：{{ normalIotDeviceCount }}</span>
      <span>告警设备总数：{{ abnormalIotDeviceCount }}</span>
    </div>
    <el-scrollbar
      v-if="tagList?.length"
      height="400px"
      @click="handleListClick"
    >
      <ul class="tag-search-content">
        <li
          v-for="tag in tagList"
          :key="tag?.id || Math.random()"
          class="tag-search-content__item"
          :data-type="tag?.iotData?.type"
          :data-id="tag?.id"
        >
          <TagSearchContentItem :item="tag" />
        </li>
      </ul>
    </el-scrollbar>
    <div v-else class="tag-search-content__empty">暂无搜索结果</div>
  </div>
</template>
<style scoped lang="less">
.container {
  width: 100%;
  height: 400px;
  background-color: rgba(0, 0, 0, 0.5);
}
.tag-search-header {
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
  align-items: center;
  font-size: 16px;
  color: #ffffff;

  span {
    flex: 0 0 33.33%;
    box-sizing: border-box;
  }
}

.tag-search-content {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tag-search-content__empty {
  font-size: 20px;
  font-weight: bold;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tag-search-content__item {
  font-size: 14px;
  padding: 8px;
  background-color: rgba(245, 245, 245, 0.704);
  cursor: pointer;
  margin-bottom: 1px;

  &:last-child {
    margin-bottom: 0;
  }
}

.tag-search-content__item:hover {
  background-color: #ffffff;
}
</style>
