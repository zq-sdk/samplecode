import { IOT_TYPE_ENUM } from '@/constants'
import IotDataAdapter from './iotDataAdapter'
import logger from './logger'

/**
 * @typedef {Object} IotData
 * @property {string} type - 设备类型
 * @property {string} deviceId - 设备ID
 * @property {string} name - 设备名称
 * @property {number} [mode] - 摄像头模式（点播/直播）
 * @property {number} [state] - 设备状态（正常/异常）
 */

/**
 * @typedef {Object} TagData
 * @property {string} id - 标签ID
 * @property {string} keyword - 标签关键字
 * @property {Object} content - 标签内容
 * @property {boolean} isIotTag - 是否为IoT标签
 * @property {IotData} [iotData] - IoT设备数据
 */

/**
 * @typedef {Object} Put2dData
 * @property {string} id - 2D物品ID
 * @property {string} deviceId - 设备ID
 * @property {string} type - 设备类型
 * @property {number} mode - 显示模式
 * @property {string} [locationId] - 位置ID
 * @property {Object} position - 位置信息
 * @property {Object} position3D - 3D位置信息
 * @property {Object} quaternion - 四元数
 * @property {Object} quaternion3d - 3D四元数
 * @property {Object} scale - 缩放信息
 * @property {number} width - 宽度
 * @property {number} height - 高度
 */

/**
 * @typedef {Object} TypedTagList
 * @property {Object.<string, TagData>} tag - 标签数据映射
 * @property {Object.<string, Put2dData>} put2d - 2D物品数据映射
 */

/**
 * IoT 数据管理器
 * 负责管理和处理 IoT 设备数据
 */
class IotDataManager {
  constructor() {
    // 私有状态
    this._data = {
      formattedTagList: [],
      tagPluginDataList: {},
      typedTagList: {
        tag: {},
        put2d: {},
      },
      iotIdMap: {},
      iotTagIdMap: {},
      normalTagList: [],
      iotTagList: [],
    }

    // 缓存配置
    this._cacheConfig = {
      maxSize: 100, // 最大缓存条目数
      expireTime: 300000, // 缓存过期时间（毫秒）
      enabled: true, // 是否启用缓存
    }

    // 缓存
    this._iotTagTypeCache = [IOT_TYPE_ENUM.IOT, IOT_TYPE_ENUM.CAMERA]
    this._typedTagDataCache = null

    // LRU 缓存
    this._cache = {
      data: new Map(), // 缓存数据
      keys: [], // 按访问顺序排列的键
      timestamps: new Map(), // 缓存时间戳
    }
  }

  /**
   * 设置缓存配置
   * @param {Object} config - 缓存配置
   * @param {number} [config.maxSize] - 最大缓存条目数
   * @param {number} [config.expireTime] - 缓存过期时间（毫秒）
   * @param {boolean} [config.enabled] - 是否启用缓存
   */
  setCacheConfig(config = {}) {
    this._cacheConfig = {
      ...this._cacheConfig,
      ...config,
    }

    // 如果禁用缓存，清空所有缓存
    if (!this._cacheConfig.enabled) {
      this.clearCache()
    }
  }

  /**
   * 获取缓存配置
   * @returns {Object} 缓存配置
   */
  getCacheConfig() {
    return { ...this._cacheConfig }
  }

  /**
   * 从缓存中获取数据
   * @param {string} key - 缓存键
   * @returns {*} 缓存数据，如果不存在或已过期则返回 null
   * @private
   */
  _getFromCache(key) {
    if (!this._cacheConfig.enabled) {
      return null
    }

    // 检查缓存是否存在
    if (!this._cache.data.has(key)) {
      return null
    }

    // 检查缓存是否过期
    const timestamp = this._cache.timestamps.get(key) || 0
    const now = Date.now()
    if (now - timestamp > this._cacheConfig.expireTime) {
      // 缓存已过期，删除
      this._removeFromCache(key)
      return null
    }

    // 更新访问顺序
    this._updateCacheOrder(key)

    return this._cache.data.get(key)
  }

  /**
   * 将数据存入缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存数据
   * @private
   */
  _setToCache(key, value) {
    if (!this._cacheConfig.enabled) {
      return
    }

    // 如果缓存已满，删除最久未使用的项
    if (this._cache.keys.length >= this._cacheConfig.maxSize) {
      const oldestKey = this._cache.keys.shift()
      this._cache.data.delete(oldestKey)
      this._cache.timestamps.delete(oldestKey)
    }

    // 存入缓存
    this._cache.data.set(key, value)
    this._cache.timestamps.set(key, Date.now())

    // 更新访问顺序
    this._updateCacheOrder(key)
  }

