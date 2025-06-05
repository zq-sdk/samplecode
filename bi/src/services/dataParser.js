/**
 * 数据解析服务
 * 用于解析标签数据、设备状态等
 */

import {
  TAG_TYPES,
  DEVICE_STATUS,
  VIEW_MODES,
  TAG_MODE_TYPES,
} from '../constants'

class DataParserService {
  constructor() {
    this.tagCache = new Map()
    this.sceneCache = new Map()
  }

  /**
   * 解析标签数据，根据keyword进行分类
   * @param {Array} tags - 原始标签数据
   * @returns {Object} 分类后的标签数据
   */
  parseTags(tags) {
    if (!Array.isArray(tags)) {
      console.warn('标签数据格式错误:', tags)
      return this.getEmptyTagCategories()
    }

    const categories = this.getEmptyTagCategories()

    tags.forEach(tag => {
      try {
        const parsedTag = this.parseTag(tag)
        const category = this.getTagCategory(parsedTag)
        categories[category].push(parsedTag)

        // 缓存标签数据
        this.tagCache.set(parsedTag.id, parsedTag)
      } catch (error) {
        console.error('解析标签失败:', tag, error)
      }
    })

    console.log('标签分类结果:', categories)
    return categories
  }

  /**
   * 解析单个标签
   * @param {Object} tag - 原始标签数据
   * @returns {Object} 解析后的标签数据
   */
  parseTag(tag) {
    const title = tag.content?.title_info?.text || tag.name || `标签_${tag.id}`
    const keyword = tag.keyword || ''

    return {
      id: tag.id,
      uuid: tag.uuid,
      title: title,
      keyword: keyword.toLowerCase(),
      type: tag.content.type || 'unknown',
      location_id: tag.location_id,
      position: tag.position || {},
      quaternion: tag.rotation || {},
      sceneId: tag.scene_id || '',
      mode: tag.model_type ?? TAG_MODE_TYPES.PANORAMA,
      // 解析IoT设备状态（如果是IoT设备）
      iotStatus: this.parseIoTStatus(keyword),
      // 原始数据
      raw: tag,
    }
  }

  /**
   * 根据keyword确定标签类别
   * @param {Object} tag - 解析后的标签数据
   * @returns {string} 标签类别
   */
  getTagCategory(tag) {
    const keyword = tag.keyword.toLowerCase()

    // 根据keyword进行分类
    if (keyword.includes('building')) {
      return TAG_TYPES.BUILDING
    }

    if (keyword.includes('camera')) {
      return TAG_TYPES.CAMERA
    }

    if (keyword.includes('iot') || this.isIoTDevice(keyword)) {
      return TAG_TYPES.IOT
    }

    if (keyword.includes('device')) {
      return TAG_TYPES.DEVICE
    }

    return TAG_TYPES.OTHER
  }

  /**
   * 判断是否为IoT设备
   * @param {string} keyword - 关键词
   * @returns {boolean} 是否为IoT设备
   */
  isIoTDevice(keyword) {
    // 检查是否符合IoT设备状态解析格式：type_deviceId_state
    // eslint-disable-next-line no-useless-escape
    const iotPattern = /^[a-zA-Z]+_[a-zA-Z0-9\-]+_[0-9]+$/
    return iotPattern.test(keyword)
  }

  /**
   * 解析IoT设备状态
   * @param {string} keyword - 关键词
   * @returns {Object|null} IoT状态信息
   */
  parseIoTStatus(keyword) {
    if (!this.isIoTDevice(keyword)) {
      return null
    }

    try {
      // 解析格式：type_deviceId_state (如iot_CV-05126_1表示异常状态)
      const parts = keyword.split('_')
      if (parts.length !== 3) {
        return null
      }

      const [type, deviceId, stateStr] = parts
      const state = parseInt(stateStr, 10)

      return {
        type: type,
        deviceId: deviceId,
        state: state,
        statusText: this.getStatusText(state),
        statusClass: this.getStatusClass(state),
      }
    } catch (error) {
      console.error('解析IoT状态失败:', keyword, error)
      return null
    }
  }

