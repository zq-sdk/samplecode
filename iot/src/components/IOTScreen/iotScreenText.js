import { CanvasManager } from '@/components/IOTScreen/Canvas/CanvasManager'
import { IoTScreenLoader } from './IoTScreenLoader'
import { DEVICE_DATA_DISPLAY_TYPE_ENUM } from '@/constants/iotEnum'

/**
 * 创建并初始化一个 IOT 设备状态大屏（Canvas模式）
 * @param {Object} put2D Put2D 实例
 * @param {Object} deviceData 设备ID
 * @returns {CanvasManager} 渲染内容实例
 */
function createIotTextScreen(put2D, deviceData) {
  const canvasScreen = new CanvasManager({
    width: deviceData.width,
    height: deviceData.height,
  })
  const csLoader = new IoTScreenLoader(put2D)

  csLoader.load(
    [
      {
        id: deviceData.id,
        element: canvasScreen.getContainer(),
        displayType: DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS,
        deviceId: deviceData.deviceId,
        width: deviceData.width,
        height: deviceData.height,
        position: deviceData.position,
        quaternion: deviceData.quaternion,
        scale: deviceData.scale,
      },
    ],
    () => {
      console.log(`CanvasScreen load success: `, deviceData)
    }
  )

  canvasScreen.startAutoUpdate(deviceData.deviceId)

  return canvasScreen
}

export { createIotTextScreen }
