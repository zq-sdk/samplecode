import { CSS3DScreenLoader } from '@/components/IOTScreen/CSS3D/CSS3DScreenLoader'
import { DashboardManager } from '@/components/IOTScreen/CSS3D/DashboardManager'

/**
 * 创建并初始化一个 IOT 设备状态大屏（CSS3D模式）
 * @param {string} deviceData 设备数据
 * @returns {DashboardManager} 渲染内容实例
 */
function createIotDashboardScreen(deviceData) {
  // 创建仪表盘实例
  const dashboardManager = new DashboardManager({
    width: deviceData.width,
    height: deviceData.height,
  })

  const screenLoader = new CSS3DScreenLoader()

  screenLoader.load([
    {
      deviceId: deviceData.deviceId,
      container: dashboardManager.getContainer(),
      position: deviceData.position,
      quaternion: deviceData.quaternion,
      scale: deviceData.scale,
    },
  ])

  // 开始自动更新数据
  dashboardManager.startAutoUpdate(deviceData.deviceId)

  return dashboardManager
}

export { createIotDashboardScreen }
