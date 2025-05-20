/**
 *  IOT 大屏渲染类 —— canvas模式
 */
export class CanvasScreenLoader {
  constructor(put2D) {
    this.put2D = put2D
    this.screenMap = new Map()
  }

  /**
   * 大屏加载参数类型
   * @typedef {Object} ScreenLoadParam
   * @property {HTMLCanvasElement} canvas Canvas元素
   * @property {number} width 宽度
   * @property {number} height 高度
   * @property {Object} position 位置
   * @property {Object} quaternion 旋转
   * @property {Object} scale 缩放
   * @property {string} deviceId 设备ID
   * @property {string} id 物品ID
   */

  /**
   * 加载大屏到场景
   * @param {Array<ScreenLoadParam>} params 配置项
   * @param {Function} onLoadComplete 加载完成回调
   */
  load(params, onLoadComplete) {
    if (!Array.isArray(params)) {
      throw new Error('options must be an array')
    }

    const loadParams = params.map((option) => {
      const {
        canvas,
        width,
        height,
        position,
        quaternion,
        scale,
        id,
        deviceId,
        onSuccess,
        onFailure,
      } = option

      // 创建大屏配置
      const screenConfig = {
        id,
        width,
        height,
        bg_color: 0x000000,
        bg_opacity: 0.5,
        material_list: [
          {
            id,
            type: 'canvas',
            canvas,
          },
        ],
        scale,
        position,
        quaternion,
        success: (data) => {
          this.screenMap.set(id, data)
          onSuccess && onSuccess(data)
        },
        failure: () => {
          onFailure && onFailure()
        },
      }

      return screenConfig
    })

    this.put2D.load({
      data: loadParams,
      complete: (results) => {
        onLoadComplete && onLoadComplete(results)
      },
    })
  }

  /**
   * 移除大屏
   */
  removeScreen(deviceId) {
    if (this.screenMap.has(deviceId)) {
      this.put2D.remove(this.screenMap.get(deviceId).uuid)
      this.screenMap.delete(deviceId)
    }
  }
}