  /**
   * 从缓存中删除数据
   * @param {string} key - 缓存键
   * @private
   */
  _removeFromCache(key) {
    this._cache.data.delete(key)
    this._cache.timestamps.delete(key)

    // 从访问顺序中删除
    const index = this._cache.keys.indexOf(key)
    if (index !== -1) {
      this._cache.keys.splice(index, 1)
    }
  }

  /**
   * 更新缓存访问顺序
   * @param {string} key - 缓存键
   * @private
   */
  _updateCacheOrder(key) {
    // 从当前位置删除
    const index = this._cache.keys.indexOf(key)
    if (index !== -1) {
      this._cache.keys.splice(index, 1)
    }

    // 添加到末尾（最近使用）
    this._cache.keys.push(key)
  }

  /**
   * 清空所有缓存
   */
  clearCache() {
    this._cache.data.clear()
    this._cache.keys = []
    this._cache.timestamps.clear()
    this._typedTagDataCache = null
  }

  /**
   * 解析当前场景下绑定了 IoT 设备ID 的热点和 2D 物品摆放数据
   * @param {Array} tagList - 场景下的标签原始数据
   * @param {Array} put2dList - 场景下的 2D 物品原始数据
   * @param {string} [splitSeparator='_'] - keyword 解析分隔符
   * @returns {TypedTagList} 解析后的数据
   */
  parseIotData(tagList = [], put2dList = [], splitSeparator = '_') {
    // 输入参数验证
    if (!Array.isArray(tagList)) {
      logger.error('parseIotData: tagList 必须是数组', { tagList })
      tagList = []
    }
    if (!Array.isArray(put2dList)) {
      logger.error('parseIotData: put2dList 必须是数组', { put2dList })
      put2dList = []
    }
    if (typeof splitSeparator !== 'string') {
      logger.warn('parseIotData: splitSeparator 必须是字符串，使用默认值', {
        splitSeparator,
      })
      splitSeparator = '_'
    }

    logger.debug('开始解析 IoT 数据', {
      tagCount: tagList.length,
      put2dCount: put2dList.length,
      splitSeparator,
    })

    try {
      // 处理标签数据
      const tagResult = IotDataAdapter.processTagList(tagList, splitSeparator)

      // 处理2D物品数据
      const put2dResult = IotDataAdapter.processPut2dList(
        put2dList,
        splitSeparator
      )

      // 设置标签相关数据
      this._data.normalTagList = tagResult.normalTags
      this._data.iotTagList = Object.values(tagResult.iotTags)

      // 设置映射关系
      this._data.iotIdMap = tagResult.deviceMap
      this._data.iotTagIdMap = tagResult.tagMap

      // 返回结果
      const result = {
        tag: tagResult.iotTags,
        put2d: put2dResult,
      }

      logger.debug('IoT 数据解析完成', {
        tagCount: Object.keys(result.tag).length,
        put2dCount: Object.keys(result.put2d).length,
      })

      return result
    } catch (error) {
      logger.error('解析 IoT 数据时发生错误', {
        error: error.message,
        stack: error.stack,
      })
      return { tag: {}, put2d: {} }
    }
  }

  /**
   * 设置当前场景的 IoT 数据
   * @param {Array} tagList - 标签列表
   * @param {Array} put2dList - 2D 物品列表
   * @param {string} [splitSeparator='_'] - 分隔符
   */
  setSceneIotData(tagList, put2dList, splitSeparator = '_') {
    // 清除相关缓存
    this._removeFromCache('typedTagData')
    this._typedTagDataCache = null

    // 解析数据
    this._data.typedTagList = this.parseIotData(
      tagList,
      put2dList,
      splitSeparator
    )

    // 格式化标签列表
    this._data.formattedTagList = this._formatOriginalTagList()
  }

  /**
   * 获取当前场景的 IoT 数据
   * @returns {Object} 当前场景的 IoT 数据
   */
  getSceneIotData() {
    return this._data
  }

  /**
   * 设置标签插件数据
   * @param {string} tagId - 标签ID
   * @param {Object} data - 标签数据
   */
  setTagPluginDataList(tagId, data) {
    this._data.tagPluginDataList[tagId] = data
  }

  /**
   * 获取标签插件数据
   * @param {string} tagId - 标签ID
   * @returns {Object} 标签插件数据
   */
  getTagPluginData(tagId) {
    return this._data.tagPluginDataList[tagId]
  }

  /**
   * 获取标签的 IoT 类型
   * @param {string} tagId - 标签ID
   * @returns {string} 标签的 IoT 类型
   */
  getTagIotType(tagId) {
    return this._data.typedTagList.tag[tagId]
      ? this._data.typedTagList.tag[tagId].iotData.type
      : 'other'
  }

