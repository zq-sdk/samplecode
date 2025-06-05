<template>
  <div class="bi-dashboard">
    <!-- 顶部区域 -->
    <header class="dashboard-header">
      <TopHeader
        :connection-status="connectionStatus"
        :guide-playing="guideStatus.playing"
        :guide-visible="guideStatus.visible"
        @guide-play="handleGuidePlay"
        @guide-pause="handleGuidePause"
        @guide-toggle="handleGuideToggle"
      />
    </header>

    <!-- 中间内容区域 -->
    <main class="dashboard-main">
      <!-- 左侧面板 -->
      <aside class="dashboard-left">
        <LeftPanel
          :tag-categories="tagCategories"
          :tag-statistics="tagStatistics"
          @tag-click="handleTagClick"
        />
      </aside>

      <!-- 右侧面板 -->
      <aside class="dashboard-right">
        <RightPanel
          :scenes="scenes"
          :current-scene="currentScene"
          :view-mode="currentViewMode"
          :tag-categories="tagCategories"
          @scene-change="handleSceneChange"
          @view-mode-change="handleViewModeChange"
          @device-click="handleTagClick"
        />
      </aside>
    </main>

    <VideoPlayer
      :visible="isVideoVisible"
      :video-url="currentVideoUrl"
      @close="handleCloseVideo"
    />

    <!-- 全局错误提示 -->
    <el-notification
      v-if="errorMessage"
      :title="errorMessage.title"
      :message="errorMessage.content"
      type="error"
      :duration="5000"
      @close="clearError"
    />
  </div>

  <div class="qverse-container">
    <iframe
      ref="qverseIframe"
      id="qverse-iframe"
      :src="qverseUrl"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElNotification } from 'element-plus'

// 导入组件
import TopHeader from './components/Layout/TopHeader.vue'
import LeftPanel from './components/Layout/LeftPanel.vue'
import RightPanel from './components/Layout/RightPanel.vue'
import VideoPlayer from './components/VideoPlayer.vue'

// 导入服务
import messageSDKService from './services/messageSDKService.js'
import dataParserService from './services/dataParser.js'
import { videoService } from './services/videoService.js'
import { VIEW_MODES, TAG_TYPES } from './constants'

// 响应式数据
const qverseIframe = ref(null)
const connectionStatus = ref(false)
const dataLoading = ref(false)
const errorMessage = ref(null)
// 获取视频状态
const videoState = videoService.getState()
const isVideoVisible = computed(() => videoState.videoVisible)
const currentVideoUrl = computed(() => videoState.currentVideoUrl)

// 关闭视频处理
const handleCloseVideo = () => {
  videoService.stopPlaying()
}

// Qverse作品URL - 这里需要替换为实际的作品链接
const qverseUrl = ref(
  'https://test.3dnest.cn/qverse/work/8aZiRFV1iYU?appKey=j8k3d5r7s2m4b9n1v6x8p5q2z'
)

// 标签数据
const tagCategories = ref(dataParserService.getEmptyTagCategories())
const tagStatistics = ref({})

// 场景数据
const scenes = ref([])
const currentScene = ref(null)
const currentViewMode = ref(VIEW_MODES.PANORAMA)

// 导览状态
const guideStatus = reactive({
  playing: false,
  visible: false,
})

// 生命周期钩子
onMounted(() => {
  console.log('BI Dashboard 初始化')
  // 注册MessageSDK事件监听
  setupMessageSDKListeners()
  handleIframeLoad()
})

onUnmounted(() => {
  // 清理连接
  if (messageSDKService.getConnectionStatus()) {
    messageSDKService.disconnect()
  }
})

// MessageSDK事件监听设置
function setupMessageSDKListeners() {
  // 连接成功
  messageSDKService.on('workLoaded', async data => {
    connectionStatus.value = true
    currentViewMode.value = data.mode
    // 连接成功后立即获取数据
    await loadInitialData()
    // 兼容作品加载完成返回的 data与获取所有场景 API 返回的数据类型不一致的情况
    currentScene.value = dataParserService.getSceneFromCache(data.sceneId)
    currentScene.value.mode = data.mode
  })

  messageSDKService.on('modelSwitchComplete', sceneInfo => {
    console.log('场景切换完成:', sceneInfo)
    currentViewMode.value = sceneInfo.mode
  })
}

// iframe加载完成处理
function handleIframeLoad() {
  console.log('Qverse iframe加载完成')
  // iframe加载完成后尝试连接MessageSDK
  if (qverseIframe.value) {
    handleConnect()
  }
}

// 连接处理
async function handleConnect() {
  if (!qverseIframe.value) {
    showError('连接失败', 'Qverse iframe未准备就绪')
    return
  }

  try {
    dataLoading.value = true
    await messageSDKService.connect(
      qverseIframe.value,
      'https://test.3dnest.cn',
      { hide_ui: ['logo', 'title'] }
    )
  } catch (error) {
    console.error('连接失败:', error)
    showError('连接失败', error.message || '无法连接到MessageSDK')
  } finally {
    dataLoading.value = false
  }
}

