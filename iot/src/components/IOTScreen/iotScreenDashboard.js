import { DashboardManager } from '@/components/IOTScreen/CSS3D/DashboardManager'
import { IoTScreenLoader } from './IoTScreenLoader'
import { DEVICE_DATA_DISPLAY_TYPE_ENUM } from '@/constants/iotEnum'

/**
 * 创建并初始化一个 IOT 设备状态大屏（CSS3D模式）
 * @param {string} deviceData 设备数据
 * @returns {DashboardManager} 渲染内容实例
 */
function createIotDashboardScreen(put2D, deviceData) {
  // 创建仪表盘实例
  const dashboardManager = new DashboardManager({
    width: deviceData.width,
    height: deviceData.height,
  })

  const screenLoader = new IoTScreenLoader(put2D)

  screenLoader.load(
    [
      {
        id: deviceData.id,
        deviceId: deviceData.deviceId,
        width: deviceData.width,
        height: deviceData.height,
        element: dashboardManager.getContainer(),
        displayType: DEVICE_DATA_DISPLAY_TYPE_ENUM.CSS3D,
        position: deviceData.position,
        quaternion: deviceData.quaternion,
        scale: deviceData.scale,
      },
    ],
    () => {
      console.log(`DashboardScreen load success: `, deviceData)
    }
  )

  // 开始自动更新数据
  dashboardManager.startAutoUpdate(deviceData.deviceId)

  return dashboardManager
}

export { createIotDashboardScreen }
