/* SDK 原生事件 */
const SDK_EVENT_NAME_ENUM = {
  ENTRY_PANO_LOADED: 'entry.pano.loaded',
  MODEL_TEXTURE_LOADED: 'model.texture.loaded',
  PANORAMA_CAMERA_ROTATION: 'rotation',
  VIEW: {
    MODE_CHANGE: 'mode.change',
  },
  MODEL: {
    SWITCH_WAYPOINT_START: 'switch.waypoint.start',
    SWITCH_WAYPOINT_COMPLETE: 'switch.waypoint.complete',
  },
  TAG: {
    HEAD_CLICK: 'head.click',
    HEAD_HOVER: 'head.hover',
    HEAD_HOVEROUT: 'head.hoverout',
  },
  PUT_2D: {
    CLICK: 'click',
    HOVER: 'hover',
    HOVER_OUT: 'hover.out',
  },
}

/* 自定义派发的事件 */
const SPACE_EVENT_NAME_ENUM = {
  ENTRY_PANO_LOADED: 'entry.pano.loaded',
  MODEL_TEXTURE_LOADED: 'model.texture.loaded',
  OPEN_TAG_POPUP: 'open.tag.popup',
  PANORAMA_CAMERA_ROTATION: 'panorama.camera.rotation',
  TAG: {
    HEAD_CLICK: 'head.click',
    BEGIN_FLY_TO: 'begin.fly.to',
  },
  VIEW: {
    MODE_CHANGE: 'mode.change',
  },
  MODEL: {
    SWITCH_WAYPOINT_START: 'switch.waypoint.start',
    SWITCH_WAYPOINT_COMPLETE: 'switch.waypoint.complete',
  },
  SCENE: {
    SWITCH_START: 'space.scene.switch.start',
  },
}

export { SDK_EVENT_NAME_ENUM, SPACE_EVENT_NAME_ENUM }
