/**
 * 功能特性相关枚举定义
 * 包含标签类型、搜索选项等功能特性的枚举常量
 */

import {
  CAMERA_VIDEO_MODE_DESC,
  CAMERA_VIDEO_MODE_ENUM,
  DEVICE_STATE_DESC,
  DEVICE_STATE_ENUM,
  IOT_TYPE_ENUM,
} from './iotEnum'

/**
 * 标签可见性计算规则枚举
 * 定义标签在不同情况下的可见性计算规则
 * @readonly
 * @enum {string}
 */
export const TAG_VISIBLE_COMPUTE_RULE_ENUM = {
  /** 超出设置的标签可视范围，默认5米 */
  // OUT_VISUAL_RANGE: 'outVisualRange',
  /** 超出相机视野范围 */
  OUT_CAMERA: 'outCamera',
  /** 模型内部遮挡 */
  BARRIER_WITHIN_MODEL: 'barrierWithinModel',
}

/**
 * 普通标签类型枚举
 * 定义普通热点标签的各种类型及其描述
 * @readonly
 * @enum {string}
 */
export const TAG_NORMAL_TYPE_ENUM = {
  text: '弹出文本',
  img: '弹出图片',
  video: '弹出视频',
  page: '弹出网页',
  link: '跳转链接',
  audio: '播放音频',
  jump_scene: '跳转场景',
  goods: '商品',
  no_content: '无事件',
}

/**
 * IoT 标签类型枚举
 * 定义 IoT 设备标签的各种类型及其描述
 * @readonly
 * @enum {string}
 */
export const TAG_IOT_TYPE_ENUM = {
  [IOT_TYPE_ENUM.CAMERA]: '摄像头',
  [IOT_TYPE_ENUM.IOT]: '设备',
}

/**
 * 获取普通标签选项列表
 * @returns {Array<{label: string, value: string}>} 普通标签选项数组
 */
const getNormalTagOptions = () => {
  return Object.entries(TAG_NORMAL_TYPE_ENUM).map(([key, label]) => {
    return {
      label,
      value: key,
    }
  })
}

/**
 * 获取 IoT 标签选项列表
 * @returns {Array<{label: string, value: string, children: Array<{label: string, value: number}>}>} IoT 标签选项数组
 */
const getIotTagOptions = () => {
  /**
   * 子选项映射表
   * 定义不同 IoT 设备类型的子选项
   * @type {Object.<string, Array<{label: string, value: number}>>}
   */
  const CHILDREN_OPTIONS_MAP = {
    [IOT_TYPE_ENUM.CAMERA]: [
      {
        label: CAMERA_VIDEO_MODE_DESC[CAMERA_VIDEO_MODE_ENUM.VOD],
        value: CAMERA_VIDEO_MODE_ENUM.VOD,
      },
      {
        label: CAMERA_VIDEO_MODE_DESC[CAMERA_VIDEO_MODE_ENUM.LIVE],
        value: CAMERA_VIDEO_MODE_ENUM.LIVE,
      },
    ],
    [IOT_TYPE_ENUM.IOT]: [
      {
        label: DEVICE_STATE_DESC[DEVICE_STATE_ENUM.NORMAL],
        value: DEVICE_STATE_ENUM.NORMAL,
      },
      {
        label: DEVICE_STATE_DESC[DEVICE_STATE_ENUM.ERROR],
        value: DEVICE_STATE_ENUM.ERROR,
      },
    ],
  }

  return Object.keys(TAG_IOT_TYPE_ENUM).map(key => {
    return {
      label: TAG_IOT_TYPE_ENUM[key],
      value: key,
      children: CHILDREN_OPTIONS_MAP[key],
    }
  })
}

/**
 * 根据类型获取标签选项
 * @param {string} type - 标签类型（'normal' 或 'iot'）
 * @returns {Array<{label: string, value: string}>} 对应类型的标签选项数组
 */
const getTagOptions = type => {
  if (type === 'normal') {
    return getNormalTagOptions()
  } else if (type === 'iot') {
    return getIotTagOptions()
  } else {
    return []
  }
}

/**
 * 搜索选项配置
 * 定义标签搜索功能的选项结构
 * @readonly
 * @type {Array<{value: string, label: string, children: Array<{label: string, value: string}>}>}
 */
export const SEARCH_OPTIONS = [
  {
    value: 'normal',
    label: '普通热点',
    children: [...getTagOptions('normal')],
  },
  {
    value: 'iot',
    label: 'IoT热点',
    children: [...getTagOptions('iot')],
  },
]
