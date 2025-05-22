<script setup>
import { onMounted, ref, provide, toRaw } from 'vue'
import CustomPop from './CustomPop.vue'
import ToggleVisible from './ToggleVisible.vue'
import TagModule from './TagModule.vue'
import SceneModule from './SceneModule.vue'
import Guide from './Guide.vue'
import Mode from './Mode.vue'

const workStatus = ref('加载中')
const connectStatus = ref('连接中')
const messageSDKRef = ref(null) // 需要使用响应式才能将onMounted里面创建的实例提供给子组件
let messageSDK = null // 直接使用messageSDKRef.value会有this指向问题，需要使用MessageSDK的原始对象调用实例方法
const screenTags = ref([])
const isVisible = ref(true)

const handleVisible = (visible) => {
  isVisible.value = visible
}

provide('messageSDKRef', messageSDKRef)
provide('handleVisible', handleVisible)
onMounted(() => {
  const qverse = document.getElementById('qverse-iframe')
  const { MessageSDK } = window
  messageSDKRef.value = MessageSDK.connect({
    targetWindow: qverse,
    // targetOrigin: 'http://localhost:8066',
    targetOrigin: 'https://test.3dnest.cn',
    config: {
      hide_ui: [
        // "all",
        "tag_pop",
        'logo',
        'title'
        // "navigation",
      ]
    }
  })
  // 提供 messageSDK 给子组件
  messageSDK = toRaw(messageSDKRef.value)

  messageSDK.on('connect.ok', () => {
    connectStatus.value = '连接成功'
  })
  messageSDK.on('work.loaded', (data) => {
    workStatus.value = '作品加载完成'
  })

  //需要自定义热点弹窗样式通过这个事件实时更新弹窗位置
  messageSDK.on('tag.positions', (data) => {
    screenTags.value = data
  })

  messageSDK.on('tag.click', (data) => {
    screenTags.value = [data]
  })
  messageSDK.on('model.switch.before', (data) => {
    screenTags.value = []
  })
  messageSDK.on('waypoint.switch.before', (data) => {
    screenTags.value = []
  })
})

const iframeId = 'qverse-iframe'
let workId = 'HHGiBIepJ4V'
const handleSwitchWork = () => {
  workId = workId === 'HHGiBIepJ4V' ? '3VH4fFTex8l' : 'HHGiBIepJ4V'
  screenTags.value = []
  const src = `https://test.3dnest.cn/qverse/work/${workId}?appKey=dgtkk21ze4cchf1x4pbp35eqc`
  updateIframeWithParams(iframeId, src)
}
const updateIframeWithParams = (iframeId, src) => {
  const iframe = document.getElementById(iframeId)
  iframe.src = src
}
</script>

<template>
  <div class="sample-container" :class="{ 'sample-container-hidden': !isVisible }">
    <ToggleVisible></ToggleVisible>
    <div class="flex">
      <h3>应用层功能示例</h3>
      <div style="margin-left: 20px">Iframe连接：{{ connectStatus }}</div>
      <div style="margin-left: 20px">作品加载：{{ workStatus }}</div>
    </div>
    <div style="padding-left: 5px">
      <el-space wrap>
        <el-button @click="handleSwitchWork">切换作品</el-button>
        <TagModule v-model:screenTags="screenTags"></TagModule>
        <SceneModule></SceneModule>
        <Guide></Guide>
        <Mode></Mode>
      </el-space>
    </div>
  </div>
  <!-- 标签的屏幕坐标是相对iframe的，这里需要把弹窗容器位置和iframe相同 -->
  <div class="pop-container">
    <CustomPop v-for="tagInfo in screenTags" :tagInfo="tagInfo"></CustomPop>
  </div>
</template>

<style scoped>
.sample-container {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 10px 30px 10px;
  box-sizing: border-box;
  transition: transform 0.3s ease-in-out;
  transform: translateY(0);
}

.sample-container-hidden {
  transform: translateY(-100%);
}

.flex {
  display: flex;
  align-items: center;
}

.pop-container {
  margin-top: 10px;
  position: fixed;
  left: 0px;
  top: 0px;
}
</style>
