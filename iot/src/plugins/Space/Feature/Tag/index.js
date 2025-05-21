import {
  DEVICE_STATE_ENUM,
  SDK_EVENT_NAME_ENUM,
  SPACE_EVENT_NAME_ENUM,
} from '@/constants'
import dataCenter from '../../DataCenter/index.js'
import { TAG_VISIBLE_COMPUTE_RULE_ENUM } from '@/constants'
import { equipmentService } from '@/services/equipment.js'
import { getLocalImgSize } from '@/utils.js'
import {
  getIotIdMap,
  getIotTagIdMap,
  getTagIotType,
  getTagPluginData,
} from '../../DataCenter/iot.js'

const { HotspotTag } = window

// 标签详情中，存储相机相关配置的字段
const modeVisibleParamMap = {
  panorama: 'pano_config',
  dollhouse: 'three_dimensional_config',
}

const DEFAULT_TAG_VISIBLE_COMPUTE_RULE_LIST = Object.values(
  TAG_VISIBLE_COMPUTE_RULE_ENUM
)

export class Tag {
  constructor(injection) {
    this.space = injection.space
    this.qspace = injection.space.qspace
    // 该功能中使用到的功能插件&应用插件
    this.plugin = {}
    /** @type {Object} 热点标签插件实例 */
    this.plugin.hotspotTag = null
    // 渲染标签的数据
    this.tagData = null
    // 标签id与标签数据（传给插件的）映射
    this.tagIdToData = {}
    // 标签id与渲染然后的标签数据映射
    this.tagRenderDataMap = new Map()
  }

  // 初始化热点标签功能
  init() {
    const hotspotTag = (this.plugin.hotspotTag = new HotspotTag())
    const { resourceBaseUrl } = this.space

    hotspotTag.init({
      res: {
        head_bg: `${resourceBaseUrl}/e100_sdk/tag-head-bg.png`,
        base_plate: `${resourceBaseUrl}/e100_sdk/tag.base.plate.png`,
        rotate_control_torus: `${resourceBaseUrl}/e100_sdk/torus_2x.png`,
        rotate_control_arc_surface: `${resourceBaseUrl}/e100_sdk/arc_surface_2x.png`,
      },
    })

    this.qspace.extension.mount(hotspotTag, () => {
      // 插件挂载后注册设备状态更新，根据告警状态更新热点图标
      equipmentService.addStateChangeListener((deviceId, state) => {
        const iotIdMap = getIotIdMap()
        const tagId = iotIdMap[deviceId]
        const loadedTagData = this.tagRenderDataMap.get(tagId)
        const preLoadTagData = getTagPluginData(tagId)

        switch (state) {
          case DEVICE_STATE_ENUM.NORMAL: {
            // 更新标签纹理（静态图片）
            this.updateTagTexture({
              uuid: loadedTagData.uuid,
              tagData: preLoadTagData,
              textureType: preLoadTagData.face.type,
              textureSrc: preLoadTagData.face.src,
              scale: preLoadTagData.face.scale,
              bgColor: preLoadTagData.face.bg_color,
              bgOpacity: preLoadTagData.face.bg_opacity,
            })
            break
          }
          case DEVICE_STATE_ENUM.ERROR: {
            // 更新标签纹理（雪碧图）
            this.updateTagTexture({
              uuid: loadedTagData.uuid,
              tagData: preLoadTagData,
              textureType: 'sprite',
              textureSrc: new URL(
                '@/assets/img/tag/iot_danger_20_fps.png',
                import.meta.url
              ).href,
              scale: preLoadTagData.face.scale * 2.25,
              bgColor: '#FFFFFF',
              bgOpacity: 0,
            })
            break
          }
          default: {
            console.error(`unknown state: ${state}`)
          }
        }
      })
    })

    // 鼠标在标签头上，禁用点位切换，防止点击时触发多个事件
    // 也可用同样方式处理标签标题
    hotspotTag.addEventListener(SDK_EVENT_NAME_ENUM.TAG.HEAD_HOVER, _tag => {
      this.space.feature.waypoint.disableSwitch()
    })

    // 鼠标移出标签头，恢复点位切换
    hotspotTag.addEventListener(SDK_EVENT_NAME_ENUM.TAG.HEAD_HOVEROUT, _tag => {
      this.space.feature.waypoint.enableSwitch()
    })

    // 点击标签头
    hotspotTag.addEventListener(SDK_EVENT_NAME_ENUM.TAG.HEAD_CLICK, tag => {
      console.log(`output->tag`, tag)
      // 获取标签业务数据信息
      const tagInfo = this.getHotspotTagInfo(tag.id)
      // 派发一个开始标签点击的事件
      this.space.emit(SPACE_EVENT_NAME_ENUM.TAG.HEAD_CLICK, tagInfo)

      // 检查标签类型
      const tagType = tagInfo.keyword?.split('_')[0]?.toLowerCase()

      // 如果是摄像头标签，则飞入后播放视频
      if (tagType === 'camera') {
        import('@/services/video').then(({ videoService }) => {
          this.flyToTag(tag.id, async () => {
            await videoService.playCamera(tag.id)
          })
        })
      } else {
        this.flyToTag(tag.id)
      }
    })

    // 目前平面模式未显示标签
    this.qspace.view.addEventListener(
      SDK_EVENT_NAME_ENUM.VIEW.MODE_CHANGE,
      mode => {
        if (['panorama', 'dollhouse'].includes(mode)) {
          this.computeTagVisible()
        }
        if (mode === 'floorplan') {
          this.hideAll()
        }
      }
    )

    this.qspace.model.addEventListener(
      SDK_EVENT_NAME_ENUM.MODEL.SWITCH_WAYPOINT_COMPLETE,
      () => this.computeTagVisible()
    )

    this.qspace.model.addEventListener(
      SDK_EVENT_NAME_ENUM.MODEL.SWITCH_WAYPOINT_TRANSITION,
      () => this.computeTagVisible()
    )

    // 每次切换场景，先把当前场景已加载的标签都删除，场景加载完成后会加载新场景中的标签
    this.space.on(SPACE_EVENT_NAME_ENUM.SCENE.SWITCH_START, () => {
      this.removeAll()
    })
  }

