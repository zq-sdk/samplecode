/**
 * BI Dashboard 常量定义
 */

// 标签类型
export const TAG_TYPES = {
  BUILDING: 'building',
  DEVICE: 'device',
  IOT: 'iot',
  CAMERA: 'camera',
  OTHER: 'other',
}

// 设备状态
export const DEVICE_STATUS = {
  NORMAL: 0,
  WARNING: 1,
}

// 视图模式
export const VIEW_MODES = {
  PANORAMA: 'panorama',
  DOLLHOUSE: 'dollhouse',
  FLOORPLAN: 'floorplan',
}

export const VIEW_MODES_LABELS = {
  [VIEW_MODES.PANORAMA]: '全景模式',
  [VIEW_MODES.DOLLHOUSE]: '3D模式',
  [VIEW_MODES.FLOORPLAN]: '平面图模式',
}

// 场景类型
export const SCENE_TYPES = {
  MODEL: 'model',
  VIRTUAL: 'virtual',
  PUREPANO: 'purepano',
  DSM: 'dsm',
}

export const SCENE_TYPES_LABELS = {
  [SCENE_TYPES.MODEL]: '3D模型',
  [SCENE_TYPES.VIRTUAL]: '虚拟模型',
  [SCENE_TYPES.PUREPANO]: '全景图',
  [SCENE_TYPES.DSM]: '倾斜摄影模型',
}

// 标签所在模式
export const TAG_MODE_TYPES = {
  PANORAMA: 1,
  DOLLHOUSE: 2,
}

export const TAG_VIEW_MODES = {
  [TAG_MODE_TYPES.PANORAMA]: VIEW_MODES.PANORAMA,
  [TAG_MODE_TYPES.DOLLHOUSE]: VIEW_MODES.DOLLHOUSE,
}