// 加载初始数据
async function loadInitialData() {
  try {
    dataLoading.value = true

    // 并行获取标签和场景数据(暂时不可使用)
    // const [tags, scenesData] = await Promise.all([
    //   messageSDKService.getTags(),
    //   messageSDKService.getScenes(),
    // ]);

    const tags = await messageSDKService.getTags()
    const scenesData = await messageSDKService.getScenes()

    // 解析标签数据
    tagCategories.value = dataParserService.parseTags(tags)
    tagStatistics.value = dataParserService.getTagStatistics(
      tagCategories.value
    )

    // 解析场景数据
    scenes.value = dataParserService.parseScenes(scenesData)
    if (scenes.value.length > 0) {
      currentScene.value = scenes.value[0]
    }

    console.log('初始数据加载完成:', {
      tagCategories: tagCategories.value,
      tagStatistics: tagStatistics.value,
      scenes: scenes.value,
    })
  } catch (error) {
    console.error('加载数据失败:', error)
    showError('数据加载失败', error.message || '无法获取作品数据')
  } finally {
    dataLoading.value = false
  }
}

// 标签点击处理
async function handleTagClick(tag) {
  if (!connectionStatus.value) {
    showError('操作失败', '请先连接到Qverse作品')
    return
  }

  try {
    console.log('点击标签:', tag)
    await messageSDKService.flyToTag(
      tag.id,
      tag.sceneId || currentScene.value?.id
    )
    if (dataParserService.getTagCategory(tag) === TAG_TYPES.CAMERA) {
      videoService.playCamera(tag.id)
    }
  } catch (error) {
    console.error('飞向标签失败:', error)
    showError('操作失败', '无法飞向指定标签')
  }
}

// 场景切换处理
async function handleSceneChange(scene) {
  if (!connectionStatus.value) {
    showError('操作失败', '请先连接到Qverse作品')
    return
  }

  try {
    console.log('切换场景:', scene)
    await messageSDKService.switchScene(scene.id)
    currentScene.value = scene
  } catch (error) {
    console.error('切换场景失败:', error)
    showError('操作失败', '无法切换到指定场景')
  }
}

// 视图模式切换处理
async function handleViewModeChange(mode) {
  if (!connectionStatus.value) {
    showError('操作失败', '请先连接到Qverse作品')
    return
  }

  try {
    console.log('切换视图模式:', mode)
    await messageSDKService.switchViewMode(mode)
    currentViewMode.value = mode
  } catch (error) {
    console.error('切换视图模式失败:', error)
    showError('操作失败', '无法切换视图模式')
  }
}

// 导览播放处理
async function handleGuidePlay() {
  if (!connectionStatus.value) {
    showError('操作失败', '请先连接到Qverse作品')
    return
  }

  try {
    await messageSDKService.playGuide()
    guideStatus.playing = true
  } catch (error) {
    console.error('播放导览失败:', error)
    showError('操作失败', '无法播放自动导览')
  }
}

// 导览暂停处理
async function handleGuidePause() {
  if (!connectionStatus.value) {
    return
  }

  try {
    await messageSDKService.pauseGuide()
    guideStatus.playing = false
  } catch (error) {
    console.error('暂停导览失败:', error)
    showError('操作失败', '无法暂停自动导览')
  }
}

// 导览显示/隐藏切换
async function handleGuideToggle() {
  if (!connectionStatus.value) {
    showError('操作失败', '请先连接到Qverse作品')
    return
  }

  try {
    if (guideStatus.visible) {
      await messageSDKService.hideGuideBar()
    } else {
      await messageSDKService.showGuideBar()
    }
    guideStatus.visible = !guideStatus.visible
  } catch (error) {
    console.error('切换导览显示失败:', error)
    showError('操作失败', '无法切换导览显示状态')
  }
}

// 错误处理
function showError(title, content) {
  errorMessage.value = { title, content }
  ElNotification({
    title,
    message: content,
    type: 'error',
    duration: 5000,
  })
}

function clearError() {
  errorMessage.value = null
}
</script>

<style lang="less" scoped>
.bi-dashboard {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  // display: flex;
  // flex-direction: column;
  overflow: hidden;
  pointer-events: none;
}

.dashboard-header {
  height: 60px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  pointer-events: auto;
}

.dashboard-main {
  position: relative;
}

.dashboard-left {
  width: 320px;
  height: calc(100vh - 60px);
  position: absolute;
  top: 0;
  left: 0;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow-y: auto;
  pointer-events: auto;
}

.dashboard-center {
  position: absolute;
  top: 0;
  right: 0;
}

.dashboard-right {
  width: 280px;
  height: calc(100vh - 60px);
  position: absolute;
  top: 0;
  right: 0;
  border-left: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow-y: auto;
  pointer-events: auto;
}

.qverse-container {
  width: 100%;
  height: 100%;
}

#qverse-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: var(--bg-primary);
}

.dashboard-footer {
  height: 80px;
  // flex-shrink: 0;
  position: absolute;
  bottom: 0;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  pointer-events: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-left {
    width: 280px;
  }

  .dashboard-right {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    flex-direction: column;
  }

  .dashboard-left,
  .dashboard-right {
    width: 100%;
    height: 200px;
    border: none;
    border-bottom: 1px solid var(--border-color);
  }

  .dashboard-center {
    flex: 1;
    min-height: 300px;
  }
}
</style>
