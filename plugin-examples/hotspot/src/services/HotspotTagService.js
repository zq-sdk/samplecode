import {
  EVENT_NAMES,
  VIEW_MODES,
  VISIBILITY_RULES,
} from '../constants/index.js'
import { logger } from '../utils/logger.js'

/**
 * Hotspot 标签服务类
 * 封装 HotspotTag 插件的部分功能，提供统一的 API 接口
 */
export class HotspotTagService {
  constructor() {
    this.qspace = null
    this.plugin = null
    this.isInitialized = false
    this.tagDataMap = new Map() // 存储标签数据
    this.selectedTagUuid = null // 当前选中的标签uuid
    this.isAddingTag = false // 是否正在添加标签模式
    this.isVisibleCheckEnabled = false // 是否开启可见检测
    this.eventListeners = new Map() // 事件监听器
  }

  /**
   * 初始化服务
   * @param {Object} qspace qspace 实例
   * @param {Object} config 配置参数
   */
  async init(qspace, config = {}) {
    try {
      this.qspace = qspace
      this.plugin = new window.HotspotTag()

      // 初始化插件
      await this.initPlugin(config)

      // 挂载插件到 qspace
      await this.mountPlugin()

      this.isInitialized = true

      logger.success('HotspotTag 服务初始化成功')
    } catch (error) {
      logger.error('HotspotTag 服务初始化失败', error)
      throw error
    }
  }

  /**
   * 初始化插件配置
   * @param {Object} config 配置参数
   */
  async initPlugin(config) {
    const defaultConfig = {
      res: {
        head_bg: './assets/images/tag-head-bg.png',
        base_plate: './assets/images/tag-base-plate.png',
        rotate_control_torus: './assets/images/torus.png',
        rotate_control_arc_surface: './assets/images/arc-surface.png',
      },
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.plugin.init(finalConfig)

    logger.info('插件配置初始化完成', finalConfig)
  }

  /**
   * 挂载插件到 qspace
   */
  async mountPlugin() {
    return new Promise((resolve, reject) => {
      this.qspace.extension.mount(
        this.plugin,
        () => {
          logger.success('插件挂载成功')
          resolve()
        },
        error => {
          logger.error('插件挂载失败', error)
          reject(error)
        }
      )
    })
  }

  /**
   * 注册事件监听器
   */
  registerEventListeners() {
    // 标签头点击事件
    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.HEAD_CLICK, tag => {
      logger.info('标签头被点击', tag)
      if (this.selectedTagUuid && this.selectedTagUuid !== tag.uuid) {
        this.plugin.unchoose(this.selectedTagUuid)
        this.plugin.unbindTransformControl(this.selectedTagUuid)
      }

      this.selectedTagUuid = tag.uuid
      this.plugin.choose(tag.uuid)
      this.plugin.bindTransformControl(tag.uuid)
      this.emit('tagHeadClick', tag)

      if (this.qspace.model.isEnabledSwitchWaypoint) {
        this.qspace.model.disableSwitchWaypoint()
      }
    })

    // 标签头悬停事件
    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.HEAD_HOVER, tag => {
      logger.info('鼠标悬停在标签头上', tag)
      this.emit('tagHeadHover', tag)
    })

