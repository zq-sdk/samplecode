<template>
  <div class="right-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h2 class="panel-title">安全检测</h2>
    </div>

    <!-- 安全状态概览 -->
    <div class="security-overview">
      <div class="overview-grid">
        <div class="overview-item normal">
          <div class="overview-icon">✅</div>
          <div class="overview-content">
            <div class="overview-value">{{ securityStats.normal }}</div>
            <div class="overview-label">正常设备</div>
          </div>
        </div>

        <div class="overview-item warning">
          <div class="overview-icon">⚠️</div>
          <div class="overview-content">
            <div class="overview-value">{{ securityStats.warning }}</div>
            <div class="overview-label">告警设备</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视图模式切换 -->
    <div class="view-mode-section">
      <div class="section-title">视图模式</div>
      <div class="view-mode-buttons">
        <el-button
          v-for="mode in viewModes"
          :key="mode.value"
          :type="props.viewMode === mode.value ? 'primary' : 'default'"
          size="small"
          @click="handleViewModeChange(mode.value)"
        >
          <span class="mode-label">{{ mode.label }}</span>
        </el-button>
      </div>
    </div>

    <!-- 场景列表 -->
    <div class="scenes-section">
      <div class="section-title">场景切换</div>
      <el-scrollbar class="scenes-scrollbar">
        <div class="scenes-list">
          <div
            v-for="scene in scenes"
            :key="scene.id"
            class="scene-item"
            :class="{ active: currentScene?.id === scene.id }"
            @click="handleSceneChange(scene)"
          >
            <div class="scene-info">
              <div class="scene-name">{{ scene.name }}</div>
              <div class="scene-meta">
                <span class="scene-type">{{
                  SCENE_TYPES_LABELS[scene.type]
                }}</span>
              </div>
            </div>
            <div class="scene-actions">
              <span
                v-if="currentScene?.id === scene.id"
                class="current-indicator"
              >
                ✓
              </span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- IoT设备告警列表 -->
    <div class="alerts-section">
      <div class="section-title">
        <span>设备告警</span>
        <span class="alert-count" v-if="alertDevices.length > 0">
          ({{ alertDevices.length }})
        </span>
      </div>
      <el-scrollbar class="alerts-scrollbar">
        <div class="alerts-list">
          <div
            v-for="device in alertDevices"
            :key="device.id"
            class="alert-item"
            :class="device.iotStatus?.statusClass"
            @click="handleDeviceClick(device)"
          >
            <div class="alert-info">
              <div class="alert-title">{{ device.title }}</div>
              <div class="alert-meta">
                <span class="device-id">{{ device.iotStatus?.deviceId }}</span>
                <span class="alert-time">{{ formatTime(new Date()) }}</span>
              </div>
            </div>
            <div class="alert-status">
              <div
                class="status-indicator"
                :class="device.iotStatus?.statusClass"
              ></div>
              <span class="status-text">{{
                device.iotStatus?.statusText
              }}</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="alertDevices.length === 0" class="empty-alerts">
            <div class="empty-icon">🛡️</div>
            <div class="empty-text">暂无告警</div>
            <div class="empty-desc">所有设备运行正常</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElButton, ElScrollbar } from 'element-plus'
import {
  DEVICE_STATUS,
  VIEW_MODES,
  VIEW_MODES_LABELS,
  SCENE_TYPES_LABELS,
} from '../../constants'

// Props
const props = defineProps({
  scenes: {
    type: Array,
    default: () => [],
  },
  currentScene: {
    type: Object,
    default: null,
  },
  viewMode: {
    type: String,
    default: VIEW_MODES.PANORAMA,
  },
  // 从父组件传入的标签分类数据，用于计算告警设备
  tagCategories: {
    type: Object,
    default: () => ({
      iot: [],
    }),
  },
})

// Emits
const emit = defineEmits(['scene-change', 'view-mode-change', 'device-click'])

// 响应式数据
// const currentViewMode = ref(props.viewMode);
// const currentViewMode = computed(() => props.currentScene?.mode);

// 视图模式配置
const viewModes = [
  {
    value: VIEW_MODES.PANORAMA,
    label: VIEW_MODES_LABELS[VIEW_MODES.PANORAMA],
  },
  {
    value: VIEW_MODES.DOLLHOUSE,
    label: VIEW_MODES_LABELS[VIEW_MODES.DOLLHOUSE],
  },
  {
    value: VIEW_MODES.FLOORPLAN,
    label: VIEW_MODES_LABELS[VIEW_MODES.FLOORPLAN],
  },
]

// 计算属性
const securityStats = computed(() => {
  const iotDevices = props.tagCategories?.iot || []
  const stats = {
    normal: 0,
    warning: 0,
  }

  iotDevices.forEach(device => {
    if (device.iotStatus) {
      switch (device.iotStatus.state) {
        case DEVICE_STATUS.NORMAL:
          stats.normal++
          break
        case DEVICE_STATUS.WARNING:
          stats.warning++
          break
      }
    }
  })

  return stats
})

const alertDevices = computed(() => {
  const iotDevices = props.tagCategories?.iot || []
  return iotDevices.filter(device => {
    return device.iotStatus && device.iotStatus.state === DEVICE_STATUS.WARNING
  })
})

function handleSceneChange(scene) {
  emit('scene-change', scene)
}

function handleViewModeChange(mode) {
  emit('view-mode-change', mode)
}

function handleDeviceClick(device) {
  emit('device-click', device)
}

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style lang="less" scoped>
.right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.security-overview {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
}

.overview-item.normal {
  border-color: var(--success-color);
  background: rgba(82, 196, 26, 0.1);
}

.overview-item.warning {
  border-color: var(--warning-color);
  background: rgba(250, 173, 20, 0.1);
}

.overview-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.overview-label {
  font-size: 12px;
  color: var(--text-muted);
}

.view-mode-section,
.scenes-section,
.alerts-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-count {
  color: var(--error-color);
  font-size: 12px;
}

.view-mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-mode-buttons .el-button {
  justify-content: flex-start;
  padding: 8px 12px;
}

.mode-icon {
  margin-right: 8px;
  font-size: 14px;
}

.mode-label {
  font-size: 13px;
}

.scenes-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.scenes-scrollbar {
  flex: 1;
}

.scenes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scene-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-card);
}

.scene-item.active {
  border-color: var(--primary-color);
  background: rgba(24, 144, 255, 0.1);
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.scene-type {
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 3px;
}

.scene-actions {
  flex-shrink: 0;
}

.current-indicator {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
}

.alerts-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.alerts-scrollbar {
  flex: 1;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-item:hover {
  background: var(--bg-card);
  transform: translateX(-2px);
}

.alert-item.status-warning {
  border-color: var(--warning-color);
  background: rgba(250, 173, 20, 0.1);
}

.alert-item.status-error {
  border-color: var(--error-color);
  background: rgba(255, 77, 79, 0.1);
}

.alert-info {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.device-id,
.alert-time {
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 3px;
}

.alert-status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.empty-alerts {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* Element Plus 样式覆盖 */
:deep(.el-button) {
  width: 100%;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: var(--gradient-primary);
  border: none;
}

:deep(.el-button--default) {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

:deep(.el-button--default:hover) {
  background: var(--bg-card);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

:deep(.el-button--text) {
  color: var(--text-secondary);
}

:deep(.el-button--text:hover) {
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .panel-header {
    padding: 12px 16px;
  }

  .security-overview,
  .view-mode-section,
  .scenes-section,
  .alerts-section {
    padding: 12px 16px;
  }

  .overview-grid {
    gap: 8px;
  }

  .overview-item {
    padding: 8px;
  }
}
</style>
