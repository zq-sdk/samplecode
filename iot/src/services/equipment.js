import Mock from 'mockjs'
import { DEVICE_STATE_ENUM } from '@/constants'
import logger from '@/utils/logger'

// 设备数据阈值配置
const EQUIPMENT_THRESHOLDS = {
  ratedVoltage: {
    min: 220,
    max: 380,
    unit: 'V',
  },
  ratedCurrent: {
    min: 5,
    max: 30,
    unit: 'A',
  },
  ratedPower: {
    min: 2,
    max: 6,
    unit: 'kW',
  },
  ratedFrequency: {
    min: 15,
    max: 60,
    unit: 'Hz',
  },
  ratedSpeed: {
    min: 1000,
    max: 2000,
    unit: 'r/min',
  },
  mechanicalRatio: {
    min: 1,
    max: 3,
    unit: ':1',
  },
}

// 模拟数据模板
const equipmentDataTemplate = {
  // 额定电压范围：220-440
  'ratedVoltage|220-390': 1,
  // 额定电流范围：5-30
  'ratedCurrent|5-33': 1,
  // 额定功率范围：2.2-15，保留1位小数
  'ratedPower|2-6.1-1': 1,
  // 额定频率范围：15-60
  'ratedFrequency|15-65': 1,
  // 额定转速范围：1000-3000
  'ratedSpeed|1000-2020': 1,
  // 机械转动比分子范围：1-3，分母固定为1
  'mechanicalRatio|1-3.0-0': 1,
}

/**
 * 设备数据服务类
 */
export class EquipmentService {
  constructor() {
    // 设备状态存储
    this.deviceStates = {}
    // 监听器集合
    this.stateChangeListeners = new Set()
    // 全局状态更新定时器
    this.globalUpdateInterval = null
    // 默认全局更新间隔 (ms)
    this.globalUpdateFrequency = 2000
    // 设备数据更新回调集合
    this.deviceDataListeners = new Map()
    // 全局状态是否已初始化
    this.isGlobalUpdateInitialized = false
    // 设备列表缓存
    this.deviceListCache = []
    // 设备数据存储
    this.deviceData = {}
    // 设备数据告警状态存储
    this.deviceAlerts = {}
  }

  /**
   * 检查全局更新是否已启动
   * @returns {boolean} 是否已启动
   */
  isGlobalUpdateRunning() {
    return !!this.globalUpdateInterval
  }

  /**
   * 启动全局状态更新
   * @param {Array} deviceList 设备列表
   * @param {number} interval 更新间隔 (ms)
   */
  startGlobalUpdate(deviceList, interval = 2000) {
    try {
      // 输入参数验证
      if (deviceList && !Array.isArray(deviceList)) {
        logger.error('startGlobalUpdate: deviceList 必须是数组', { deviceList })
        return
      }

      if (interval && (typeof interval !== 'number' || interval <= 0)) {
        logger.error('startGlobalUpdate: interval 必须是正数', { interval })
        return
      }

      // 缓存设备列表
      if (deviceList && deviceList.length > 0) {
        this.deviceListCache = deviceList
        logger.debug('设备列表已缓存', { deviceCount: deviceList.length })
      }

      // 设置全局更新频率
      if (interval) {
        this.globalUpdateFrequency = interval
      }

      // 如果已经启动，不重复启动
      if (this.isGlobalUpdateRunning()) {
        logger.warn('全局状态更新已在运行，跳过重复启动')
        return
      }

      // 标记为已初始化
      this.isGlobalUpdateInitialized = true

      // 立即更新一次所有设备状态
      this.fetchAllDeviceData()

      // 设置定时更新
      this.globalUpdateInterval = window.setInterval(() => {
        this.fetchAllDeviceData()
      }, this.globalUpdateFrequency)

      logger.info(
        `全局状态更新已启动，更新频率: ${this.globalUpdateFrequency}ms`
      )
    } catch (error) {
      logger.error('启动全局状态更新时发生错误', {
        error: error.message,
        stack: error.stack,
      })
    }
  }

  /**
   * 停止全局状态更新
   */
  stopGlobalUpdate() {
    try {
      if (this.globalUpdateInterval) {
        window.clearInterval(this.globalUpdateInterval)
        this.globalUpdateInterval = null
        logger.info('全局状态更新已停止')
      } else {
        logger.debug('全局状态更新未运行，无需停止')
      }
    } catch (error) {
      logger.error('停止全局状态更新时发生错误', { error: error.message })
    }
  }