  /**
   * 更新标签纹理
   * @param {Object} params 更新参数
   * @param {string} params.uuid 标签UUID
   * @param {Object} params.tagData 标签数据，必须包含face属性
   * @param {Object} params.tagData.face 标签面部配置
   * @param {string} params.tagData.face.width 标签宽度
   * @param {string} params.tagData.face.height 标签高度
   * @param {string} params.tagData.face.scale 标签默认缩放
   * @param {string} params.tagData.face.bg_color 标签默认背景色
   * @param {number} params.tagData.face.bg_opacity 标签默认背景透明度
   * @param {string} params.textureType 纹理类型：'jpg'|'png'|'gif'|'sprite'等
   * @param {string} params.textureSrc 纹理资源路径
   * @param {number} params.scale 标签缩放比例
   * @param {string} params.bgColor 标签背景颜色
   * @param {number} params.bgOpacity 标签背景透明度
   */
  async updateTagTexture(params) {
    const {
      uuid,
      tagData,
      textureType = 'png',
      textureSrc,
      scale,
      bgColor,
      bgOpacity,
    } = params

    if (!uuid || !tagData || !tagData.face || !textureSrc) {
      console.error('更新标签纹理参数不完整', params)
      return
    }

    const hotspotTag = this.plugin.hotspotTag
    if (!hotspotTag) {
      console.error('热点标签插件未初始化')
      return
    }

    // 基础纹理设置
    const textureParams = {
      uuid,
      type: textureType,
      src: textureSrc,
      width: tagData.face.width,
      height: tagData.face.height,
    }

    // 如果是sprite类型，添加额外动画参数
    if (textureType === 'sprite') {
      const iconSize = await getLocalImgSize(textureSrc)

      Object.assign(textureParams, {
        tile_horizontal: 1,
        tile_vertical: iconSize.height / iconSize.width,
        tile_duration: 1000 / (iconSize.height / iconSize.width),
        tile_count: iconSize.height / iconSize.width,
      })
    }

    // 更新纹理
    hotspotTag.setFaceTexture(textureParams)
    // 更新缩放
    hotspotTag.setTagScale({
      uuid,
      scale: scale || tagData.face.scale,
    })
    // 更新背景颜色
    hotspotTag.setHeadBgColor({
      uuid,
      color: bgColor || tagData.face.bg_color,
    })
    // 更新背景透明度
    hotspotTag.setHeadBgOpacity({
      uuid,
      opacity:
        typeof bgOpacity === 'number' ? bgOpacity : tagData.face.bg_opacity,
    })
  }

