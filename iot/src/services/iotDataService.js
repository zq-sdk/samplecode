import iotDataManager from '@/utils/iotDataManager'
import IotDataAdapter from '@/utils/iotDataAdapter'
import { IOT_TYPE_ENUM, DEFAULT_KEYWORD_SEPARATOR } from '@/constants/iotEnum'

/**
 * IoT 数据服务
 * 提供 IoT 数据的业务逻辑处理
 */
class IotDataService {
  /**
   * 初始化场景 IoT 数据
   * @param {Array} tagList - 标签列表
   * @param {Array} put2dList - 2D 物品列表
   * @param {string} [separator=DEFAULT_KEYWORD_SEPARATOR] - 分隔符
   */
  static initSceneIotData(
    tagList,
    put2dList,
    separator = DEFAULT_KEYWORD_SEPARATOR
  ) {
    iotDataManager.setSceneIotData(tagList, put2dList, separator)
  }

  /**
   * 获取摄像头设备列表
   * @returns {Array} 摄像头设备列表
   */
  static getCameraDevices() {
    return iotDataManager.getTagDeviceListByIotType(IOT_TYPE_ENUM.CAMERA)
  }

  /**
   * 获取 IoT 设备列表
   * @returns {Array} IoT 设备列表
   */
  static getIotDevices() {
    return iotDataManager.getTagDeviceListByIotType(IOT_TYPE_ENUM.IOT)
  }

  /**
   * TODO:待完善
   * 获取所有设备列表
   * @returns {Object} 按类型分组的设备列表
   */
  static getAllDevices() {
    return iotDataManager.getTypedTagData()
  }

  /**
   * TODO:待完善
   * 获取设备详情
   * @param {string} deviceId - 设备 ID
   * @returns {Object|null} 设备详情
   */
  static getDeviceDetail(deviceId) {
    const tagId = iotDataManager.getIotIdMap()[deviceId]
    if (!tagId) {
      return null
    }

    return (
      iotDataManager.getTagPluginData(tagId) ||
      iotDataManager
        .getDeviceListByDisplayType('tag')
        .find(tag => tag.id === tagId)
    )
  }

  /**
   * 更新设备状态
   * @param {string} deviceId - 设备 ID
   * @param {number} state - 设备状态
   * @returns {boolean} 是否更新成功
   */
  static updateDeviceState(deviceId, state) {
    const tagId = iotDataManager.getIotIdMap()[deviceId]
    if (!tagId) {
      return false
    }

    const device = iotDataManager
      .getDeviceListByDisplayType('tag')
      .find(tag => tag.id === tagId)
    if (!device) {
      return false
    }

    // 只有 IoT 设备才有状态
    if (device.iotData.type !== IOT_TYPE_ENUM.IOT) {
      return false
    }

    device.iotData.state = state
    return true
  }

  /**
   * 更新摄像头模式
   * @param {string} deviceId - 设备 ID
   * @param {number} mode - 摄像头模式
   * @returns {boolean} 是否更新成功
   */
  static updateCameraMode(deviceId, mode) {
    const tagId = iotDataManager.getIotIdMap()[deviceId]
    if (!tagId) {
      return false
    }

    const device = iotDataManager
      .getDeviceListByDisplayType('tag')
      .find(tag => tag.id === tagId)
    if (!device) {
      return false
    }

    // 只有摄像头设备才有模式
    if (device.iotData.type !== IOT_TYPE_ENUM.CAMERA) {
      return false
    }

    device.iotData.mode = mode
    return true
  }

  /**
   * 获取设备 ID 与标签 ID 的映射关系
   * @returns {Object} 映射关系
   */
  static getDeviceTagMapping() {
    return {
      deviceToTag: iotDataManager.getIotIdMap(),
      tagToDevice: iotDataManager.getIotTagIdMap(),
    }
  }

  /**
   * 获取标签数据
   * @param {string} tagId - 标签 ID
   * @returns {Object|null} 标签数据
   */
  static getTagData(tagId) {
    return iotDataManager.getTagPluginData(tagId)
  }

  /**
   * 设置标签数据
   * @param {string} tagId - 标签 ID
   * @param {Object} data - 标签数据
   */
  static setTagData(tagId, data) {
    iotDataManager.setTagPluginDataList(tagId, data)
  }

  /**
   * 配置缓存
   * @param {Object} config - 缓存配置
   * @param {number} [config.maxSize] - 最大缓存条目数
   * @param {number} [config.expireTime] - 缓存过期时间（毫秒）
   * @param {boolean} [config.enabled] - 是否启用缓存
   */
  static configureCaching(config = {}) {
    iotDataManager.setCacheConfig(config)
  }

  /**
   * 获取当前缓存配置
   * @returns {Object} 缓存配置
   */
  static getCacheConfig() {
    return iotDataManager.getCacheConfig()
  }

  /**
   * 清除所有缓存
   */
  static clearCache() {
    iotDataManager.clearCache()
  }

  /**
   * 验证设备数据
   * @param {Object} deviceData - 设备数据
   * @returns {Object} 验证结果
   */
  static validateDeviceData(deviceData) {
    return IotDataAdapter.validateIotData(deviceData)
  }
}

export default IotDataService
