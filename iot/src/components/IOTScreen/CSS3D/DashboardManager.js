/**
 * 基于CSS3DRenderer的IOT仪表盘实现
 * 使用ECharts渲染到DOM元素，然后通过CSS3DObject放置到3D场景中
 */
import * as echarts from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  EQUIPMENT_THRESHOLDS_CONFIG,
  equipmentService,
} from '../../../services/equipment'

// 注册必要的组件
echarts.use([
  GaugeChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
])

// 仪表盘像素与米之间的转换比例
const PIXELS_PER_METER = 300

export class DashboardManager {
  /**
   * 创建3D仪表盘
   * @param {Object} options 配置选项
   * @param {number} options.width 宽度
   * @param {number} options.height 高度
   */
  constructor(options) {
    const { width, height } = options

    this.width = width
    this.height = height
    // 渲染容器
    this.container = null
    // 仪表盘实例
    this.charts = {}
    // 仪表盘数据
    this.data = null
    // Echarts 渲染容器
    this.domElements = {}
    this.initialized = false

    this.init()
  }

  /**
   * 初始化仪表盘
   */
  init() {
    this.createDOMContainer()
    this.initECharts()

    this.initialized = true
  }

  /**
   * 创建DOM容器
   */
  createDOMContainer() {
    // 创建主容器
    this.container = document.createElement('div')
    this.container.style.width = `${this.width * PIXELS_PER_METER}px`
    this.container.style.height = `${this.height * PIXELS_PER_METER}px`

    // 创建wrapper容器
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.height = '100%'
    wrapper.style.background = 'rgba(0, 0, 0, 0.8)'
    wrapper.style.padding = '10px'
    wrapper.style.boxSizing = 'border-box'

    // 外层wrapper使用grid布局
    wrapper.style.display = 'grid'
    wrapper.style.gridTemplateRows = 'auto 45% 45%'
    wrapper.style.gridTemplateColumns = '1fr 1fr'
    wrapper.style.rowGap = '4px'
    wrapper.style.gridTemplateAreas = `
      "title title"
      "gauge1 gauge2"
      "gauge3 gauge4"
    `

    // 将wrapper添加到container
    this.container.appendChild(wrapper)

    // 添加标题
    const title = document.createElement('div')
    title.style.gridArea = 'title'
    title.style.textAlign = 'center'
    title.style.color = '#FFFFFF'
    title.style.fontSize = '14px'
    title.style.fontWeight = 'bold'
    title.textContent = 'IOT设备状态'
    wrapper.appendChild(title)

    const gaugeIds = ['voltage', 'power', 'frequency', 'ammeter']
    const gaugeNames = ['电压', '功率', '频率', '电流']
    const gaugeAreas = ['gauge1', 'gauge2', 'gauge3', 'gauge4']

    // 创建四个仪表盘容器
    gaugeIds.forEach((id, index) => {
      // 创建仪表盘外层容器
      const gaugeContainer = document.createElement('div')
      gaugeContainer.style.gridArea = gaugeAreas[index]
      gaugeContainer.style.boxSizing = 'border-box'
      gaugeContainer.style.display = 'flex'
      gaugeContainer.style.flexDirection = 'column'
      gaugeContainer.style.justifyContent = 'center'
      gaugeContainer.style.alignItems = 'center'
      gaugeContainer.style.position = 'relative'
      gaugeContainer.style.width = '100%'
      gaugeContainer.style.height = '100%'

      // 创建仪表盘内容容器
      const gaugeContent = document.createElement('div')
      gaugeContent.style.width = '100%'
      gaugeContent.style.height = '73%'
      gaugeContent.style.display = 'flex'
      gaugeContent.style.justifyContent = 'center'
      gaugeContent.style.alignItems = 'center'
      gaugeContainer.appendChild(gaugeContent)

      // 添加标签
      const label = document.createElement('div')
      label.style.color = '#CCCCCC'
      label.style.fontSize = '8px'
      label.style.fontWeight = '500'
      label.style.textAlign = 'center'
      label.style.width = '100%'
      label.textContent = gaugeNames[index]
      gaugeContainer.appendChild(label)

      wrapper.appendChild(gaugeContainer)
      this.domElements[id] = gaugeContent
    })
  }

  debugGaugeDashboard() {
    // 添加到body上的调试容器
    this.debugContainer = document.createElement('div')
    this.debugContainer.id = 'iot-gauges-3d-debug'
    this.debugContainer.style.position = 'fixed'
    this.debugContainer.style.top = '20px'
    this.debugContainer.style.right = '400px'
    this.debugContainer.style.zIndex = '9999'
    this.debugContainer.style.display = 'block' // 默认隐藏
    document.body.appendChild(this.debugContainer)
    this.debugContainer.appendChild(this.container.cloneNode(true))
  }