  // 设置标签数据
  setData(data) {
    this.tagData = data
    data.forEach(tag => (this.tagIdToData[tag.id] = tag))
  }

  // 获取标签数据
  getData() {
    return this.tagData
  }

  // 更新热点标签
  update() {
    if (!this.tagData) {
      return
    }

    const { hotspotTag } = this.plugin

    hotspotTag.load({
      data: this.tagData,
      success: () => {
        // hotspotTag.setVisualRange(5)
        this.computeTagVisible()

        // hotspotTag.getAllData().forEach(t => this.tagRenderDataMap.set())
      },
      failed: () => console.log('tags load failed!'),
    })
  }

  showTag(uuid) {
    this.plugin.hotspotTag.show(uuid)
    this.plugin.hotspotTag.hasTitle(uuid) &&
      this.plugin.hotspotTag.showTitle(uuid)
  }

  hideTag(uuid) {
    this.plugin.hotspotTag.hide(uuid)
    this.plugin.hotspotTag.hasTitle(uuid) &&
      this.plugin.hotspotTag.hideTitle(uuid)
  }

  computeTagVisible(ruleList) {
    const _ruleList = ruleList || DEFAULT_TAG_VISIBLE_COMPUTE_RULE_LIST
    const { hotspotTag } = this.plugin
    const tagList = hotspotTag.getAllData()
    const modeVisibleParam = modeVisibleParamMap[this.space.viewMode]

    if (!modeVisibleParam) {
      return
    }

    const TAG_VISIBLE_HANDLER_MAP = {
      [TAG_VISIBLE_COMPUTE_RULE_ENUM.OUT_VISUAL_RANGE]:
        this.middleComputeHeadIsOutVisualRange,
      [TAG_VISIBLE_COMPUTE_RULE_ENUM.OUT_CAMERA]:
        this.middleComputeHeadIsOutCamera,
      [TAG_VISIBLE_COMPUTE_RULE_ENUM.BARRIER_WITHIN_MODEL]:
        this.middleComputeBarrierWithinModel,
    }

    tagList.forEach(tag => {
      const { id, uuid } = tag
      const tagInfo = this.getHotspotTagInfo(id)

      this.tagRenderDataMap.set(id, tag)

      // 后台配置该需要隐藏
      // or 在当前相机模式不显示
      // 老版本数据，tagInfo[modeVisibleParam] 可能不存在，即不可配置显隐，在该模式下显示
      if (
        !this.tagIdToData[id].visible ||
        (tagInfo[modeVisibleParam] && !tagInfo[modeVisibleParam].visible)
      ) {
        this.hideTag(uuid)

        return
      }

      // 全景相机，计算后续遮挡等信息
      if (this.space.viewMode !== 'panorama') {
        this.showTag(uuid)

        return
      }

      const isVisible = _ruleList.reduce(
        (pre, r) => pre && !TAG_VISIBLE_HANDLER_MAP[r](uuid),
        true
      )

      isVisible ? this.showTag(uuid) : this.hideTag(uuid)
    })
  }

  // 通过标签id获取热点标签业务信息
  getHotspotTagInfo(tagId) {
    const { currentSceneId } = this.space
    const tagSourceList = dataCenter.getHotspotTagSourceList(currentSceneId)
    const info = tagSourceList.find(tagSourceItem => tagSourceItem.id === tagId)

    // 内容信息
    // info.content.text.content
    // 标题
    // info.content.title_info.text
    // 关键字（如果数据版本较低，此字段可能不存在）
    // info.keyword

    return info
  }

