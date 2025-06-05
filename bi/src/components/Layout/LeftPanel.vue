<template>
  <div class="left-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h2 class="panel-title">资产管理</h2>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备、标签..."
        size="small"
        clearable
      >
        <template #prefix> 🔍 </template>
      </el-input>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ totalAssets }}</div>
          <div class="stat-label">总资产</div>
        </div>
      </div>
    </div>

    <!-- 标签分类列表 -->
    <div class="content-section">
      <el-scrollbar class="scrollbar-container">
        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div class="section-title">搜索结果</div>
          <div class="tag-list">
            <div
              v-for="tag in searchResults"
              :key="tag.id"
              class="tag-item"
              @click="handleTagClick(tag)"
            >
              <div class="tag-info">
                <div class="tag-title">{{ tag.title }}</div>
                <div class="tag-meta">
                  <span class="tag-type">{{ getTagTypeLabel(tag) }}</span>
                  <span
                    v-if="tag.iotStatus"
                    class="tag-status"
                    :class="tag.iotStatus.statusClass"
                  >
                    {{ tag.iotStatus.statusText }}
                  </span>
                </div>
              </div>
              <div class="tag-actions">
                <span class="action-icon">📍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 楼宇资产 -->
        <div v-if="!searchKeyword" class="asset-category">
          <div class="category-header" @click="toggleCategory('building')">
            <div class="category-title">
              <span class="category-icon">🏢</span>
              <span>楼宇资产</span>
              <span class="category-count"
                >({{ tagCategories.building.length }})</span
              >
            </div>
            <div
              class="category-toggle"
              :class="{ expanded: expandedCategories.building }"
            >
              ▼
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="expandedCategories.building" class="category-content">
              <div
                v-for="tag in tagCategories.building"
                :key="tag.id"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
                <div class="tag-info">
                  <div class="tag-title">{{ tag.title }}</div>
                  <div class="tag-meta">
                    <span class="tag-keyword">{{ tag.keyword }}</span>
                  </div>
                </div>
                <div class="tag-actions">
                  <span class="action-icon">📍</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 设备资产 -->
        <div v-if="!searchKeyword" class="asset-category">
          <div class="category-header" @click="toggleCategory('device')">
            <div class="category-title">
              <span class="category-icon">⚙️</span>
              <span>设备资产</span>
              <span class="category-count"
                >({{ tagCategories.device.length }})</span
              >
            </div>
            <div
              class="category-toggle"
              :class="{ expanded: expandedCategories.device }"
            >
              ▼
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="expandedCategories.device" class="category-content">
              <div
                v-for="tag in tagCategories.device"
                :key="tag.id"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
                <div class="tag-info">
                  <div class="tag-title">{{ tag.title }}</div>
                  <div class="tag-meta">
                    <span class="tag-keyword">{{ tag.keyword }}</span>
                  </div>
                </div>
                <div class="tag-actions">
                  <span class="action-icon">📍</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- IoT设备 -->
        <div v-if="!searchKeyword" class="asset-category">
          <div class="category-header" @click="toggleCategory('iot')">
            <div class="category-title">
              <span class="category-icon">🌐</span>
              <span>IoT设备</span>
              <span class="category-count"
                >({{ tagCategories.iot.length }})</span
              >
            </div>
            <div
              class="category-toggle"
              :class="{ expanded: expandedCategories.iot }"
            >
              ▼
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="expandedCategories.iot" class="category-content">
              <div
                v-for="tag in tagCategories.iot"
                :key="tag.id"
                class="tag-item iot-item"
                @click="handleTagClick(tag)"
              >
                <div class="tag-info">
                  <div class="tag-title">{{ tag.title }}</div>
                  <div class="tag-meta">
                    <span class="device-id">{{ tag.iotStatus?.deviceId }}</span>
                    <span
                      v-if="tag.iotStatus"
                      class="tag-status"
                      :class="tag.iotStatus.statusClass"
                    >
                      {{ tag.iotStatus.statusText }}
                    </span>
                  </div>
                </div>
                <div class="tag-actions">
                  <div
                    class="status-indicator"
                    :class="tag.iotStatus?.statusClass"
                  ></div>
                  <span class="action-icon">📍</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 摄像头监控 -->
        <div v-if="!searchKeyword" class="asset-category">
          <div class="category-header" @click="toggleCategory('camera')">
            <div class="category-title">
              <span class="category-icon">📹</span>
              <span>摄像头监控</span>
              <span class="category-count"
                >({{ tagCategories.camera.length }})</span
              >
            </div>
            <div
              class="category-toggle"
              :class="{ expanded: expandedCategories.camera }"
            >
              ▼
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="expandedCategories.camera" class="category-content">
              <div
                v-for="tag in tagCategories.camera"
                :key="tag.id"
                class="tag-item camera-item"
                @click="handleTagClick(tag)"
              >
                <div class="tag-info">
                  <div class="tag-title">{{ tag.title }}</div>
                  <div class="tag-meta">
                    <span class="camera-type">{{ getCameraType(tag) }}</span>
                  </div>
                </div>
                <div class="tag-actions">
                  <span class="camera-status">🟢</span>
                  <span class="action-icon">📍</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 其他标签 -->
        <div
          v-if="!searchKeyword && tagCategories.other.length > 0"
          class="asset-category"
        >
          <div class="category-header" @click="toggleCategory('other')">
            <div class="category-title">
              <span class="category-icon">📋</span>
              <span>其他标签</span>
              <span class="category-count"
                >({{ tagCategories.other.length }})</span
              >
            </div>
            <div
              class="category-toggle"
              :class="{ expanded: expandedCategories.other }"
            >
              ▼
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="expandedCategories.other" class="category-content">
              <div
                v-for="tag in tagCategories.other"
                :key="tag.id"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
                <div class="tag-info">
                  <div class="tag-title">{{ tag.title }}</div>
                  <div class="tag-meta">
                    <span class="tag-keyword">{{ tag.keyword }}</span>
                  </div>
                </div>
                <div class="tag-actions">
                  <span class="action-icon">📍</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && !hasData" class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无数据</div>
          <div class="empty-desc">请先连接到Qverse作品</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  ElInput,
  ElButton,
  ElScrollbar,
  ElCollapseTransition,
} from 'element-plus'
import { TAG_TYPES } from '../../constants'
import dataParserService from '../../services/dataParser.js'