  /**
   * 确保全局更新已启动
   * @param {Array} deviceList 设备列表 (可选)
   */
  ensureGlobalUpdateRunning(deviceList) {
    if (!this.isGlobalUpdateRunning()) {
      this.startGlobalUpdate(deviceList || this.deviceListCache)
    }
  }

  // 模拟获取设备数据
  async getMockData() {
    return Mock.mock(equipmentDataTemplate)
  }

  /**
   * 检查设备数据是否超出阈值
   * @param {Object} data 设备数据
   * @returns {Object} 告警状态对象，每个字段的告警状态
   */
  checkThresholds(data) {
    const alerts = {}
    let hasAlert = false

    // 检查每个字段是否超出阈值
    Object.keys(EQUIPMENT_THRESHOLDS).forEach(key => {
      const value = data[key]
      const threshold = EQUIPMENT_THRESHOLDS[key]

      if (value < threshold.min || value > threshold.max) {
        alerts[key] = true
      } else {
        alerts[key] = false
      }
    })

    hasAlert = Object.values(alerts).some(alert => alert)

    return {
      alerts,
      hasAlert,
    }
  }

  /**
   * 获取设备数据的告警状态
   * @param {string} deviceId 设备ID
   * @returns {Object} 告警状态对象
   */
  getDeviceAlerts(deviceId) {
    return this.deviceAlerts[deviceId] || {}
  }

  /**
   * 获取设备数据
   * @param {string} deviceId 设备ID
   * @returns {Object} 设备数据
   */
  getDeviceData(deviceId) {
    return this.deviceData[deviceId] || {}
  }

  async fetchAllDeviceData() {
    // 边界情况处理
    if (!this.deviceListCache || this.deviceListCache.length === 0) {
      logger.debug('设备列表为空，跳过数据获取')
      return []
    }

    try {
      // 提取设备ID
      const deviceIds = []
      for (const device of this.deviceListCache) {
        if (device?.iotData?.deviceId) {
          deviceIds.push(device.iotData.deviceId)
        } else {
          logger.warn('设备数据格式错误，跳过', { device })
        }
      }

      if (deviceIds.length === 0) {
        logger.warn('没有有效的设备ID，跳过数据获取')
        return []
      }

      logger.debug('开始批量获取设备数据', { deviceCount: deviceIds.length })

      // 并行请求所有设备数据
      const promises = deviceIds.map(id => this.fetchDeviceData(id))
      const results = await Promise.allSettled(promises)

      // 处理结果
      let successCount = 0
      let failureCount = 0

      results.forEach((result, index) => {
        const deviceId = deviceIds[index]
        if (result.status === 'rejected') {
          failureCount++
          logger.error(`设备 ${deviceId} 数据获取失败`, {
            deviceId,
            error: result.reason?.message || result.reason,
          })
        } else {
          successCount++
        }
      })

      logger.debug('批量获取设备数据完成', {
        total: deviceIds.length,
        success: successCount,
        failure: failureCount,
      })

      return results.filter(r => r.status === 'fulfilled').map(r => r.value)
    } catch (error) {
      logger.error('批量获取设备数据失败', {
        error: error.message,
        stack: error.stack,
        deviceCacheLength: this.deviceListCache?.length || 0,
      })
      throw error
    }
  }

  // 从真实API获取设备数据
  async fetchDeviceData(deviceId) {
    try {
      const response = await fetch(`/api/equipment/${deviceId}`)
      if (!response.ok) {
        // throw new Error('设备数据获取失败')
      }
      const data = await response.json()

      // 检查数据是否超出阈值
      const { alerts, hasAlert } = this.checkThresholds(data)

      // 存储设备数据和告警状态
      this.deviceData[deviceId] = data
      this.deviceAlerts[deviceId] = alerts

      // 如果数据超出阈值，更新设备状态为异常
      this.updateDeviceState(
        deviceId,
        hasAlert ? DEVICE_STATE_ENUM.ERROR : DEVICE_STATE_ENUM.NORMAL
      )

      const cbs = this.deviceDataListeners.get(deviceId)
      if (cbs && cbs.size > 0) {
        cbs.forEach(cb => {
          cb(data)
        })
      }

      return data
    } catch {
      // 模拟设备数据请求
      const mockData = await this.getMockData()

      // 检查模拟数据是否超出阈值
      const { alerts, hasAlert } = this.checkThresholds(mockData)

      // 存储设备数据和告警状态
      this.deviceData[deviceId] = mockData
      this.deviceAlerts[deviceId] = alerts

      // 如果数据超出阈值，更新设备状态为异常
      this.updateDeviceState(
        deviceId,
        hasAlert ? DEVICE_STATE_ENUM.ERROR : DEVICE_STATE_ENUM.NORMAL
      )

      // console.log(`fetchDeviceData: ${deviceId}`, mockData)

      const cbs = this.deviceDataListeners.get(deviceId)
      if (cbs && cbs.size > 0) {
        cbs.forEach(cb => {
          cb(mockData)
        })
      }

      return mockData
    }
  }

