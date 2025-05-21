/**
 *  IOT 大屏加载类
 */
import { DEVICE_DATA_DISPLAY_TYPE_ENUM, DEVICE_DATA_DISPLAY_TYPE_VALUE } from '@/constants/iotEnum'
export class IoTScreenLoader {
  constructor(put2D) {
    this.put2D = put2D
    this.screenMap = new Map()
  }

  /**
   * 大屏加载参数类型
   * @typedef {Object} ScreenLoadParam
   * @property {HTMLCanvasElement | HTMLElement} element Canvas元素
   * @property {number} width 宽度
   * @property {DEVICE_DATA_DISPLAY_TYPE_ENUM} displayType 大屏类型
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

    const loadParams = params.map(option => {
      const {
        element,
        width,
        height,
        displayType,
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
            type: DEVICE_DATA_DISPLAY_TYPE_VALUE[displayType],
          },
        ],
        scale,
        position,
        quaternion,
        visible: true,
        success: data => {
          this.screenMap.set(id, data)
          onSuccess && onSuccess(data)
        },
        failure: () => {
          onFailure && onFailure()
        },
      }
      if (displayType === DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS) {
        screenConfig.material_list[0].canvas = element
      } else {
        screenConfig.material_list[0].element = element
      }
      return screenConfig
    })

    this.put2D.load({
      data: loadParams,
      complete: results => {
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
