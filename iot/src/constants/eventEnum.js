/**
 * 事件名称枚举定义
 * 包含 SDK 原生事件和自定义事件的名称常量
 */

/**
 * SDK 原生事件名称枚举
 * 定义 qspace SDK 中的原生事件名称
 * @readonly
 * @enum {string|Object}
 */
export const SDK_EVENT_NAME_ENUM = {
  /** 首入全景加载完成事件 */
  ENTRY_PANO_LOADED: 'entry.pano.loaded',
  /** 模型纹理加载完成事件 */
  MODEL_TEXTURE_LOADED: 'model.texture.loaded',
  /** 全景相机旋转事件 */
  PANORAMA_CAMERA_ROTATION: 'rotation',

  /** 视图相关事件 */
  VIEW: {
    /** 视图模式变更事件 */
    MODE_CHANGE: 'mode.change',
  },

  /** 模型相关事件 */
  MODEL: {
    /** 点位切换开始事件 */
    SWITCH_WAYPOINT_START: 'switch.waypoint.start',
    /** 点位切换完成事件 */
    SWITCH_WAYPOINT_COMPLETE: 'switch.waypoint.complete',
    /** 点位切换过渡事件 */
    SWITCH_WAYPOINT_TRANSITION: 'switch.waypoint.transition',
  },

  /** 热点标签相关事件 */
  TAG: {
    /** 标签头部点击事件 */
    HEAD_CLICK: 'head.click',
    /** 标签头部悬停事件 */
    HEAD_HOVER: 'head.hover',
    /** 标签头部悬停离开事件 */
    HEAD_HOVEROUT: 'head.hoverout',
  },

  /** 2D 物品摆放相关事件 */
  PUT_2D: {
    /** 2D 物品点击事件 */
    CLICK: 'click',
    /** 2D 物品悬停事件 */
    HOVER: 'hover',
    /** 2D 物品悬停离开事件 */
    HOVER_OUT: 'hover.out',
  },
}

/**
 * 自定义派发的事件名称枚举
 * 定义应用层自定义的事件名称
 * @readonly
 * @enum {string|Object}
 */
export const SPACE_EVENT_NAME_ENUM = {
  /** 首入全景加载完成事件 */
  ENTRY_PANO_LOADED: 'entry.pano.loaded',
  /** 模型纹理加载完成事件 */
  MODEL_TEXTURE_LOADED: 'model.texture.loaded',
  /** 打开标签弹窗事件 */
  OPEN_TAG_POPUP: 'open.tag.popup',
  /** 全景相机旋转事件 */
  PANORAMA_CAMERA_ROTATION: 'panorama.camera.rotation',

  /** 标签相关事件 */
  TAG: {
    /** 标签头部点击事件 */
    HEAD_CLICK: 'head.click',
    /** 开始飞行到标签事件 */
    BEGIN_FLY_TO: 'begin.fly.to',
  },

  /** 视图相关事件 */
  VIEW: {
    /** 视图模式变更事件 */
    MODE_CHANGE: 'mode.change',
  },

  /** 模型相关事件 */
  MODEL: {
    /** 点位切换开始事件 */
    SWITCH_WAYPOINT_START: 'switch.waypoint.start',
    /** 点位切换完成事件 */
    SWITCH_WAYPOINT_COMPLETE: 'switch.waypoint.complete',
  },

  /** 场景相关事件 */
  SCENE: {
    /** 场景切换开始事件 */
    SWITCH_START: 'space.scene.switch.start',
  },
}