  /**
   * 注册设备数据更新
   * @param {string} equipmentId 设备ID
   * @param {Function} callback 数据更新回调
   */
  registerDeviceDataUpdate(equipmentId, callback) {
    if (!this.deviceDataListeners.get(equipmentId)) {
      this.deviceDataListeners.set(equipmentId, new Set())
    }

    this.deviceDataListeners.get(equipmentId).add(callback)

    // 确保全局更新已启动
    this.ensureGlobalUpdateRunning()

    // 立即获取一次数据
    if (this.deviceData[equipmentId]) {
      callback(this.deviceData[equipmentId])
    }
  }

  /**
   * 取消设备数据更新注册
   * @param {string} equipmentId 设备ID
   * @param {Function} listener 数据更新监听器
   */
  unregisterDeviceDataUpdate(equipmentId, listener) {
    const listeners = this.deviceDataListeners.get(equipmentId)
    if (!listeners || !listeners.size) {
      return
    }

    listeners.delete(listener)
  }

  /**
   * 获取设备的当前状态
   * @param {string} deviceId 设备ID
   * @returns {number} 设备状态枚举值
   */
  getDeviceState(deviceId) {
    return this.deviceStates[deviceId] || DEVICE_STATE_ENUM.NORMAL
  }

  /**
   * 更新设备状态
   * @param {string} deviceId 设备ID
   * @param {number} state 状态值
   */
  updateDeviceState(deviceId, state) {
    const preState = this.getDeviceState(deviceId)
    this.deviceStates[deviceId] = state

    // console.error(`${deviceId}, 状态更新为：${DEVICE_STATE_DESC[state]}`)
    // console.log(`alerts: `, this.deviceAlerts[deviceId])
    // console.log(`deviceData: `, this.deviceData[deviceId])
    // console.log('------------------------------')
    if (preState === state) {
      return
    }
    this.notifyStateChange(deviceId, state)
  }

  /**
   * 更新所有设备的状态
   * @param {string} deviceId 设备列表
   */
  updateTargetDeviceState(deviceId, deviceData) {
    if (!deviceId) {
      return
    }

    const finalDeviceData = this.deviceData[deviceId] ?? deviceData

    // 如果有设备数据，根据告警状态决定设备状态
    if (finalDeviceData) {
      const { hasAlert } = this.checkThresholds(finalDeviceData)
      const state = hasAlert
        ? DEVICE_STATE_ENUM.ERROR
        : DEVICE_STATE_ENUM.NORMAL
      this.updateDeviceState(deviceId, state)
    }
  }

  /**
   * 添加状态变化监听器
   * @param {Function} listener 监听器函数
   */
  addStateChangeListener(listener) {
    if (typeof listener === 'function') {
      this.stateChangeListeners.add(listener)
    }
  }

  /**
   * 移除状态变化监听器
   * @param {Function} listener 监听器函数
   */
  removeStateChangeListener(listener) {
    this.stateChangeListeners.delete(listener)
  }

  /**
   * 通知状态变化
   * @param {string} deviceId 设备ID
   * @param {number} state 状态值
   */
  notifyStateChange(deviceId, state) {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(deviceId, state)
      } catch (error) {
        console.error('状态变化监听器执行错误:', error)
      }
    })
  }
}

// 导出单例实例
export const equipmentService = new EquipmentService()

// 导出阈值配置，供其他组件使用
export const EQUIPMENT_THRESHOLDS_CONFIG = EQUIPMENT_THRESHOLDS
