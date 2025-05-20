<template>
  <div class="video-player-container" v-show="visible">
    <div class="video-player-wrapper">
      <div id="J_prismPlayer" class="video-player"></div>
      <div class="player-controls">
        <button class="close-btn" @click="closePlayer">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

/**
 * @typedef {Object} AliPlayer
 * @property {Function} dispose - 销毁播放器的方法
 */

/** @type {AliPlayer|null} */
let player = null

/**
 * 初始化播放器
 * @param {string} url - 视频URL
 */
const initPlayer = (url) => {
  if (!url) return

  // 销毁可能存在的播放器实例
  destroyPlayer()

  // 初始化播放器
  player = new Aliplayer(
    {
      id: 'J_prismPlayer',
      width: '100%',
      height: '100%',
      mute: true,
      rePlay: true,
      autoplay: true,
      isLive: false,
      skinLayout: false,
      source: url,
      // 可根据需要配置其他选项
      // license: {
      //   domain: window.location.hostname,
      //   key: 'your-license-key', // 需要替换为实际的License Key
      // },
    },
    /**
     * 播放器创建回调
     * @param {AliPlayer} playerInstance - 播放器实例
     */
    function (playerInstance) {
      console.log('播放器创建成功')
    }
  )
}

/**
 * 销毁播放器实例
 */
const destroyPlayer = () => {
  if (player) {
    player.dispose()
    player = null
  }
}

/**
 * 关闭播放器
 */
const closePlayer = () => {
  emit('close')
}

// 监听videoUrl变化
watch(
  () => props.videoUrl,
  (newUrl) => {
    if (props.visible && newUrl) {
      initPlayer(newUrl)
    }
  }
)

// 监听visible变化
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && props.videoUrl) {
      initPlayer(props.videoUrl)
    } else {
      destroyPlayer()
    }
  }
)

onMounted(() => {
  if (props.visible && props.videoUrl) {
    initPlayer(props.videoUrl)
  }
})

onBeforeUnmount(() => {
  destroyPlayer()
})
</script>

<style scoped>
.video-player-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}

.video-player-wrapper {
  position: relative;
  width: 90%;
  height: 90%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
}

.player-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.close-btn {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