  /**
   * 初始化ECharts实例
   */
  initECharts() {
    // 初始化电压仪表盘
    this.charts.voltage = this.createGauge('voltage', '电压', 'V', {
      min: EQUIPMENT_THRESHOLDS_CONFIG.ratedVoltage.min,
      max: EQUIPMENT_THRESHOLDS_CONFIG.ratedVoltage.max,
      color: '#00FFE0',
    })

    // 初始化功率仪表盘
    this.charts.power = this.createGauge('power', '功率', 'kw', {
      min: 2,
      max: 6,
      color: '#4B9EFF',
      danger: 100,
    })

    // 初始化频率仪表盘
    this.charts.frequency = this.createGauge('frequency', '频率', 'Hz', {
      min: EQUIPMENT_THRESHOLDS_CONFIG.ratedFrequency.min,
      max: EQUIPMENT_THRESHOLDS_CONFIG.ratedFrequency.max,
      color: '#FFD600',
    })

    // 初始化电流仪表盘
    this.charts.ammeter = this.createGauge('ammeter', '电流', 'A', {
      min: EQUIPMENT_THRESHOLDS_CONFIG.ratedCurrent.min,
      max: EQUIPMENT_THRESHOLDS_CONFIG.ratedCurrent.max,
      color: '#00FFE0',
    })
  }

  /**
   * 创建单个仪表盘
   * @param {string} id 仪表盘ID
   * @param {string} name 仪表盘名称
   * @param {string} unit 单位
   * @param {Object} config 配置
   * @returns {Object} ECharts实例
   */
  createGauge(id, name, unit, config) {
    const { min, max, color, danger = null } = config
    const container = this.domElements[id]
    const chart = echarts.init(container)

    // 定义量程区间
    const axisLineColors = []

    if (danger !== null) {
      // 有危险区域的情况：绿色-黄色-红色
      axisLineColors.push(
        [Math.min(danger / max, 0.6), color],
        [Math.min((danger + (max - danger) * 0.5) / max, 0.8), '#FFD600'],
        [1, '#FF4F4F']
      )
    } else {
      // 标准情况：根据阈值配置的渐变色
      axisLineColors.push([0.6, color], [0.8, '#FFD600'], [1, '#FF4F4F'])
    }

    const option = {
      series: [
        {
          type: 'gauge',
          min: min,
          max: max,
          splitNumber: 5,
          pointer: {
            width: 2,
            itemStyle: {
              color: 'auto',
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 5,
              color: axisLineColors,
            },
          },
          axisTick: {
            splitNumber: 4,
            distance: -3,
            length: 3,
            lineStyle: {
              color: '#fff',
              width: 1,
            },
          },
          splitLine: {
            length: 4,
            distance: -5,
            lineStyle: {
              color: '#fff',
              width: 1,
            },
          },
          axisLabel: {
            distance: -14,
            color: '#fff',
            fontSize: 8,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 8,
            itemStyle: {
              color: 'auto',
            },
          },
          detail: {
            valueAnimation: true,
            fontSize: 10,
            color: '#fff',
            formatter: function (value) {
              return value.toFixed(0) + unit
            },
          },
          data: [
            {
              value: min,
              name: '',
            },
          ],
        },
      ],
    }

    chart.setOption(option)
    return chart
  }

  /**
   * 更新仪表盘数据
   * @param {Object} data 设备数据
   */
  updateData(data) {
    if (!data) return

    this.data = data
    this.updateGaugeData()
  }

  /**
   * 开始自动更新
   * @param {string} deviceId 设备ID
   */
  startAutoUpdate(deviceId) {
    if (!this.initialized) {
      console.warn('IOT屏幕尚未初始化，无法开始自动更新')
      return
    }

    this.deviceId = deviceId

    // 注册设备数据更新回调
    equipmentService.registerDeviceDataUpdate(deviceId, (data) =>
      this.updateData(data)
    )
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate() {
    if (this.deviceId) {
      equipmentService.unregisterDeviceDataUpdate(
        this.deviceId,
        this.updateData
      )
      this.deviceId = null
    }
  }

  /**
   * 更新仪表盘数据
   */
  updateGaugeData() {
    if (!this.data) return

    this.updateGaugeValue('voltage', this.data.ratedVoltage)
    this.updateGaugeValue('power', this.data.ratedPower)
    this.updateGaugeValue('frequency', this.data.ratedFrequency)
    this.updateGaugeValue('ammeter', this.data.ratedCurrent)
  }

  /**
   * 更新单个仪表盘值
   * @param {string} id 仪表盘ID
   * @param {number} value 值
   */
  updateGaugeValue(id, value) {
    if (this.charts[id]) {
      this.charts[id].setOption({
        series: [
          {
            data: [
              {
                value: value,
              },
            ],
          },
        ],
      })
    }
  }

  /**
   * 显示调试容器
   */
  showDebugContainer() {
    if (this.debugContainer) {
      this.debugContainer.style.display = 'block'
    }
  }

  /**
   * 隐藏调试容器
   */
  hideDebugContainer() {
    if (this.debugContainer) {
      this.debugContainer.style.display = 'none'
    }
  }

  /**
   * 销毁资源
   */
  destroy() {
    // 销毁所有图表实例
    Object.values(this.charts).forEach((chart) => {
      chart.dispose()
    })

    // 清理DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }

    if (this.debugContainer && this.debugContainer.parentNode) {
      this.debugContainer.parentNode.removeChild(this.debugContainer)
    }
  }

  getContainer() {
    return this.container
  }
}