  /**
   * 获取设备列表（按显示类型）
   * @param {string} type - 显示类型（'tag': 标签；'put2d': 2D 物品）
   * @returns {Array} 设备列表
   */
  getDeviceListByDisplayType(type) {
    // 输入参数验证
    if (typeof type !== 'string') {
      logger.error('getDeviceListByDisplayType: type 参数必须是字符串', {
        type,
      })
      return []
    }

    switch (type) {
      case 'tag': {
        return Object.values(this._data.typedTagList.tag)
      }
      case 'put2d': {
        return Object.values(this._data.typedTagList.put2d)
      }
      default: {
        console.error(`未知的显示类型: ${type}`)
        return []
      }
    }
  }

  /**
   * 获取设备列表（按 IoT 类型）
   * @param {string} type - IoT 类型（iot - 设备 | camera - 摄像头）
   * @returns {Array} 设备列表
   */
  getTagDeviceListByIotType(type) {
    // 输入参数验证
    if (typeof type !== 'string') {
      logger.error('getTagDeviceListByIotType: type 参数必须是字符串', { type })
      return []
    }

    if (!this._iotTagTypeCache.includes(type)) {
      logger.warn(`不支持的 IoT 类型: ${type}`, {
        supportedTypes: this._iotTagTypeCache,
      })
      return []
    }

    try {
      return this.getDeviceListByDisplayType('tag')?.filter(
        d => d.iotData.type === type
      )
    } catch (error) {
      logger.error('获取设备列表时发生错误', { type, error: error.message })
      return []
    }
  }

  /**
   * 获取热点 ID 映射到设备 ID 的映射表
   * @returns {Object} 热点 ID 映射到设备 ID
   */
  getIotTagIdMap() {
    return this._data.iotTagIdMap
  }

  /**
   * 获取设备 ID 映射到热点 ID 的映射表
   * @returns {Object} 设备 ID 映射到热点 ID
   */
  getIotIdMap() {
    return this._data.iotIdMap
  }

  /**
   * 获取绑定了 IoT 类型的热点数据
   * @returns {Object} 绑定了 IoT 类型的热点数据
   */
  getTypedTagData() {
    const cacheKey = 'typedTagData'

    // 尝试从缓存获取
    const cachedData = this._getFromCache(cacheKey)
    if (cachedData) {
      logger.debug('从缓存获取 TypedTagData')
      return cachedData
    }

    logger.debug('缓存未命中，重新计算 TypedTagData')

    const res = Object.create(null)
    this._iotTagTypeCache.forEach(type => {
      res[type] = []
    })

    const tagValues = Object.values(this._data.typedTagList.tag)
    for (const tag of tagValues) {
      if (tag.iotData?.type && res[tag.iotData.type]) {
        res[tag.iotData.type].push(tag)
      }
    }

    // 更新缓存
    this._typedTagDataCache = res
    this._setToCache(cacheKey, res)

    logger.debug('TypedTagData 计算完成', { types: Object.keys(res) })
    return this._typedTagDataCache
  }

  /**
   * 获取格式化后的标签列表
   * @returns {Array} 标签列表
   */
  getFormattedTagList() {
    return this._data.formattedTagList
  }

  /**
   * 获取普通标签列表
   * @returns {Array} 普通标签列表
   */
  getNormalTagList() {
    return this._data.normalTagList
  }

  /**
   * 获取 IoT 标签列表
   * @returns {Array} IoT 标签列表
   */
  getIotTagList() {
    return this._data.iotTagList
  }

  /**
   * 设置 IoT 标签类型缓存
   * @param {string} type - IoT 标签类型
   * @private
   */
  _setIotTagTypeCache(type) {
    if (!this._iotTagTypeCache.includes(type)) {
      this._iotTagTypeCache.push(type)
    }
  }

  /**
   * 设置普通标签
   * @param {Object} tag - 标签数据
   * @private
   */
  _setNormalTag(tag) {
    this._data.normalTagList.push(tag)
  }

  /**
   * 设置 IoT 标签列表
   * @param {Array} tagList - 标签列表
   * @private
   */
  _setIotTagList(tagList) {
    this._data.iotTagList = tagList
  }

  /**
   * 格式化原始标签列表
   * @returns {Array} 格式化后的标签列表
   * @private
   */
  _formatOriginalTagList() {
    return this._data.normalTagList.concat(this._data.iotTagList)
  }

  /**
   * 设置标签 ID 与设备 ID 的双向映射
   * @param {string} tagId - 标签ID
   * @param {string} deviceId - 设备ID
   * @private
   */
  _setIotIdMap(tagId, deviceId) {
    this._data.iotIdMap[deviceId] = tagId
    this._data.iotTagIdMap[tagId] = deviceId
  }
}

// 导出单例实例
const iotDataManager = new IotDataManager()
export default iotDataManager

// 也可以导出类，允许用户创建自己的实例
export { IotDataManager }
