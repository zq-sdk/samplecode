import { HotspotTagService } from './services/HotspotTagService.js'
import { logger } from './utils/logger.js'
import { BOOT_DATA, VIEW_MODES } from './constants/index.js'

/**
 * 主应用类
 */
class HotspotTagExample {
  constructor(qspace) {
    this.qspace = qspace
    this.hotspotService = null
    this.isInitialized = false
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      // 初始化日志系统
      this.initLogger()

      // 初始化 HotspotTag 服务
      await this.initHotspotService()

      // 初始化 qspace
      await this.initQSpace()

      // 初始化 UI 事件
      this.initUIEvents()

      // 注册服务事件监听
      this.registerServiceEvents()

      this.isInitialized = true
      logger.success('应用初始化完成')
    } catch (error) {
      logger.error('应用初始化失败', error)
      throw error
    }
  }

  /**
   * 初始化日志系统
   */
  initLogger() {
    const logContainer = document.getElementById('event-log')
    logger.init(logContainer)
    logger.info('日志系统初始化完成')
  }

  /**
   * 初始化 qspace
   */
  async initQSpace() {
    this.qspace.core.initData(BOOT_DATA)

    return new Promise(resolve => {
      this.qspace.core.beginRender({
        onLoaded: () => {
          console.log('qspace核心加载完成')
          // 注册插件事件监听
          this.hotspotService.registerEventListeners()
          resolve()
        },
      })
    })
  }

  /**
   * 初始化 HotspotTag 服务
   */
  async initHotspotService() {
    this.hotspotService = new HotspotTagService()

    // 插件静态资源配置
    const config = {
      res: {
        head_bg: '//material.3dnest.cn/e100_sdk/tag-head-bg.png',
        base_plate: '//material.3dnest.cn/e100_sdk/tag.base.plate.png',
        rotate_control_torus: '//material.3dnest.cn/e100_sdk/torus_2x.png',
        rotate_control_arc_surface:
          'https://material.3dnest.cn/e100_sdk/arc_surface_2x.png',
      },
    }

    await this.hotspotService.init(this.qspace, config)
  }

  /**
   * 初始化 UI 事件监听
   */
  initUIEvents() {
    /* 视图模式切换 */
    document.getElementById('btn-panorama').addEventListener('click', () => {
      this.switchViewMode(VIEW_MODES.PANORAMA)
    })

    document.getElementById('btn-dollhouse').addEventListener('click', () => {
      this.switchViewMode(VIEW_MODES.DOLLHOUSE)
    })

    document.getElementById('btn-floorplan').addEventListener('click', () => {
      this.switchViewMode(VIEW_MODES.FLOORPLAN)
    })

    /* 标签管理 */
    // 加载标签
    document.getElementById('btn-load-tags').addEventListener('click', () => {
      this.loadTags()
    })

    // 添加标签
    document.getElementById('btn-add-tag').addEventListener('click', () => {
      this.addTag()
    })

    // 取消添加标签
    document.getElementById('btn-cancel-add').addEventListener('click', () => {
      this.cancelAddTag()
    })

    // 删除标签
    document.getElementById('btn-delete-tag').addEventListener('click', () => {
      this.deleteSelectedTag()
    })

    // 显示所有标签
    document.getElementById('btn-show-all').addEventListener('click', () => {
      this.showAllTags()
    })

    // 隐藏所有标签
    document.getElementById('btn-hide-all').addEventListener('click', () => {
      this.hideAllTags()
    })

    // 删除所有标签
    document.getElementById('btn-remove-all').addEventListener('click', () => {
      this.removeAllTags()
    })

    /* 可见范围管理 */
    // 滑动条事件监听
    const rangeSlider = document.getElementById('visible-range-slider')
    const rangeValue = document.getElementById('range-value')

    rangeSlider.addEventListener('input', e => {
      const value = e.target.value
      rangeValue.textContent = value
      this.setVisibleRange(parseInt(value))
    })

    document
      .getElementById('btn-cancel-visible-range')
      .addEventListener('click', () => {
        this.cancelVisibleRange()
      })

    /* 可见性检测 */
    document
      .getElementById('btn-enable-visible-check')
      .addEventListener('click', () => {
        this.hotspotService.enableVisibleCheck()
        this.checkTagsVisibility()
      })

    document
      .getElementById('btn-disable-visible-check')
      .addEventListener('click', () => {
        this.hotspotService.disableVisibleCheck()
      })
  }

  /**
   * 注册服务事件监听
   */
  registerServiceEvents() {
    // 标签头点击事件
    this.hotspotService.on('tagHeadClick', tag => {
      logger.info('UI层收到标签点击事件', { tagUuid: tag.uuid })
    })

    // 标签加载完成事件
    this.hotspotService.on('tagsLoadComplete', tags => {
      logger.success('UI层收到标签加载完成事件', { count: tags.length })
    })

    // 新标签添加完成事件
    this.hotspotService.on('tagAddComplete', tag => {
      logger.success('UI层收到新标签添加完成事件', { tagUuid: tag.uuid })
    })

    // 视图模式变化事件
    this.hotspotService.on('viewModeChange', mode => {
      logger.info('UI层收到视图模式变化事件', { mode })
    })

    // 标签可见性计算完成事件
    this.hotspotService.on('tagsVisibilityComputed', results => {
      logger.info('UI层收到标签可见性计算完成事件', {
        totalTags: results.size,
        visibleCount: Array.from(results.values()).filter(r => r.isVisible)
          .length,
      })
    })
  }

  /**
   * 切换视图模式
   * @param {string} mode 视图模式
   */
  switchViewMode(mode) {
    try {
      this.hotspotService.switchViewMode(mode)
    } catch (error) {
      logger.error('切换视图模式失败', error)
    }
  }

  /**
   * 加载标签数据
   */
  async loadTags() {
    try {
      // 从 mock 数据加载标签
      const response = await fetch('./mock/tags.json')
      const tagData = await response.json()

      await this.hotspotService.loadTags(tagData)
      logger.success('标签数据加载成功', { count: tagData.length })
    } catch (error) {
      logger.error('加载标签数据失败', error)
    }
  }

  /**
   * 添加新标签
   */
  addTag() {
    try {
      if (this.hotspotService.isInAddingMode()) {
        logger.warning('已经在添加标签模式中')
        return
      }

      // 创建标签模板
      const tagTemplate = {
        type: 'png',
        src: '//template.3dnest.cn/ncz/png/tag1.png',
        width: 200,
        height: 200,
        location_line_len: 0.3,
        face_scale: 1,
        position: { x: 500, y: 500 },
      }

      this.hotspotService.startAddingTag(tagTemplate)

      // 更新按钮状态
      document.getElementById('btn-add-tag').disabled = true
      document.getElementById('btn-cancel-add').disabled = false

      this.hotspotService.on('tagAddComplete', () => {
        document.getElementById('btn-add-tag').disabled = false
        document.getElementById('btn-cancel-add').disabled = true
      })
    } catch (error) {
      logger.error('开始添加标签失败', error)
    }
  }

  /**
   * 取消添加标签
   */
  cancelAddTag() {
    try {
      this.hotspotService.cancelAddingTag()

      // 更新按钮状态
      document.getElementById('btn-add-tag').disabled = false
      document.getElementById('btn-cancel-add').disabled = true
    } catch (error) {
      logger.error('取消添加标签失败', error)
    }
  }

  /**
   * 删除选中的标签
   */
  deleteSelectedTag() {
    try {
      const selectedTagId = this.hotspotService.getSelectedTagId()
      if (!selectedTagId) {
        logger.warning('没有选中的标签')
        return
      }

      this.hotspotService.deleteTag(selectedTagId)
    } catch (error) {
      logger.error('删除标签失败', error)
    }
  }

  /**
   * 显示所有标签
   */
  showAllTags() {
    try {
      this.hotspotService.showAllTags()
    } catch (error) {
      logger.error('显示所有标签失败', error)
    }
  }

  /**
   * 隐藏所有标签
   */
  hideAllTags() {
    try {
      this.hotspotService.hideAllTags()
    } catch (error) {
      logger.error('隐藏所有标签失败', error)
    }
  }

  /**
   * 删除所有标签
   */
  removeAllTags() {
    try {
      if (window.confirm('确定要删除所有标签吗？此操作不可撤销。')) {
        this.hotspotService.removeAllTags()
      }
    } catch (error) {
      logger.error('删除所有标签失败', error)
    }
  }

  /**
   * 设置可见范围
   * @param {number} range 可见范围值（米）
   */
  setVisibleRange(range) {
    try {
      this.hotspotService.setTagVisibleRange(range)
      logger.info(`可见范围已设置为 ${range} 米`)
    } catch (error) {
      logger.error('设置可见范围失败', error)
    }
  }

  /**
   * 取消可见范围
   */
  cancelVisibleRange() {
    try {
      this.hotspotService.cancelTagVisibleRange()
    } catch (error) {
      logger.error('取消可见范围失败', error)
    }
  }

  /**
   * 检查标签可见性
   */
  checkTagsVisibility() {
    try {
      const results = this.hotspotService.computeTagsVisibility()

      // 显示详细的可见性报告
      const report = Array.from(results.entries()).map(([uuid, result]) => {
        return {
          uuid,
          isVisible: result.isVisible,
          hiddenReasons: result.hiddenReasons,
        }
      })

      logger.info('标签可见性检查报告', report)

      // 在控制台输出详细信息
      console.table(report)
    } catch (error) {
      logger.error('检查标签可见性失败', error)
    }
  }

  /**
   * 销毁应用
   */
  destroy() {
    try {
      if (this.hotspotService) {
        this.hotspotService.destroy()
      }

      logger.info('应用已销毁')
    } catch (error) {
      logger.error('销毁应用时出错', error)
    }
  }
}

// 应用入口
document.addEventListener('DOMContentLoaded', async () => {
  const app = new HotspotTagExample(window.qspace)

  try {
    await app.init()
  } catch (error) {
    console.error('应用启动失败:', error)
    window.alert('应用启动失败，请检查控制台获取详细信息')
  }

  // 页面卸载时清理资源
  window.addEventListener('beforeunload', () => {
    app.destroy()
  })
})