  /**
   * 获取状态文本
   * @param {number} state - 状态码
   * @returns {string} 状态文本
   */
  getStatusText(state) {
    switch (state) {
      case DEVICE_STATUS.NORMAL:
        return '正常'
      case DEVICE_STATUS.WARNING:
        return '警告'
      default:
        return '未知'
    }
  }

  /**
   * 获取状态样式类
   * @param {number} state - 状态码
   * @returns {string} 样式类名
   */
  getStatusClass(state) {
    switch (state) {
      case DEVICE_STATUS.NORMAL:
        return 'status-normal'
      case DEVICE_STATUS.WARNING:
        return 'status-warning'
      default:
        return 'status-unknown'
    }
  }

  /**
   * 解析场景数据
   * @param {Array} scenes - 原始场景数据
   * @returns {Array} 解析后的场景数据
   */
  parseScenes(scenes) {
    if (!Array.isArray(scenes)) {
      console.warn('场景数据格式错误:', scenes)
      return []
    }

    return scenes.map(scene => {
      const parsedScene = {
        id: scene.sceneId,
        name: scene.name || `场景_${scene.id}`,
        type: scene.type || 'unknown',
        modelId: scene.modelId || '',
        mode: scene.mode || VIEW_MODES.PANORAMA,
        // entryInfo: scene.entryInfo || {},
        raw: scene,
      }

      // 缓存场景数据
      this.sceneCache.set(parsedScene.id, parsedScene)

      return parsedScene
    })
  }

  /**
   * 获取空的标签分类对象
   * @returns {Object} 空的标签分类
   */
  getEmptyTagCategories() {
    return {
      [TAG_TYPES.BUILDING]: [],
      [TAG_TYPES.DEVICE]: [],
      [TAG_TYPES.IOT]: [],
      [TAG_TYPES.CAMERA]: [],
      [TAG_TYPES.OTHER]: [],
    }
  }

  /**
   * 根据类型获取标签统计
   * @param {Object} categories - 分类后的标签数据
   * @returns {Object} 统计信息
   */
  getTagStatistics(categories) {
    const stats = {}

    Object.keys(categories).forEach(type => {
      const tags = categories[type]
      stats[type] = {
        total: tags.length,
        normal: 0,
        warning: 0,
      }

      // 统计IoT设备状态
      if (type === TAG_TYPES.IOT) {
        tags.forEach(tag => {
          if (tag.iotStatus) {
            switch (tag.iotStatus.state) {
              case DEVICE_STATUS.NORMAL:
                stats[type].normal++
                break
              case DEVICE_STATUS.WARNING:
                stats[type].warning++
                break
            }
          }
        })
      }
    })

    return stats
  }

  /**
   * 从缓存获取标签
   * @param {string} tagId - 标签ID
   * @returns {Object|null} 标签数据
   */
  getTagFromCache(tagId) {
    return this.tagCache.get(tagId) || null
  }

  /**
   * 从缓存获取场景
   * @param {string} sceneId - 场景ID
   * @returns {Object|null} 场景数据
   */
  getSceneFromCache(sceneId) {
    return this.sceneCache.get(sceneId) || null
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.tagCache.clear()
    this.sceneCache.clear()
  }

  /**
   * 搜索标签
   * @param {Object} categories - 分类后的标签数据
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 搜索结果
   */
  searchTags(categories, keyword) {
    if (!keyword || keyword.trim() === '') {
      return []
    }

    const searchTerm = keyword.toLowerCase().trim()
    const results = []

    Object.values(categories).forEach(tagList => {
      tagList.forEach(tag => {
        if (
          tag.title.toLowerCase().includes(searchTerm) ||
          tag.keyword.toLowerCase().includes(searchTerm) ||
          (tag.iotStatus &&
            tag.iotStatus.deviceId.toLowerCase().includes(searchTerm))
        ) {
          results.push(tag)
        }
      })
    })

    return results
  }
}

// 创建单例实例
const dataParserService = new DataParserService()

export default dataParserService
