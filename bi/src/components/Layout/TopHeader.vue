<template>
  <div class="top-header">
    <div class="header-left">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <h1 class="dashboard-title">BI 数据面板示例</h1>
      </div>

      <!-- 连接状态指示器 -->
      <div class="connection-status">
        <div
          class="status-indicator"
          :class="connectionStatus ? 'status-normal' : 'status-offline'"
        ></div>
        <span class="status-text">
          {{ connectionStatus ? '作品加载完成' : '作品未加载' }}
        </span>
      </div>
    </div>

    <div class="header-right">
      <div class="guide-controls">
        <!-- 播放/暂停按钮 -->
        <el-button
          :type="guidePlaying ? 'warning' : 'primary'"
          size="large"
          circle
          @click="handleGuideToggle"
        >
          <span class="control-icon">{{ guidePlaying ? '⏸️' : '▶️' }}</span>
        </el-button>

        <!-- 导览信息 -->
        <div class="guide-info">
          <div class="guide-status">
            {{ guidePlaying ? '自动导览中' : '自动导览' }}
          </div>
          <div class="guide-desc">
            {{ guidePlaying ? '点击暂停导览' : '点击开始导览' }}
          </div>
        </div>

        <!-- 导览列表切换 -->
        <el-button type="default" size="small" @click="handleGuideListToggle">
          <span class="list-icon">📋</span>
          <span class="list-text"
            >{{ guideVisible ? '隐藏' : '显示' }}列表</span
          >
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElButton } from 'element-plus'

// Props
const props = defineProps({
  connectionStatus: {
    type: Boolean,
    default: false,
  },
  guidePlaying: {
    type: Boolean,
    default: false,
  },
  guideVisible: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['guide-play', 'guide-pause', 'guide-toggle'])

function handleGuideToggle() {
  if (props.guidePlaying) {
    emit('guide-pause')
  } else {
    emit('guide-play')
  }
}

function handleGuideListToggle() {
  emit('guide-toggle')
}
</script>

<style lang="less" scoped>
.top-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.system-info {
  display: flex;
  align-items: center;
}

.info-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.info-trigger:hover {
  background: var(--bg-tertiary);
}

.info-icon {
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
}

.control-icon {
  font-size: 18px;
}

.guide-info {
  text-align: center;
}

.guide-status {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.guide-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.list-icon {
  margin-right: 4px;
  font-size: 14px;
}

.list-text {
  font-size: 12px;
}

/* Element Plus 按钮样式覆盖 */
:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: var(--gradient-primary);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  border: none;
}

:deep(.el-button--info) {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

:deep(.el-button--info:hover) {
  background: var(--bg-card);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

:deep(.el-button--default) {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

:deep(.el-button--default:hover) {
  background: var(--bg-card);
  border-color: var(--border-color);
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-left {
    gap: 16px;
  }

  .dashboard-title {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .top-header {
    padding: 0 12px;
  }

  .header-center {
    display: none;
  }

  .logo-section {
    gap: 8px;
  }

  .dashboard-title {
    font-size: 16px;
  }

  .control-buttons {
    gap: 4px;
  }

  .system-info {
    display: none;
  }
}
</style>
