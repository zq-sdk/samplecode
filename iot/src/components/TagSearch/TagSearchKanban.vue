<script setup>
import { Search } from '@element-plus/icons-vue'
import TagSearchContent from './TagSearchContent.vue'
import { SEARCH_OPTIONS, IOT_TYPE_DATA_KEY_ENUM } from '@/constants'
import {
  getFormattedTagList,
  getIotTagList,
  getNormalTagList,
} from '@/plugins/Space/DataCenter/iot'
import { onBeforeUnmount, onMounted } from 'vue'
import { equipmentService } from '@/services/equipment'
import { IOT_TYPE_ENUM } from '../../constants'

const searchInput = ref('')
const tagSearchResults = ref(getFormattedTagList())
const preTagSearchResults = ref(getFormattedTagList())
// iot 设备搜索条件
const deviceStateFilter = ref([])
// 过滤搜索条件
const filterPath = ref(null)

/* 电力设备告警状态变更回调 */
const handleDeviceStateChange = (deviceId, state) => {
  let targetTag = null
  if (!deviceStateFilter.value.length) {
    targetTag = tagSearchResults.value.find(
      t => t.isIotTag && t.iotData.deviceId === deviceId
    )
    if (!targetTag) {
      console.error(`未找到该设备对应的热点：${deviceId}`)
      return
    }

    targetTag.iotData.state = state
    return
  }

  if (deviceStateFilter.value.length === 1) {
    targetTag = getIotTagList().find(
      t => t.isIotTag && t.iotData.deviceId === deviceId
    )

    if (!targetTag) {
      console.error(`未找到该设备对应的热点：${deviceId}`)
      return
    }

    targetTag.iotData.state = state

    deviceStateFilter.value[0] === state
      ? (tagSearchResults.value = [...tagSearchResults.value, targetTag])
      : (tagSearchResults.value = tagSearchResults.value.filter(
          t => t.id !== targetTag.id
        ))
  } else if (deviceStateFilter.value.length === 2) {
    targetTag = tagSearchResults.value.find(
      t => t.isIotTag && t.iotData.deviceId === deviceId
    )

    if (!targetTag) {
      console.error(`未找到该设备对应的热点：${deviceId}`)
      return
    }

    targetTag.iotData.state = state
  }
}

onMounted(() => {
  // 注册设备状态改变监听
  equipmentService.addStateChangeListener(handleDeviceStateChange)
})

onBeforeUnmount(() => {
  equipmentService.removeStateChangeListener(handleDeviceStateChange)
})

/* 搜索框文本变化时的处理函数 */
const handleSearchTextChange = text => {
  if (text && filterPath.value) {
    preTagSearchResults.value = tagSearchResults.value
  }

  if (!text && !filterPath.value) {
    tagSearchResults.value = getFormattedTagList()
    return
  }

  if (!text && filterPath.value) {
    tagSearchResults.value = preTagSearchResults.value
    return
  }

  tagSearchResults.value = tagSearchResults.value.filter(
    tag =>
      tag.content.title_info.text.includes(text) ||
      tag.id === text ||
      (tag.isIotTag && tag.iotData.deviceId === text)
  )
}

/* 级联框搜索条件变化时的处理函数 */
const handleFilterPathChange = path => {
  deviceStateFilter.value = []
  console.log(path)
  filterPath.value = { normal: [], iot: [] }
  path.forEach(p => {
    const [f1, f2, f3] = p
    switch (f1) {
      case 'normal': {
        filterPath.value.normal.push(f2)
        break
      }
      case 'iot': {
        filterPath.value.iot.push([f2, f3])
        if (f2 === IOT_TYPE_ENUM.IOT) {
          deviceStateFilter.value.push(f3)
        }
        break
      }
    }
  })

  console.log(`filterPath:`, filterPath.value)

  if (
    !Object.values(filterPath.value).reduce((acc, cur) => acc + cur.length, 0)
  ) {
    if (searchInput.value) {
      handleSearchTextChange(searchInput.value)
    } else {
      tagSearchResults.value = getFormattedTagList()
    }
    return
  }

  let res = []
  for (const [type, filterList] of Object.entries(filterPath.value)) {
    if (filterList.length === 0) {
      continue
    }

    if (type === 'normal') {
      res = getNormalTagList()
        .filter(tag => filterList.includes(tag.content.type))
        .concat(res)

      console.log(`normal Tag: `, res)
    } else if (type === 'iot') {
      filterList.forEach(filter => {
        const [type, data] = filter

        res = getIotTagList()
          .filter(
            tag =>
              tag.iotData.type === type &&
              tag.iotData[IOT_TYPE_DATA_KEY_ENUM[tag.iotData.type]] === data
          )
          .concat(res)
      })
    }
  }

  console.log(`handleFilterPathChange: `, res)

  if (searchInput.value) {
    res = handleSearchTextChange(searchInput.value)
  }

  tagSearchResults.value = res
}

const handleFilterPathRemove = path => {
  console.log(`handleFilterPathRemove: `, path)
  filterPath.value = null
}
</script>
<template>
  <div class="tag-search-container">
    <div class="tag-search-input">
      <el-input
        v-model="searchInput"
        style="width: 240px"
        size="default"
        placeholder="请输入热点名称/热点ID/设备ID"
        :prefix-icon="Search"
        @change="handleSearchTextChange"
      />
      <el-cascader
        size="default"
        :options="SEARCH_OPTIONS"
        :props="{ multiple: true }"
        placeholder="请选择过滤项"
        collapse-tags
        collapse-tags-tooltip
        clearable
        @change="handleFilterPathChange"
        @remove="handleFilterPathRemove"
      />
    </div>

    <TagSearchContent :tag-list="tagSearchResults" />
  </div>
</template>

<style scoped lang="less">
.tag-search-container {
  position: absolute;
  padding: 16px;
  width: 500px;
  max-width: 800px;
}

.tag-search-input {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
</style>
