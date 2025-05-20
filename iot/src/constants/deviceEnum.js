/**
 * 设备状态枚举
 */
export const DEVICE_STATE_ENUM = {
  // 正常状态
  NORMAL: 1,
  // 异常状态
  ERROR: 2,
}

/**
 * 设备状态描述映射
 */
export const DEVICE_STATE_DESC = {
  [DEVICE_STATE_ENUM.NORMAL]: '正常',
  [DEVICE_STATE_ENUM.ERROR]: '异常',
}

/**
 * 摄像头视频播放方式
 */
export const CAMERA_VIDEO_MODE_ENUM = {
  // 点播
  VOD: 0,
  // 直播
  LIVE: 1,
}

/**
 * 设备数据空间展示方式
 */
export const DEVICE_DATA_DISPLAY_TYPE_ENUM = {
  // 贴在空间中的文本
  CANVAS: 0,
  // 贴在空间中的仪表盘
  CSS3D: 1,
}