// Props
const props = defineProps({
  tagCategories: {
    type: Object,
    default: () => ({
      building: [],
      device: [],
      iot: [],
      camera: [],
      other: [],
    }),
  },
  tagStatistics: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['tag-click'])

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref([])
const expandedCategories = ref({
  building: true,
  device: true,
  iot: true,
  camera: true,
  other: false,
})

// 计算属性
const hasConnection = computed(() => {
  return Object.values(props.tagCategories).some(tags => tags.length > 0)
})

const hasData = computed(() => {
  return Object.values(props.tagCategories).some(tags => tags.length > 0)
})

const totalAssets = computed(() => {
  return Object.values(props.tagCategories).reduce(
    (total, tags) => total + tags.length,
    0
  )
})

// 监听搜索关键词变化
watch(searchKeyword, newKeyword => {
  if (newKeyword.trim()) {
    searchResults.value = dataParserService.searchTags(
      props.tagCategories,
      newKeyword
    )
  } else {
    searchResults.value = []
  }
})

function handleTagClick(tag) {
  emit('tag-click', tag)
}

function toggleCategory(category) {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

function getTagTypeLabel(tag) {
  const typeLabels = {
    [TAG_TYPES.BUILDING]: '楼宇',
    [TAG_TYPES.DEVICE]: '设备',
    [TAG_TYPES.IOT]: 'IoT',
    [TAG_TYPES.CAMERA]: '摄像头',
    [TAG_TYPES.OTHER]: '其他',
  }

  // 根据tag的分类确定类型
  for (const [type, tags] of Object.entries(props.tagCategories)) {
    if (tags.some(t => t.id === tag.id)) {
      return typeLabels[type] || '未知'
    }
  }

  return '未知'
}

function getCameraType(tag) {
  const keyword = tag.keyword.toLowerCase()
  if (keyword.includes('indoor') || keyword.includes('室内')) {
    return '室内摄像头'
  }
  if (keyword.includes('outdoor') || keyword.includes('室外')) {
    return '室外摄像头'
  }
  return '摄像头'
}
</script>

<style lang="less" scoped>
.left-panel {
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

.search-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.statistics-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.stats-grid {
  // display: grid;
  // grid-template-columns: repeat(2, 1fr);
  // gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.content-section {
  flex: 1;
  min-height: 0;
}

.scrollbar-container {
  height: 100%;
}

.search-results {
  padding: 16px 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.asset-category {
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.category-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.category-header:hover {
  background: var(--bg-tertiary);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.category-icon {
  font-size: 16px;
}

.category-count {
  color: var(--text-muted);
  font-size: 12px;
}

.category-toggle {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.category-toggle.expanded {
  transform: rotate(180deg);
}

.category-content {
  background: var(--bg-primary);
}

.tag-list,
.category-content {
  .tag-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-light);
  }

  .tag-item:hover {
    background: var(--bg-card);
    transform: translateX(4px);
  }

  .tag-item:last-child {
    border-bottom: none;
  }
}

.tag-info {
  flex: 1;
  min-width: 0;
}

.tag-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tag-type,
.tag-keyword,
.device-id,
.camera-type {
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.tag-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.tag-item:hover .action-icon {
  opacity: 1;
}

.camera-status {
  font-size: 12px;
}

.iot-item .tag-actions {
  align-items: center;
}

.empty-state {
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
:deep(.el-input__wrapper) {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
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

  .search-section,
  .statistics-section {
    padding: 12px 16px;
  }

  .category-header {
    padding: 12px 16px;
  }

  .tag-item {
    padding: 10px 16px;
  }
}
</style>
