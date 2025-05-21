import { inject, ref, onBeforeUnmount, watch, computed } from 'vue'
import {
  DEVICE_STATE_ENUM,
  IOT_TYPE_ENUM,
  SPACE_EVENT_NAME_ENUM,
} from '@/constants'
import {
  equipmentService,
  EQUIPMENT_THRESHOLDS_CONFIG,
} from '@/services/equipment'
import { getIotTagIdMap } from '@/plugins/Space/DataCenter/iot'

export function useTagPopup() {
  const space = inject('space')
  // 弹窗显示状态
  const tagPopupVisible = ref(false)
  // 当前显示的标签（接口原始数据）
  const currentTag = ref(null)
  // 当前渲染的标签（热点插件返回的标签数据）
  const currentRenderTag = ref(null)
  // 弹窗显示的位置
  const tagPopupPosition = ref({ top: 100, left: 0 })
  // 当前设备整体告警状态
  const isError = ref(DEVICE_STATE_ENUM.NORMAL)
  // 设备数据
  const equipmentData = ref({
    ratedVoltage: '',
    ratedCurrent: '',
    ratedPower: '',
    ratedFrequency: '',
    ratedSpeed: '',
    mechanicalRatio: '',
  })
  // 设备字段级告警状态
  const equipmentAlerts = ref({
    ratedVoltage: false,
    ratedCurrent: false,
    ratedPower: false,
    ratedFrequency: false,
    ratedSpeed: false,
    mechanicalRatio: false,
  })

  // 计算告警字段数量
  const alertCount = computed(() => {
    return Object.values(equipmentAlerts.value).filter(v => v).length
  })

  // 监听告警数量变化
  watch(alertCount, () => {
    if (tagPopupVisible.value) {
      updatePosition()
    }
  })

  // 监听设备状态变化
  const iotTagIdMap = getIotTagIdMap()
  const handleStateChange = (deviceId, state) => {
    if (currentTag.value && iotTagIdMap[currentTag.value.id] === deviceId) {
      isError.value = state

      // 同时更新告警状态
      const alerts = equipmentService.getDeviceAlerts(deviceId)
      equipmentAlerts.value = alerts
    }
  }

  // 更新设备数据
  const updateEquipmentData = data => {
    equipmentData.value = data
  }

  // 获取字段的阈值提示
  const getThresholdTip = field => {
    if (!EQUIPMENT_THRESHOLDS_CONFIG[field]) {
      return ''
    }
    const { min, max, unit } = EQUIPMENT_THRESHOLDS_CONFIG[field]
    return `阈值范围: ${min}-${max}${unit}`
  }

  const updatePosition = () => {
    if (!currentTag.value) {
      return
    }

    const { x, y } = space.qspace.sceneCamera.convertWorldPositionToScreen(
      currentTag.value.position
    )
    console.log(`output->tag.x`, x)
    console.log(`output->tag.y`, y)

    tagPopupPosition.value.left = x - 100
    console.log(
      `output->HeadScreenTop`,
      space.feature.tag.plugin.hotspotTag.getHeadScreenTop(
        currentRenderTag.value?.uuid
      )
    )

    if (currentRenderTag.value && currentTag.value) {
      tagPopupPosition.value.top =
        space.feature.tag.plugin.hotspotTag.getHeadScreenTop(
          currentRenderTag.value.uuid
        ).y -
        166 -
        (currentTag.value.content.title_config.distance_icon_space +
          currentTag.value.content.title_config.fontHeight +
          currentTag.value.content.title_config.shadow_raduis +
          currentTag.value.content.title_config.background_stroke_line_size) -
        2 -
        38 * (alertCount.value + 1)
    }
  }

  // 设置设备监听器
  const setupDeviceListeners = deviceId => {
    if (!deviceId) {
      console.error(`deviceId is needed!`)
      return
    }

    // 添加设备数据更新监听器
    equipmentService.registerDeviceDataUpdate(deviceId, updateEquipmentData)
    // 添加状态变化监听器
    equipmentService.addStateChangeListener(handleStateChange)
    // 获取当前设备状态
    isError.value = equipmentService.getDeviceState(deviceId)
    // 获取设备数据字段告警状态
    equipmentAlerts.value = equipmentService.getDeviceAlerts(deviceId)
  }

  const resetPopupState = () => {
    tagPopupVisible.value = false
    currentTag.value = null
    currentRenderTag.value = null
  }

  // 清理设备监听器
  const cleanupDeviceListeners = () => {
    if (currentTag.value) {
      equipmentService.unregisterDeviceDataUpdate(
        iotTagIdMap[currentTag.value.id],
        updateEquipmentData
      )
    }
    equipmentService.removeStateChangeListener(handleStateChange)
  }

  /* 注册事件监听 —— start */
  space.on(
    SPACE_EVENT_NAME_ENUM.OPEN_TAG_POPUP,
    ({ tagInfo, renderedTag, deviceId, type }) => {
      currentTag.value = tagInfo
      console.log(`output->tagInfo`, tagInfo)
      currentRenderTag.value = renderedTag
      console.log(`output->renderedTag`, renderedTag)
      console.log(`Container.vue output->deviceId`, deviceId)

      if (type !== IOT_TYPE_ENUM.IOT) {
        return
      }

      updatePosition()
      setupDeviceListeners(deviceId)
      tagPopupVisible.value = true
    }
  )
  space.on(SPACE_EVENT_NAME_ENUM.TAG.BEGIN_FLY_TO, () => {
    close()
  })
  space.on(SPACE_EVENT_NAME_ENUM.PANORAMA_CAMERA_ROTATION, () => {
    // 业务场景下需要限制位置更新的频率
    updatePosition()
  })
  space.on(SPACE_EVENT_NAME_ENUM.VIEW.MODE_CHANGE, () => {
    resetPopupState()
  })
  space.on(SPACE_EVENT_NAME_ENUM.MODEL.SWITCH_WAYPOINT_START, () => {
    resetPopupState()
  })
  space.on(SPACE_EVENT_NAME_ENUM.SCENE.SWITCH_START, () => {
    resetPopupState()
  })
  /* 注册事件监听 —— end */

  // 关闭弹窗时的处理
  const close = () => {
    cleanupDeviceListeners()
    resetPopupState()
  }

  onBeforeUnmount(() => {
    close()
  })

  return {
    tagPopupVisible,
    currentTag,
    currentRenderTag,
    tagPopupPosition,
    isError,
    equipmentData,
    equipmentAlerts,
    alertCount,
    getThresholdTip,
    updatePosition,
    close,
  }
}
