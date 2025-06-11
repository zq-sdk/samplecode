/**
 * 事件名称枚举
 */
export const EVENT_NAMES = {
  // SDK 事件
  SDK: {
    TAG: {
      HEAD_CLICK: 'head.click',
      HEAD_HOVER: 'head.hover',
      HEAD_HOVEROUT: 'head.hoverout',
      TITLE_CLICK: 'title.click',
      TITLE_HOVER: 'title.hover',
      TITLE_HOVEROUT: 'title.hoverout',
      LOAD_COMPLETE: 'tags.loaded',
      ADD_COMPLETE: 'new.put.down',
      BLANK_AREA_CLICK: 'blankarea.click',
      VISUAL_RANGE_CHANGED: 'visual.range.changed',
    },
    VIEW: {
      MODE_CHANGE: 'mode.change',
    },
    MODEL: {
      SWITCH_WAYPOINT_COMPLETE: 'switch.waypoint.complete',
      SWITCH_WAYPOINT_TRANSITION: 'switch.waypoint.transition',
    },
  },

  // 自定义事件
  CUSTOM: {
    TAG: {
      VISIBILITY_CHANGED: 'tag_visibility_changed',
      RANGE_SET: 'tag_range_set',
      RANGE_CANCELLED: 'tag_range_cancelled',
    },
  },
}
