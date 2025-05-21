import {
  EQUIPMENT_THRESHOLDS_CONFIG,
  equipmentService,
} from '@/services/equipment'

/**
 * Canvas 管理器类
 * 负责创建和管理用于显示 IOT 设备状态的 Canvas
 */
export class CanvasManager {
  constructor(options) {
    this.width = options.width * 500
    this.height = options.height * 500
    this.canvas = null
    this.ctx = null
    // 设备运行数据
    this.data = null
    // 显示的图标
    this.icons = {}
    this.initialized = false

    this.init()
  }

  /**
   * 初始化 Canvas
   */
  init() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) {
      throw new Error('无法获取 Canvas 2D 上下文')
    }

    this.initialized = true

    // 加载图标
    this.loadIcons()

    // 启用调试模式
    // this.debugCanvas()
  }

  /**
   * 调试模式
   */
  debugCanvas() {
    // 设置 Canvas 样式
    this.canvas.style.border = '2px solid red'

    // 添加调试信息
    console.log('Canvas 调试模式已启用')
    console.log(`Canvas 尺寸: ${this.width} x ${this.height}`)

    // 绘制调试网格
    this.ctx.strokeStyle = '#666'
    this.ctx.lineWidth = 1

    // 绘制垂直网格线
    for (let x = 0; x < this.width; x += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.height)
      this.ctx.stroke()
    }

    // 绘制水平网格线
    for (let y = 0; y < this.height; y += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    }

    // 创建容器并添加到body
    this.div = document.createElement('div')
    this.div.id = 'iot-screen-container'
    // 设置调试样式
    this.div.style.position = 'fixed'
    this.div.style.top = '20px'
    this.div.style.right = '20px'
    this.div.style.zIndex = '9999'
    window.document.body.appendChild(this.div)
    this.div.appendChild(this.canvas)
  }

  /**
   * 加载图标
   */
  loadIcons() {
    const iconConfigs = {
      voltage: { color: '#FF8A00', path: '/icons/voltage.svg' },
      current: { color: '#00FFE0', path: '/icons/current.svg' },
      power: { color: '#4B9EFF', path: '/icons/power.svg' },
      frequency: { color: '#FFD600', path: '/icons/frequency.svg' },
      speed: { color: '#FFFFFF', path: '/icons/speed.svg' },
      ratio: { color: '#4CAF50', path: '/icons/ratio.svg' },
    }

    Object.entries(iconConfigs).forEach(([key, config]) => {
      fetch(config.path)
        .then(response => response.text())
        .then(svgText => {
          // 创建一个临时的 div 来解析 SVG
          const div = document.createElement('div')
          div.innerHTML = svgText

          // 获取 SVG 元素
          const svg = div.querySelector('svg')
          if (svg) {
            // 修改 SVG 的 fill 和 stroke 属性
            const paths = svg.querySelectorAll('path')
            paths.forEach(path => {
              if (path.getAttribute('fill') === 'currentColor') {
                path.setAttribute('fill', config.color)
              }
              if (path.getAttribute('stroke') === 'currentColor') {
                path.setAttribute('stroke', config.color)
              }
            })

            // 转换为 Base64 图片
            const svgBlob = new Blob([div.innerHTML], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(svgBlob)
            const img = new Image()
            img.src = url
            img.onload = () => {
              this.icons[key] = {
                image: img,
                color: config.color,
              }
              URL.revokeObjectURL(url)
              this.render()
            }
          }
        })
    })
  }

  /**
   * 更新设备数据
   * @param {Object} data 设备数据
   */
  updateData(data) {
    this.data = data
    this.render()
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
    equipmentService.registerDeviceDataUpdate(deviceId, data =>
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
   * 渲染 Canvas 内容
   */
  render() {
    if (!this.ctx || !this.data) {
      return
    }

    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)

    // 绘制背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.width, this.height)

    // 绘制标题
    this.renderTitle()

    // 绘制设备数据
    this.renderDeviceData()
  }

  /**
   * 渲染标题
   */
  renderTitle() {
    this.ctx.font = 'bold 36px Arial'
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('IOT 设备状态', this.width / 2, 65)
    this.ctx.textAlign = 'left' // 重置文本对齐方式
  }

  /**
   * 渲染设备数据
   */
  renderDeviceData() {
    if (!this.data) {
      return
    }

    const startX = 30
    const startY = 120 // 调整起始Y坐标，为标题留出空间
    const rowHeight = 70
    const colWidth = 320

    // 第一行
    this.renderDataItem(
      startX,
      startY,
      'voltage',
      '额定电压',
      `${this.data.ratedVoltage}${EQUIPMENT_THRESHOLDS_CONFIG.ratedVoltage.unit}`
    )
    this.renderDataItem(
      startX + colWidth,
      startY,
      'current',
      '额定电流',
      `${this.data.ratedCurrent}${EQUIPMENT_THRESHOLDS_CONFIG.ratedCurrent.unit}`
    )

    // 第二行
    this.renderDataItem(
      startX,
      startY + rowHeight,
      'power',
      '额定功率',
      `${this.data.ratedPower}${EQUIPMENT_THRESHOLDS_CONFIG.ratedPower.unit}`
    )
    this.renderDataItem(
      startX + colWidth,
      startY + rowHeight,
      'frequency',
      '额定频率',
      `${this.data.ratedFrequency}${EQUIPMENT_THRESHOLDS_CONFIG.ratedFrequency.unit}`,
      '#FF0000'
    )

    // 第三行
    this.renderDataItem(
      startX,
      startY + rowHeight * 2,
      'speed',
      '额定转速',
      `${this.data.ratedSpeed}${EQUIPMENT_THRESHOLDS_CONFIG.ratedSpeed.unit}`
    )
    this.renderDataItem(
      startX,
      startY + rowHeight * 3,
      'ratio',
      '机械转动比',
      `${this.data.mechanicalRatio}${EQUIPMENT_THRESHOLDS_CONFIG.mechanicalRatio.unit}`
    )
  }

  /**
   * 渲染数据项
   * @param {number} x X坐标
   * @param {number} y Y坐标
   * @param {string} iconKey 图标键名
   * @param {string} label 标签
   * @param {string} value 值
   * @param {string} valueColor 值的颜色（可选）
   */
  renderDataItem(x, y, iconKey, label, value, valueColor) {
    const iconSize = 30
    const icon = this.icons[iconKey]

    if (icon && icon.image) {
      // 绘制图标
      this.ctx.drawImage(icon.image, x, y - 24, iconSize, iconSize)
    }

    // 绘制标签
    this.ctx.font = '24px Arial'
    this.ctx.fillStyle = '#FFFFFF'

    const labelText = label + ':'
    this.ctx.fillText(labelText, x + iconSize + 10, y)

    // 计算标签文本宽度
    const labelWidth = this.ctx.measureText(labelText).width

    // 绘制值（根据标签宽度动态确定起点）
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.fillText(value, x + iconSize + labelWidth + 20, y)
  }

  /**
   * 获取 Canvas 元素
   * @returns {HTMLCanvasElement}
   */
  getContainer() {
    return this.canvas
  }
}