  // 显示所有初始 visible 为 true 的标签
  showAll() {
    const { hotspotTag } = this.plugin

    if (!hotspotTag) {
      return
    }

    hotspotTag.getAllData().forEach((tag, index) => {
      if (this.tagData[index].visible) {
        hotspotTag.show(tag.uuid)
      }
    })
  }

  // 隐藏所有标签
  hideAll() {
    const { hotspotTag } = this.plugin

    if (!hotspotTag) {
      return
    }

    hotspotTag.getAllData().forEach(tag => hotspotTag.hide(tag.uuid))
  }

  // 移出当前加载的所有标签
  removeAll() {
    const { hotspotTag } = this.plugin

    if (!hotspotTag) {
      return
    }

    hotspotTag.getAllData().forEach(tag => hotspotTag.del(tag.uuid))
  }

  /* 飞向标签 */
  flyToTag(id, onComplete) {
    const cameraFeature = this.space.feature.camera
    const targetTag = this.tagIdToData[id]
    const tagInfo = this.getHotspotTagInfo(id)
    console.log(`targetTag`, targetTag)
    console.log(`output->tagInfo`, tagInfo)

    const iotTagIdMap = getIotTagIdMap()

    this.space.emit(SPACE_EVENT_NAME_ENUM.TAG.BEGIN_FLY_TO)

    // 当前模型的类型
    const sceneType = this.qspace.model.type

    // 在非全景图场景中，如果标签没有绑定点位，说明是仅 3d 模式显示的标签
    if (sceneType !== 'purepano' && !tagInfo.location_id) {
      const {
        label_control_target_3d: target3d,
        label_camera_position_3d: position3d,
        label_camera_quaternion_3d: quaternion3d,
      } = tagInfo

      const targetPose = {
        target: target3d,
        position: position3d,
        quaternion: quaternion3d,
      }

      cameraFeature.lookAt3d({
        targetPose,
        duration: 500,
      })

      return
    }

    // 如果当前点位和标签绑定的点位相同
    // 或当前为全景图，全景图只有一个点位
    // 此时相机看向标签
    if (
      this.space.currentWaypoint === targetTag.location_id ||
      sceneType === 'purepano'
    ) {
      cameraFeature.lookAt({
        duration: 500,
        // quaternion: targetTag.rotation,
        target: targetTag.position,
        complete: async () => {
          this.space.emit(SPACE_EVENT_NAME_ENUM.OPEN_TAG_POPUP, {
            tagInfo,
            renderedTag: this.tagRenderDataMap.get(id),
            deviceId: iotTagIdMap[id],
            type: getTagIotType(id),
          })

          if (onComplete) {
            await onComplete()
          }
        },
      })
    } else {
      // 启用点位切换，因为在标签 head.hover 时禁用了
      this.space.feature.waypoint.enableSwitch()
      // 移动到标签绑定的点位，并看向它
      this.qspace.model.switchWaypoint({
        location_id: targetTag.location_id,
        // quaternion: targetTag.rotation,
        lookat_target: targetTag.position,
        free_rotate: false,
        complete: async () => {
          this.space.emit(SPACE_EVENT_NAME_ENUM.OPEN_TAG_POPUP, {
            tagInfo,
            renderedTag: this.tagRenderDataMap.get(id),
            deviceId: iotTagIdMap[id] ?? '',
            type: getTagIotType(id),
          })

          if (onComplete) {
            await onComplete()
          }
        },
      })
    }
  }

  /** 计算标签是否在可视范围 */
  middleComputeHeadIsOutVisualRange = uuid => {
    // 全景图，可视范围不可以生效，固定未超出可视范围
    if (this.qspace.model.type === 'purepano') {
      return false
    }

    return this.plugin.hotspotTag.computeHeadIsOutVisualRange(uuid)
  }

  /** 计算标签是否被模型遮挡 */
  middleComputeHeadIsOutCamera = uuid => {
    return this.plugin.hotspotTag.computeHeadIsOutCamera(uuid)
  }
  /** 计算标签是否被模型遮挡 */
  middleComputeBarrierWithinModel = uuid => {
    return this.plugin.hotspotTag.computeHeadIsBarrierWithinModel(uuid)
  }
}
