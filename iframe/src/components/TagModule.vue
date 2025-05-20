<script setup>
import { ref, inject, watch, toRaw } from 'vue'

const messageSDKRef = inject('messageSDKRef')
let messageSDK = null
watch(messageSDKRef, (n) => {
  messageSDK = toRaw(messageSDKRef.value)
})
const tagList = ref([])
const curTag = ref('')

const handleGetTagList = () => {
  messageSDK.tag.getTags().then(
    (res) => {
      tagList.value = res
    },
    (err) => {
      console.error('获取失败', err)
    },
  )
}

const handleFlyToTag = () => {
  const curTagInfo = tagList.value.find((item) => item.id === curTag.value)
  messageSDK.tag
    .flyTo({
      tagId: curTag.value,
      sceneId: curTagInfo.scene_id,
    })
    .then(
      (res) => {
        console.log(res)
        // emit('update:screenTags', [res])
      },
      (err) => {
        console.error('获取失败', err)
      },
    )
}

const emit = defineEmits(['update:screenTags'])
</script>

<template>
  <el-space wrap>
    <el-button @click="handleGetTagList">获取标签列表</el-button>
    <el-select v-model="curTag" placeholder="标签" style="width: 200px" @change="handleFlyToTag">
      <el-option
        v-for="item in tagList"
        :key="item.id"
        :label="item.content.title_info.text"
        :value="item.id"
      />
    </el-select>
  </el-space>
</template>

<style scoped></style>
