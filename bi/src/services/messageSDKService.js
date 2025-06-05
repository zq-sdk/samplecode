/**
 * MessageSDK 服务封装
 * 用于与Qverse作品进行通信
 */

import { VIEW_MODES } from '../constants'

class MessageSDKService {
  constructor() {
    this.messageSDK = null
    this.isConnected = false
    this.eventListeners = new Map()
  }

  /**
   * 初始化MessageSDK连接
   * @param {HTMLIFrameElement} iframe - Qverse作品的iframe元素
   * @param {string} targetOrigin - 目标域名
   * @param {Object} config - 配置选项
   */
  async connect(iframe, targetOrigin = 'https://test.3dnest.cn', config = {}) {
    try {
      // 检查MessageSDK是否已加载
      if (!window.MessageSDK) {
        throw new Error('MessageSDK未加载，请确保已引入MessageSDK.js')
      }

      // 创建连接
      this.messageSDK = window.MessageSDK.connect({
        targetWindow: iframe,
        targetOrigin: targetOrigin,
        config: {
          ...config,
        },
      })

      this.messageSDK.on('connect.ok', () => {
        this.isConnected = true
        console.log('Qverse作品连接成功')
      })

      // 监听作品加载完成事件
      this.messageSDK.on('work.loaded', data => {
        console.log('Qverse作品加载完成:', data)
        this.emit('workLoaded', data)
      })

      this.messageSDK.on('model.switch.complete', sceneInfo => {
        console.log('场景切换完成:', sceneInfo)
        this.emit('modelSwitchComplete', sceneInfo)
      })

      return this.messageSDK
    } catch (error) {
      console.error('MessageSDK初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取所有标签列表
   * @returns {Promise<Array>} 标签列表
   */
  async getTags() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      const tags = await this.messageSDK.tag.getTags()
      console.log('获取标签列表:', tags)
      return tags
    } catch (error) {
      console.error('获取标签失败:', error)
      throw error
    }
  }

  /**
   * 飞向指定标签
   * @param {string} tagId - 标签ID
   * @param {string} sceneId - 场景ID
   * @returns {Promise<Object>} 标签信息
   */
  async flyToTag(tagId, sceneId) {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      const result = await this.messageSDK.tag.flyTo({
        tagId,
        sceneId,
      })
      console.log('飞向标签:', { tagId, sceneId, result })
      return result
    } catch (error) {
      console.error('飞向标签失败:', error)
      throw error
    }
  }

  /**
   * 获取所有场景列表
   * @returns {Promise<Array>} 场景列表
   */
  async getScenes() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      const scenes = await this.messageSDK.scene.getScenes()
      console.log('获取场景列表:', scenes)
      return scenes
    } catch (error) {
      console.error('获取场景失败:', error)
      throw error
    }
  }

  /**
   * 切换到指定场景
   * @param {string} sceneId - 场景ID
   * @returns {Promise<void>}
   */
  async switchScene(sceneId) {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      await this.messageSDK.scene.switch({ sceneId })
      console.log('切换场景:', sceneId)
    } catch (error) {
      console.error('切换场景失败:', error)
      throw error
    }
  }

  /**
   * 播放自动导览
   * @returns {Promise<void>}
   */
  async playGuide() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      await this.messageSDK.guide.play()
      console.log('开始自动导览')
    } catch (error) {
      console.error('播放导览失败:', error)
      throw error
    }
  }

  /**
   * 暂停自动导览
   * @returns {Promise<void>}
   */
  async pauseGuide() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      await this.messageSDK.guide.pause()
      console.log('暂停自动导览')
    } catch (error) {
      console.error('暂停导览失败:', error)
      throw error
    }
  }

  /**
   * 显示导览列表
   * @returns {Promise<void>}
   */
  async showGuideBar() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      await this.messageSDK.guide.barShow()
      console.log('显示导览列表')
    } catch (error) {
      console.error('显示导览列表失败:', error)
      throw error
    }
  }

  /**
   * 隐藏导览列表
   * @returns {Promise<void>}
   */
  async hideGuideBar() {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    try {
      await this.messageSDK.guide.barHide()
      console.log('隐藏导览列表')
    } catch (error) {
      console.error('隐藏导览列表失败:', error)
      throw error
    }
  }

  /**
   * 切换视图模式
   * @param {string} mode - 视图模式: "panorama" | "dollhouse" | "floorplan"
   * @returns {Promise<void>}
   */
  async switchViewMode(mode) {
    if (!this.isConnected) {
      throw new Error('MessageSDK未连接')
    }

    const validModes = [
      VIEW_MODES.PANORAMA,
      VIEW_MODES.DOLLHOUSE,
      VIEW_MODES.FLOORPLAN,
    ]
    if (!validModes.includes(mode)) {
      throw new Error(
        `无效的视图模式: ${mode}，支持的模式: ${validModes.join(', ')}`
      )
    }

    try {
      await this.messageSDK.mode.switch(mode)
      console.log('切换视图模式:', mode)
    } catch (error) {
      console.error('切换视图模式失败:', error)
      throw error
    }
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件监听器执行错误 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.messageSDK) {
      // 清理事件监听器
      this.eventListeners.clear()
      this.messageSDK = null
      this.isConnected = false
      console.log('MessageSDK连接已断开')
    }
  }

  /**
   * 获取连接状态
   * @returns {boolean} 是否已连接
   */
  getConnectionStatus() {
    return this.isConnected
  }
}

// 创建单例实例
const messageSDKService = new MessageSDKService()

export default messageSDKService
