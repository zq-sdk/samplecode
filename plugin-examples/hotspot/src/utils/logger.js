import { LOG_LEVELS } from '../constants/index.js'

/**
 * 日志管理器
 */
class Logger {
  constructor() {
    this.logContainer = null
    this.maxLogs = 100 // 最大日志条数
  }

  /**
   * 初始化日志容器
   * @param {HTMLElement} container 日志容器元素
   */
  init(container) {
    this.logContainer = container
  }

  /**
   * 添加日志条目
   * @param {string} message 日志消息
   * @param {string} level 日志级别
   * @param {Object} data 附加数据
   */
  log(message, level = LOG_LEVELS.INFO, data = null) {
    const timestamp = new Date().toLocaleTimeString()

    // 控制台输出
    console.log(`[${timestamp}] ${message}`, data || '')

    // UI 显示
    if (this.logContainer) {
      this.addLogEntry(timestamp, message, level, data)
    }
  }

  /**
   * 添加日志条目到 UI
   * @param {string} timestamp 时间戳
   * @param {string} message 消息
   * @param {string} level 级别
   * @param {Object} data 数据
   */
  addLogEntry(timestamp, message, level, data) {
    const logEntry = document.createElement('div')
    logEntry.className = `log-entry ${level}`

    let content = `<span class="log-timestamp">${timestamp}</span>${message}`
    if (data) {
      content += `<br><small>${JSON.stringify(data, null, 2)}</small>`
    }

    logEntry.innerHTML = content

    // 添加到容器顶部
    this.logContainer.insertBefore(logEntry, this.logContainer.firstChild)

    // 限制日志条数
    while (this.logContainer.children.length > this.maxLogs) {
      this.logContainer.removeChild(this.logContainer.lastChild)
    }
  }

  /**
   * 信息日志
   */
  info(message, data) {
    this.log(message, LOG_LEVELS.INFO, data)
  }

  /**
   * 成功日志
   */
  success(message, data) {
    this.log(message, LOG_LEVELS.SUCCESS, data)
  }

  /**
   * 警告日志
   */
  warning(message, data) {
    this.log(message, LOG_LEVELS.WARNING, data)
  }

  /**
   * 错误日志
   */
  error(message, data) {
    this.log(message, LOG_LEVELS.ERROR, data)
  }

  /**
   * 清空日志
   */
  clear() {
    if (this.logContainer) {
      this.logContainer.innerHTML = ''
    }
  }
}

export const logger = new Logger()