    // 标签头悬停离开事件
    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.HEAD_HOVEROUT, tag => {
      logger.info('鼠标离开标签头', tag)
      this.emit('tagHeadHoverOut', tag)

      if (!this.qspace.model.isEnabledSwitchWaypoint) {
        this.qspace.model.enableSwitchWaypoint()
      }
    })

    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.BLANK_AREA_CLICK, () => {
      logger.info('空白区域被点击')
      this.plugin.unchoose(this.selectedTagUuid)
      this.plugin.unbindTransformControl(this.selectedTagUuid)
      this.selectedTagUuid = null
      this.emit('blankAreaClick')

      if (!this.qspace.model.isEnabledSwitchWaypoint) {
        this.qspace.model.enableSwitchWaypoint()
      }
    })

    // 标签加载完成事件
    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.LOAD_COMPLETE, tags => {
      logger.success('所有标签加载完成', { count: tags.length })
      this.emit('tagsLoadComplete', tags)
    })

    // 新标签摆放成功事件
    this.plugin.addEventListener(EVENT_NAMES.SDK.TAG.ADD_COMPLETE, tag => {
      logger.success('新标签摆放成功', tag)
      this.tagDataMap.set(tag.uuid, tag)
      this.isAddingTag = false
      this.emit('tagAddComplete', tag)
    })

    // 视图模式变化事件
    this.qspace.view.addEventListener(
      EVENT_NAMES.SDK.VIEW.MODE_CHANGE,
      data => {
        logger.info('视图模式已切换', data)
        this.handleViewModeChange(data)
        this.emit('viewModeChange', data)
      }
    )

    // 点位切换完成事件
    this.qspace.model.addEventListener(
      EVENT_NAMES.SDK.MODEL.SWITCH_WAYPOINT_COMPLETE,
      () => {
        logger.info('点位切换完成')
        // 计算标签可见性
        if (this.isVisibleCheckEnabled) {
          this.handleTagsVisibilityComputed(this.computeTagsVisibility())
        }
      }
    )

    // 点位切换过程事件
    this.qspace.model.addEventListener(
      EVENT_NAMES.SDK.MODEL.SWITCH_WAYPOINT_TRANSITION,
      () => {
        logger.info('点位切换中')
        // 计算标签可见性
        if (this.isVisibleCheckEnabled) {
          this.handleTagsVisibilityComputed(this.computeTagsVisibility())
        }
      }
    )

    // 监听全景视图，相机旋转
    this.qspace.panoramaCamera.addEventListener('rotation', () => {
      // 计算标签可见性
      if (this.isVisibleCheckEnabled) {
        this.handleTagsVisibilityComputed(
          this.computeTagsVisibility([
            VISIBILITY_RULES.OUT_OF_CAMERA,
            VISIBILITY_RULES.OUT_OF_VISUAL_RANGE,
          ])
        )
      }
    })

    // 监听3D视图，相机旋转
    this.qspace.dollhouseCamera.addEventListener('rotation', () => {
      // 计算标签可见性
      if (this.isVisibleCheckEnabled) {
        this.handleTagsVisibilityComputed(
          this.computeTagsVisibility([
            VISIBILITY_RULES.OUT_OF_CAMERA,
            VISIBILITY_RULES.BLOCKED_BY_MODEL,
          ])
        )
      }
    })

    // 监听可见范围变化
    this.plugin.addEventListener(
      EVENT_NAMES.SDK.TAG.VISUAL_RANGE_CHANGED,
      range => {
        logger.info('可见范围已变化', { range })
        if (this.isVisibleCheckEnabled) {
          this.handleTagsVisibilityComputed(
            this.computeTagsVisibility([VISIBILITY_RULES.OUT_OF_VISUAL_RANGE])
          )
        }
        this.emit('visibleRangeChanged', range)
      }
    )
  }

  /**
   * 处理视图模式变化
   * @param {string} mode 视图模式
   */
  handleViewModeChange(mode) {
    switch (mode) {
      case VIEW_MODES.PANORAMA:
        this.showAllTags()
        if (this.isVisibleCheckEnabled) {
          this.handleTagsVisibilityComputed(this.computeTagsVisibility())
        }
        break
      case VIEW_MODES.DOLLHOUSE:
        this.showAllTags()
        if (this.isVisibleCheckEnabled) {
          this.handleTagsVisibilityComputed(
            this.computeTagsVisibility([
              VISIBILITY_RULES.OUT_OF_CAMERA,
              VISIBILITY_RULES.BLOCKED_BY_MODEL,
            ])
          )
        }
        break
      case VIEW_MODES.FLOORPLAN:
        this.hideAllTags()
        break
      case VIEW_MODES.TRANSITIONING:
        this.hideAllTags()
        break
      default:
        logger.error('不支持的视图模式', mode)
    }
  }

  /**
   * 处理标签可见性计算结果
   * @param {Map} visibilityResults 标签可见性计算结果
   */
  handleTagsVisibilityComputed(visibilityResults) {
    for (const [uuid, result] of visibilityResults) {
      // 如果标签可见，则显示标签和标题
      if (result.isVisible) {
        this.plugin.show(uuid)
        this.plugin.hasTitle(uuid) && this.plugin.showTitle(uuid)
        continue
      }

      // 如果标签不可见是因为超出了可见范围，则隐藏标签和标题。超出相机视角范围和被遮挡会自动隐藏标签（不包括标签标题）
      if (result.hiddenReasons.includes(VISIBILITY_RULES.OUT_OF_VISUAL_RANGE)) {
        this.plugin.hide(uuid)
        this.plugin.hasTitle(uuid) && this.plugin.hideTitle(uuid)
      } else {
        this.plugin.hasTitle(uuid) && this.plugin.hideTitle(uuid)
      }
    }
  }

  /**
   * 加载标签数据
   * @param {Array} tagDataList 标签数据列表
   */
  async loadTags(tagDataList) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      logger.info('开始加载标签', { count: tagDataList.length })

      // 清空现有数据
      this.tagDataMap.clear()

      // 存储标签数据
      tagDataList.forEach(tagData => {
        this.tagDataMap.set(tagData.uuid, tagData)
      })

      // 调用插件加载方法
      return new Promise((resolve, reject) => {
        this.plugin.load({
          data: tagDataList,
          success: () => {
            logger.success('标签数据加载完成')
            this.plugin.getAllData().forEach(tag => {
              if (this.plugin.hasTitle(tag.uuid)) {
                tag.visible === true
                  ? this.plugin.showTitle(tag.uuid)
                  : this.plugin.hideTitle(tag.uuid)
              }
            })

            this.plugin.setVisualRange(5)
            if (this.isVisibleCheckEnabled) {
              this.handleTagsVisibilityComputed(this.computeTagsVisibility())
            }
            resolve()
          },
          failed: error => {
            logger.error('加载标签失败', error)
            reject(error)
          },
        })
      })
    } catch (error) {
      logger.error('加载标签失败', error)
      throw error
    }
  }

  /**
   * 开始添加标签模式
   * @param {Object} tagTemplate 标签模板数据
   */
  startAddingTag(tagTemplate = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      const defaultTemplate = {
        type: 'png',
        src: '//template.3dnest.cn/ncz/png/tag1.png',
        width: 200,
        height: 200,
        location_line_len: 0.3,
        face_scale: 1,
        position: { x: 500, y: 500 },
      }

      const finalTemplate = { ...defaultTemplate, ...tagTemplate }

      this.plugin.add(finalTemplate)
      this.isAddingTag = true

      logger.info('开始添加标签模式', finalTemplate)
    } catch (error) {
      logger.error('开始添加标签失败', error)
      throw error
    }
  }

  /**
   * 取消添加标签模式
   */
  cancelAddingTag() {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.unput()
      this.isAddingTag = false

      logger.info('已取消添加标签模式')
    } catch (error) {
      logger.error('取消添加标签失败', error)
      throw error
    }
  }

  /**
   * 删除指定标签
   * @param {string} uuid 标签uuid
   */
  deleteTag(uuid) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      if (!uuid) {
        throw new Error('标签uuid不能为空')
      }

      this.plugin.unbindTransformControl(uuid)
      this.plugin.del(uuid)
      this.tagDataMap.delete(uuid)

      if (this.selectedTagUuid === uuid) {
        this.selectedTagUuid = null
      }

      logger.success('标签删除成功', { uuid })
    } catch (error) {
      logger.error('删除标签失败', error)
      throw error
    }
  }

  /**
   * 显示指定标签
   * @param {string} uuid 标签uuid
   */
  showTag(uuid) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.show(uuid)
      logger.info('标签已显示', { uuid })
    } catch (error) {
      logger.error('显示标签失败', error)
      throw error
    }
  }

  /**
   * 隐藏指定标签
   * @param {string} uuid 标签uuid
   */
  hideTag(uuid) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.hide(uuid)
      logger.info('标签已隐藏', { uuid })
    } catch (error) {
      logger.error('隐藏标签失败', error)
      throw error
    }
  }

  /**
   * 显示所有标签
   */
  showAllTags() {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.getAllData().forEach(tag => {
        this.plugin.show(tag.uuid)
        this.plugin.hasTitle(tag.uuid) && this.plugin.showTitle(tag.uuid)
      })

      logger.success('所有标签已显示')
    } catch (error) {
      logger.error('显示所有标签失败', error)
      throw error
    }
  }

  /**
   * 隐藏所有标签
   */
  hideAllTags() {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.getAllData().forEach(tag => {
        this.plugin.hide(tag.uuid)
        this.plugin.hasTitle(tag.uuid) && this.plugin.hideTitle(tag.uuid)
      })

      logger.success('所有标签已隐藏')
    } catch (error) {
      logger.error('隐藏所有标签失败', error)
      throw error
    }
  }

  /**
   * 删除所有标签
   */
  removeAllTags() {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.getAllData().forEach(tag => {
        this.plugin.del(tag.uuid)
      })

      this.tagDataMap.clear()
      this.selectedTagUuid = null

      logger.success('所有标签已删除')
    } catch (error) {
      logger.error('删除所有标签失败', error)
      throw error
    }
  }

  /**
   * 设置标签可见范围
   * @param {number} range 可见范围配置
   */
  setTagVisibleRange(range) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.setVisualRange(range)

      logger.info(`标签可见范围已设置: ${range}m`)
      this.emit('tagRangeSet', range)
    } catch (error) {
      logger.error('设置标签可见范围失败', error)
      throw error
    }
  }

  /**
   * 取消标签可见范围
   */
  cancelTagVisibleRange() {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      this.plugin.unsetVisualRange()

      logger.info('标签可见范围已取消')
      this.emit('tagRangeCancelled')
    } catch (error) {
      logger.error('取消标签可见范围失败', error)
      throw error
    }
  }

  /**
   * 计算所有标签的可见性
   * @param {Array} rules 可见性计算规则列表
   * @returns {Map} 标签可见性计算结果
   */
  computeTagsVisibility(rules = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('服务未初始化')
      }

      const defaultRules = Object.values(VISIBILITY_RULES)
      const finalRules = rules || defaultRules

      const visibilityResults = new Map()

      for (const tag of this.plugin.getAllData()) {
        const result = this.computeTagVisibility(tag.uuid, finalRules)
        visibilityResults.set(tag.uuid, result)
      }

      logger.info('标签可见性计算完成', {
        totalTags: visibilityResults.size,
        results: Object.fromEntries(visibilityResults),
      })

      this.emit('tagsVisibilityComputed', visibilityResults)
      return visibilityResults
    } catch (error) {
      logger.error('计算标签可见性失败', error)
      throw error
    }
  }

  /**
   * 计算单个标签的可见性
   * @param {string} uuid 标签ID
   * @param {Array} rules 计算规则
   * @returns {Object} 可见性结果
   */
  computeTagVisibility(uuid, rules) {
    const result = {
      uuid,
      isVisible: true,
      hiddenReasons: [],
    }

    try {
      for (const rule of rules) {
        let isHidden = false

        switch (rule) {
          case VISIBILITY_RULES.OUT_OF_VISUAL_RANGE:
            isHidden = this.isTagOutOfVisualRange(uuid)
            if (!isHidden) {
              isHidden =
                this.plugin.checkHeadIsOutCamera(uuid) ||
                this.plugin.checkHeadIsBarrierByModel(uuid)
            }
            break
          case VISIBILITY_RULES.OUT_OF_CAMERA:
            isHidden = this.isTagOutOfCamera(uuid)
            if (!isHidden) {
              isHidden =
                this.plugin.checkHeadIsOutOfVisualRange(uuid) ||
                this.plugin.checkHeadIsBarrierByModel(uuid)
            }
            break
          case VISIBILITY_RULES.BLOCKED_BY_MODEL:
            isHidden = this.isTagBlockedByModel(uuid)
            if (!isHidden) {
              isHidden =
                this.plugin.checkHeadIsOutCamera(uuid) ||
                this.plugin.checkHeadIsOutOfVisualRange(uuid)
            }
            break
        }

        if (isHidden) {
          result.isVisible = false
          result.hiddenReasons.push(rule)
        }
      }
    } catch (error) {
      logger.error('计算标签可见性时出错', { uuid, error })
      result.isVisible = false
      result.hiddenReasons.push('calculation_error')
    }

    return result
  }

  /**
   * 检查标签头中点是否超出可视范围
   * @param {string} uuid 标签ID
   * @returns {boolean} 是否超出相机范围
   */
  isTagOutOfVisualRange(uuid) {
    try {
      return this.plugin.computeHeadIsOutVisualRange(uuid)
    } catch (error) {
      logger.warning('检查标签可视范围时出错', { uuid, error })
      return false
    }
  }

  /**
   * 检查标签头中点是否被模型遮挡
   * @param {string} uuid 标签ID
   * @returns {boolean} 是否被遮挡
   */
  isTagBlockedByModel(uuid) {
    try {
      return this.plugin.computeHeadIsBarrierWithinModel(uuid)
    } catch (error) {
      logger.warning('检查标签模型遮挡时出错', { uuid, error })
      return false
    }
  }

  /**
   * 检查标签头中点是否超出相机可视范围
   * @param {string} uuid 标签ID
   * @returns {boolean} 是否超出屏幕
   */
  isTagOutOfCamera(uuid) {
    try {
      return this.plugin.computeHeadIsOutCamera(uuid)
    } catch (error) {
      logger.warning('检查标签屏幕范围时出错', { uuid, error })
      return false
    }
  }

  /**
   * 切换视图模式
   * @param {string} mode 视图模式
   */
  switchViewMode(mode) {
    try {
      if (!Object.values(VIEW_MODES).includes(mode)) {
        throw new Error(`不支持的视图模式: ${mode}`)
      }

      switch (mode) {
        case VIEW_MODES.PANORAMA:
          // 切换到全景视图，需要提供点位ID
          this.qspace.view.turnToPanorama({
            location_id: 'location_13', // 使用默认点位ID，实际项目中应该从配置或状态中获取
            complete: () => {
              logger.info('全景视图切换完成')
            },
          })
          break
        case VIEW_MODES.DOLLHOUSE:
          // 切换到3D视图
          this.qspace.view.turnToDollhouse({
            complete: () => {
              logger.info('3D视图切换完成')
            },
          })
          break
        case VIEW_MODES.FLOORPLAN:
          // 切换到平面视图
          this.qspace.view.turnToFloorplan()
          logger.info('平面视图切换完成')
          break
      }
      logger.info('视图模式切换请求已发送', { mode })
    } catch (error) {
      logger.error('切换视图模式失败', error)
      throw error
    }
  }

  /**
   * 获取当前选中的标签ID
   * @returns {string|null} 标签ID
   */
  getSelectedTagId() {
    return this.selectedTagUuid
  }

  /**
   * 检查是否正在添加标签
   * @returns {boolean} 是否正在添加
   */
  isInAddingMode() {
    return this.isAddingTag
  }

  /**
   * 开启可见检测
   */
  enableVisibleCheck() {
    this.isVisibleCheckEnabled = true
    this.handleTagsVisibilityComputed(this.computeTagsVisibility())
  }

  /**
   * 关闭可见检测
   */
  disableVisibleCheck() {
    this.isVisibleCheckEnabled = false
    this.plugin.getAllData().forEach(tag => {
      !tag.visible && this.plugin.show(tag.uuid)
      this.plugin.hasTitle(tag.uuid) && this.plugin.showTitle(tag.uuid)
    })
  }

  /**
   * 添加事件监听器
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  off(eventName, callback) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {*} data 事件数据
   */
  emit(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          logger.error('事件回调执行失败', { eventName, error })
        }
      })
    }
  }

  /**
   * 销毁服务
   */
  destroy() {
    try {
      if (this.plugin) {
        // 移除所有事件监听器
        this.eventListeners.clear()

        // 清理插件
        this.plugin = null
      }

      this.qspace = null
      this.tagDataMap.clear()
      this.selectedTagUuid = null
      this.isAddingTag = false
      this.isInitialized = false

      logger.info('HotspotTag 服务已销毁')
    } catch (error) {
      logger.error('销毁服务时出错', error)
    }
  }
}
