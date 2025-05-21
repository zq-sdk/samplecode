import {
  CAMERA_VIDEO_MODE_ENUM,
  DEFAULT_KEYWORD_SEPARATOR,
  DEVICE_DATA_DISPLAY_TYPE_ENUM,
  DEVICE_STATE_ENUM,
  IOT_TYPE_ENUM,
} from '@/constants'
import logger from './logger'

/**
 * @typedef {Object} KeywordParseResult
 * @property {string} type - IoT 类型
 * @property {string} deviceId - 设备 ID
 * @property {number|string} [mode] - 设备模式或其他参数
 */

/**
 * IoT 数据适配器
 * 负责处理 IoT 数据的转换和适配
 */
class IotDataAdapter {
  /**
   * 解析标签关键字
   * @param {string} keyword - 标签关键字
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Array} 解析后的关键字数组
   */
  static parseKeyword(keyword, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!keyword) {
      return []
    }
    return keyword.split(separator)
  }

  /**
   * 解析标签关键字并返回结构化数据
   * @param {string} keyword - 标签关键字
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {KeywordParseResult} 解析结果
   */
  static parseKeywordToStructure(
    keyword,
    separator = DEFAULT_KEYWORD_SEPARATOR
  ) {
    const parts = this.parseKeyword(keyword, separator)
    const type = (parts[0] || '').toLowerCase()

    return {
      type,
      deviceId: parts[1] || '',
      mode: parts[2] || '',
    }
  }

  /**
   * 从标签数据中提取 IoT 类型
   * @param {Object} tag - 标签数据
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {string} IoT 类型
   */
  static extractIotType(tag, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!tag || !tag.keyword) {
      return 'others'
    }
    const result = this.parseKeywordToStructure(tag.keyword, separator)
    return result.type || 'others'
  }

  /**
   * 从标签数据中提取设备 ID
   * @param {Object} tag - 标签数据
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {string} 设备 ID
   */
  static extractDeviceId(tag, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!tag || !tag.keyword) {
      return ''
    }
    const result = this.parseKeywordToStructure(tag.keyword, separator)
    return result.deviceId || ''
  }

  /**
   * 从标签数据中提取模式
   * @param {Object} tag - 标签数据
   * @param {number} defaultMode - 默认模式
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {number} 模式
   */
  static extractMode(tag, defaultMode, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!tag || !tag.keyword) {
      return defaultMode
    }
    const result = this.parseKeywordToStructure(tag.keyword, separator)
    return parseInt(result.mode || defaultMode)
  }

  /**
   * 从标签数据中提取完整的 IoT 数据
   * @param {Object} tag - 标签数据
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Object} IoT 数据
   */
  static extractTagIotData(tag, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!tag || !tag.keyword) {
      return {
        type: 'others',
        deviceId: '',
        name: tag?.content?.title_info?.text || '',
        isIotTag: false,
      }
    }

    const result = this.parseKeywordToStructure(tag.keyword, separator)
    const iotData = {
      type: result.type || 'others',
      deviceId: result.deviceId || '',
      name: tag.content?.title_info?.text || '',
      isIotTag: [IOT_TYPE_ENUM.IOT, IOT_TYPE_ENUM.CAMERA].includes(result.type),
    }

    // 处理摄像头类型
    if (iotData.type === IOT_TYPE_ENUM.CAMERA) {
      iotData.mode = parseInt(result.mode || CAMERA_VIDEO_MODE_ENUM.VOD)
    }

    // 处理IoT设备类型
    if (iotData.type === IOT_TYPE_ENUM.IOT) {
      iotData.state = DEVICE_STATE_ENUM.NORMAL
    }

    return iotData
  }

  /**
   * 从 2D 物品数据中提取信息
   * @param {Object} put2dItem - 2D 物品数据
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Object} 提取的信息
   */
  static extractPut2dInfo(put2dItem, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!put2dItem || !put2dItem.title) {
      return { type: '', deviceId: '', mode: 0 }
    }

    const result = this.parseKeywordToStructure(put2dItem.title, separator)
    return {
      type: result.type,
      deviceId: result.deviceId,
      mode: parseInt(result.mode || DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS),
    }
  }

  /**
   * 格式化 2D 物品数据
   * @param {Object} put2dItem - 2D 物品数据
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Object} 格式化后的 2D 物品数据
   */
  static formatPut2dData(put2dItem, separator = DEFAULT_KEYWORD_SEPARATOR) {
    if (!put2dItem) {
      return null
    }

    const extractedInfo = this.extractPut2dInfo(put2dItem, separator)

    return {
      id: put2dItem.id,
      deviceId: extractedInfo.deviceId,
      type: extractedInfo.type,
      mode: extractedInfo.mode,
      locationId: put2dItem.location_id ?? undefined,
      position: put2dItem.position,
      position3D: put2dItem.camera_position_3d,
      quaternion: put2dItem.quaternion,
      quaternion3d: put2dItem.camera_quaternion_3d,
      scale: put2dItem.scale,
      width: put2dItem.width / 1000,
      height: put2dItem.height / 1000,
    }
  }

  /**
   * 批量处理 2D 物品数据
   * @param {Array} put2dList - 2D 物品列表
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Object} 格式化后的 2D 物品数据映射（id -> 数据）
   */
  static processPut2dList(
    put2dList = [],
    separator = DEFAULT_KEYWORD_SEPARATOR
  ) {
    if (!Array.isArray(put2dList)) {
      logger.error('processPut2dList: put2dList 必须是数组', { put2dList })
      return {}
    }

    if (put2dList.length === 0) {
      return {}
    }

    logger.debug('开始处理 2D 物品数据', { count: put2dList.length })

    const result = Object.create(null)

    try {
      for (let i = 0; i < put2dList.length; i++) {
        const item = put2dList[i]
        if (item && item.id) {
          const formattedData = this.formatPut2dData(item, separator)
          if (formattedData) {
            result[item.id] = formattedData
          }
        }
      }

      logger.debug('2D 物品数据处理完成', {
        processedCount: Object.keys(result).length,
      })
      return result
    } catch (error) {
      logger.error('处理 2D 物品数据时发生错误', { error: error.message })
      return {}
    }
  }
  /**
   * 批量处理标签数据
   * @param {Array} tagList - 标签列表
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   * @returns {Object} 处理结果，包含 iotTags、normalTags 和 tagMap
   */
  static processTagList(tagList = [], separator = DEFAULT_KEYWORD_SEPARATOR) {
    const defaultResult = {
      iotTags: {},
      normalTags: [],
      tagMap: {},
      deviceMap: {},
    }
    if (!Array.isArray(tagList)) {
      logger.error('processTagList: tagList 必须是数组', { tagList })
      return defaultResult
    }

    if (tagList.length === 0) {
      logger.debug('标签数据为空', { tagList })
      return defaultResult
    }

    logger.debug('开始处理标签数据', { count: tagList.length })

    const result = {
      iotTags: Object.create(null), // id -> 标签数据（IoT标签）
      normalTags: [], // 普通标签列表
      tagMap: Object.create(null), // 标签ID -> 设备ID 映射
      deviceMap: Object.create(null), // 设备ID -> 标签ID 映射
    }

    try {
      tagList.forEach(tag => {
        const iotData = this.extractTagIotData(tag, separator)

        if (iotData.isIotTag) {
          // 处理 IoT 标签
          result.iotTags[tag.id] = { ...tag, iotData, isIotTag: true }

          // 设置映射关系
          if (iotData.deviceId) {
            result.tagMap[tag.id] = iotData.deviceId
            result.deviceMap[iotData.deviceId] = tag.id
          }
        } else {
          // 处理普通标签
          result.normalTags.push({ ...tag, isIotTag: false })
        }
      })

      return result
    } catch (error) {
      logger.error('处理标签数据时发生错误', { error: error.message })
      return defaultResult
    }
  }

  /**
   * 验证 IoT 数据
   * @param {Object} data - 要验证的数据
   * @returns {Object} 验证结果，包含 isValid 和 errors
   */
  static validateIotData(data) {
    // 输入参数验证
    if (!data || typeof data !== 'object') {
      logger.error('validateIotData: data 必须是对象', { data })
      return Object.freeze({
        isValid: false,
        errors: Object.freeze(['数据必须是对象']),
      })
    }

    const errors = []

    try {
      // 验证设备 ID
      if (!data.deviceId || typeof data.deviceId !== 'string') {
        errors.push('设备ID不能为空且必须是字符串')
      }

      // 验证设备类型
      if (!data.type || typeof data.type !== 'string') {
        errors.push('设备类型不能为空且必须是字符串')
      }

      // 验证摄像头模式
      if (
        data.type === IOT_TYPE_ENUM.CAMERA &&
        (data.mode === undefined || data.mode === null)
      ) {
        errors.push('摄像头模式不能为空')
      }

      // 验证摄像头模式值
      if (data.type === IOT_TYPE_ENUM.CAMERA && data.mode !== undefined) {
        const validModes = Object.values(CAMERA_VIDEO_MODE_ENUM)
        if (!validModes.includes(data.mode)) {
          errors.push(`摄像头模式值无效，支持的值: ${validModes.join(', ')}`)
        }
      }

      // 验证IoT设备状态
      if (data.type === IOT_TYPE_ENUM.IOT && data.state !== undefined) {
        const validStates = Object.values(DEVICE_STATE_ENUM)
        if (!validStates.includes(data.state)) {
          errors.push(`设备状态值无效，支持的值: ${validStates.join(', ')}`)
        }
      }

      const result = {
        isValid: errors.length === 0,
        errors: Object.freeze(errors),
      }

      // 冻结结果对象
      Object.freeze(result)

      if (!result.isValid) {
        logger.warn('IoT 数据验证失败', { data, errors })
      }

      return result
    } catch (error) {
      logger.error('验证 IoT 数据时发生错误', { error: error.message, data })
      return Object.freeze({
        isValid: false,
        errors: Object.freeze(['验证过程中发生错误']),
      })
    }
  }
}

export default IotDataAdapter
