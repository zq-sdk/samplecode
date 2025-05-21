/**
 * IoT 相关常量和枚举定义
 * 包含设备类型、状态、显示方式等枚举常量
 */

/**
 * IoT 设备类型枚举
 * @readonly
 * @enum {string}
 */
export const IOT_TYPE_ENUM = {
  /** 电力设备 */
  IOT: 'iot',
  /** 摄像头设备 */
  CAMERA: 'camera',
}

/**
 * 具体类型的 IoT 设备的特定数据键枚举
 * 用于标识不同设备类型的特有属性
 * @readonly
 * @enum {string}
 */
export const IOT_TYPE_DATA_KEY_ENUM = {
  [IOT_TYPE_ENUM.IOT]: 'state',
  [IOT_TYPE_ENUM.CAMERA]: 'mode',
}

/**
 * 设备状态枚举
 * @readonly
 * @enum {number}
 */
export const DEVICE_STATE_ENUM = {
  /** 正常状态 */
  NORMAL: 0,
  /** 异常状态 */
  ERROR: 1,
}

/**
 * 设备状态描述映射
 * @readonly
 * @type {Object.<number, string>}
 */
export const DEVICE_STATE_DESC = {
  [DEVICE_STATE_ENUM.NORMAL]: '正常',
  [DEVICE_STATE_ENUM.ERROR]: '异常',
}

/**
 * 摄像头视频播放方式枚举
 * @readonly
 * @enum {number}
 */
export const CAMERA_VIDEO_MODE_ENUM = {
  /** 点播模式 */
  VOD: 0,
  /** 直播模式 */
  LIVE: 1,
}

/**
 * 摄像头视频播放方式描述映射
 * @readonly
 * @type {Object.<number, string>}
 */
export const CAMERA_VIDEO_MODE_DESC = {
  [CAMERA_VIDEO_MODE_ENUM.VOD]: '点播',
  [CAMERA_VIDEO_MODE_ENUM.LIVE]: '直播',
}

/**
 * 电力设备数据的空间展示方式枚举
 * @readonly
 * @enum {number}
 */
export const DEVICE_DATA_DISPLAY_TYPE_ENUM = {
  /** 贴在空间中的文本（Canvas 渲染） */
  CANVAS: 0,
  /** 贴在空间中的仪表盘（CSS3D 渲染） */
  CSS3D: 1,
}

export const DEVICE_DATA_DISPLAY_TYPE_VALUE = {
  [DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS]: 'canvas',
  [DEVICE_DATA_DISPLAY_TYPE_ENUM.CSS3D]: 'css3d',
}

/**
 * 默认的关键字分隔符
 * 用于解析标签关键字中的设备信息
 * @readonly
 * @type {string}
 */
export const DEFAULT_KEYWORD_SEPARATOR = '_'
