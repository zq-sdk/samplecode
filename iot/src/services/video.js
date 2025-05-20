// 视频服务用于处理摄像头视频数据获取和播放
import { ref, readonly } from 'vue'

// 存储视频播放状态
const isPlaying = ref(false)
const currentVideoUrl = ref('')
const currentCameraId = ref('')
const videoVisible = ref(false)

// 对外暴露只读状态
const videoState = readonly({
  isPlaying,
  currentVideoUrl,
  currentCameraId,
  videoVisible,
})

/**
 * 显示视频
 * @param {string} url - 视频URL
 * @param {string} cameraId - 摄像头ID
 */
const showVideo = (url, cameraId) => {
  currentVideoUrl.value = url
  currentCameraId.value = cameraId
  videoVisible.value = true
  isPlaying.value = true
}

/**
 * 隐藏视频
 */
const hideVideo = () => {
  videoVisible.value = false
  isPlaying.value = false
}

/**
 * 获取视频信息
 * @param {string} cameraId - 摄像头ID
 * @returns {Promise<{success: boolean, url?: string, error?: string}>} 视频信息
 */
const fetchVideoInfo = async (cameraId) => {
  try {
    // 发起API请求获取视频信息
    const response = await fetch(`https://kvs.3dnest.cn/getMediaInfo`)

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }

    const data = await response.json()

    // 检查API返回的数据结构
    if (
      !data ||
      !data.PlayInfoList ||
      !data.PlayInfoList.PlayInfo ||
      data.PlayInfoList.PlayInfo.length === 0
    ) {
      throw new Error('API返回数据结构不正确或没有可用播放信息')
    }

    // 提取播放地址和其他视频信息
    const playInfo = data.PlayInfoList.PlayInfo[0]

    return {
      success: true,
      url: playInfo.PlayURL, // 视频播放地址
    }
  } catch (error) {
    console.error('获取视频信息失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取视频信息失败',
    }
  }
}

/**
 * 摄像头视频服务类
 */
const videoService = {
  /**
   * 播放摄像头视频
   * @param {string} cameraId - 摄像头ID
   * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>} 播放结果
   */
  async playCamera(cameraId) {
    try {
      // 获取视频信息
      const videoInfo = await fetchVideoInfo(cameraId)

      if (!videoInfo.success) {
        throw new Error(videoInfo.error || '获取视频信息失败')
      }

      // 设置当前视频信息并显示视频
      showVideo(videoInfo.url, cameraId)

      return {
        success: true,
        videoUrl: videoInfo.url,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '播放摄像头视频失败'
      console.error('播放摄像头视频失败:', errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * 停止播放视频
   */
  stopPlaying() {
    hideVideo()
    currentVideoUrl.value = ''
    currentCameraId.value = ''
  },

  /**
   * 获取视频播放状态
   * @returns {{isPlaying: boolean, currentVideoUrl: string, currentCameraId: string, videoVisible: boolean}} 播放状态
   */
  getPlayingStatus() {
    return {
      isPlaying: isPlaying.value,
      currentVideoUrl: currentVideoUrl.value,
      currentCameraId: currentCameraId.value,
      videoVisible: videoVisible.value,
    }
  },

  /**
   * 获取视频状态响应式对象
   * @returns {Readonly<{isPlaying: import('vue').Ref<boolean>, currentVideoUrl: import('vue').Ref<string>, currentCameraId: import('vue').Ref<string>, videoVisible: import('vue').Ref<boolean>}>} 视频状态
   */
  getState() {
    return videoState
  },
}

export { videoService }
