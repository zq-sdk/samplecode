/**
 * 日志级别枚举
 * @readonly
 * @enum {string}
 */
const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

/**
 * ANSI 控制台颜色代码（用于 Node.js 终端）
 * @readonly
 * @enum {string}
 */
const ANSI_COLORS = {
  // 重置
  RESET: '\x1b[0m',

  // 前景色
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',

  // 亮色
  BRIGHT_BLACK: '\x1b[90m',
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_YELLOW: '\x1b[93m',
  BRIGHT_BLUE: '\x1b[94m',
  BRIGHT_MAGENTA: '\x1b[95m',
  BRIGHT_CYAN: '\x1b[96m',
  BRIGHT_WHITE: '\x1b[97m',

  // 背景色
  BG_RED: '\x1b[41m',
  BG_YELLOW: '\x1b[43m',

  // 样式
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERLINE: '\x1b[4m',
}

/**
 * 浏览器控制台 CSS 样式（用于浏览器开发者工具）
 * @readonly
 * @enum {string}
 */
const BROWSER_STYLES = {
  // 基础颜色
  BLACK: 'color: #000000',
  RED: 'color: #dc3545',
  GREEN: 'color: #28a745',
  YELLOW: 'color: #ffc107',
  BLUE: 'color: #007bff',
  MAGENTA: 'color: #e83e8c',
  CYAN: 'color: #17a2b8',
  WHITE: 'color: #ffffff',

  // 亮色
  BRIGHT_BLACK: 'color: #6c757d',
  BRIGHT_RED: 'color: #ff6b6b',
  BRIGHT_GREEN: 'color: #51cf66',
  BRIGHT_YELLOW: 'color: #ffd43b',
  BRIGHT_BLUE: 'color: #339af0',
  BRIGHT_MAGENTA: 'color: #f783ac',
  BRIGHT_CYAN: 'color: #3bc9db',
  BRIGHT_WHITE: 'color: #f8f9fa',

  // 背景色
  BG_RED: 'background-color: #dc3545; color: white; padding: 2px 4px',
  BG_YELLOW: 'background-color: #ffc107; color: black; padding: 2px 4px',

  // 样式
  BOLD: 'font-weight: bold',
  DIM: 'opacity: 0.6',
  UNDERLINE: 'text-decoration: underline',

  // 重置
  RESET: '',
}

// 为了向后兼容，保留 CONSOLE_COLORS 别名
const CONSOLE_COLORS = ANSI_COLORS

/**
 * 日志级别对应的 ANSI 颜色配置（Node.js 终端）
 * @readonly
 */
const ANSI_LOG_LEVEL_COLORS = {
  [LOG_LEVEL.DEBUG]: {
    level: ANSI_COLORS.BRIGHT_BLACK,
    message: ANSI_COLORS.WHITE,
    prefix: ANSI_COLORS.DIM,
  },
  [LOG_LEVEL.INFO]: {
    level: ANSI_COLORS.BRIGHT_BLUE,
    message: ANSI_COLORS.WHITE,
    prefix: ANSI_COLORS.CYAN,
  },
  [LOG_LEVEL.WARN]: {
    level: ANSI_COLORS.BRIGHT_YELLOW,
    message: ANSI_COLORS.YELLOW,
    prefix: ANSI_COLORS.YELLOW,
  },
  [LOG_LEVEL.ERROR]: {
    level: ANSI_COLORS.BRIGHT_RED + ANSI_COLORS.BOLD,
    message: ANSI_COLORS.RED,
    prefix: ANSI_COLORS.RED,
  },
}

/**
 * 日志级别对应的浏览器样式配置
 * @readonly
 */
const BROWSER_LOG_LEVEL_STYLES = {
  [LOG_LEVEL.DEBUG]: {
    level: BROWSER_STYLES.BRIGHT_BLACK + '; ' + BROWSER_STYLES.BOLD,
    message: BROWSER_STYLES.BRIGHT_BLACK,
    prefix: BROWSER_STYLES.DIM,
  },
  [LOG_LEVEL.INFO]: {
    level: BROWSER_STYLES.BRIGHT_BLUE + '; ' + BROWSER_STYLES.BOLD,
    message: BROWSER_STYLES.BLUE,
    prefix: BROWSER_STYLES.CYAN,
  },
  [LOG_LEVEL.WARN]: {
    level: BROWSER_STYLES.BRIGHT_YELLOW + '; ' + BROWSER_STYLES.BOLD,
    message: BROWSER_STYLES.YELLOW,
    prefix: BROWSER_STYLES.YELLOW,
  },
  [LOG_LEVEL.ERROR]: {
    level: BROWSER_STYLES.BRIGHT_RED + '; ' + BROWSER_STYLES.BOLD,
    message: BROWSER_STYLES.RED,
    prefix: BROWSER_STYLES.RED,
  },
}

/**
 * 简单的日志工具
 * 支持条件日志输出，区分开发和生产环境
 */
class Logger {
  constructor() {
    // 根据环境变量确定是否为开发环境
    this.isDevelopment = import.meta.env?.DEV ?? false

    // 默认日志级别
    this.level = this.isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR

    // 日志级别优先级
    this.levelPriority = {
      [LOG_LEVEL.DEBUG]: 0,
      [LOG_LEVEL.INFO]: 1,
      [LOG_LEVEL.WARN]: 2,
      [LOG_LEVEL.ERROR]: 3,
    }

    // 检测运行环境
    this.isBrowser = typeof window !== 'undefined'
    this.isNode = !this.isBrowser

    // 是否启用颜色（检测是否支持颜色输出）
    this.enableColors = this._supportsColor()

    // 根据环境选择颜色配置
    this.colorConfig = this.isBrowser
      ? BROWSER_LOG_LEVEL_STYLES
      : ANSI_LOG_LEVEL_COLORS
  }

  /**
   * 设置日志级别
   * @param {string} level - 日志级别
   */
  setLevel(level) {
    if (Object.values(LOG_LEVEL).includes(level)) {
      this.level = level
    }
  }

  /**
   * 获取当前日志级别
   * @returns {string} 当前日志级别
   */
  getLevel() {
    return this.level
  }

  /**
   * 启用或禁用颜色输出
   * @param {boolean} enabled - 是否启用颜色
   */
  setColorEnabled(enabled) {
    this.enableColors = Boolean(enabled)
  }

  /**
   * 获取颜色启用状态
   * @returns {boolean} 是否启用颜色
   */
  isColorEnabled() {
    return this.enableColors
  }

  /**
   * 检查是否应该输出日志
   * @param {string} level - 要检查的日志级别
   * @returns {boolean} 是否应该输出
   * @private
   */
  _shouldLog(level) {
    return this.levelPriority[level] >= this.levelPriority[this.level]
  }

  /**
   * 检测是否支持颜色输出
   * @returns {boolean} 是否支持颜色
   * @private
   */
  _supportsColor() {
    // 在浏览器环境中，大部分现代浏览器的开发者工具都支持颜色
    if (this.isBrowser) {
      return true
    }

    // 在 Node.js 环境中检测
    if (typeof globalThis !== 'undefined' && globalThis.process) {
      // 检查是否有 TTY 支持
      return globalThis.process.stdout && globalThis.process.stdout.isTTY
    }

    // 默认启用颜色
    return true
  }

  /**
   * 为文本添加颜色
   * @param {string} text - 要着色的文本
   * @param {string} style - 颜色代码或CSS样式
   * @returns {string|Array<*>} 着色后的文本或浏览器样式数组
   * @private
   */
  _colorize(text, style) {
    if (!this.enableColors || !style) {
      return text
    }

    if (this.isBrowser) {
      // 浏览器环境：返回用于 console.log 的样式数组
      return [`%c${text}`, style]
    } else {
      // Node.js 环境：使用 ANSI 转义码
      return `${style}${text}${ANSI_COLORS.RESET}`
    }
  }

  /**
   * 格式化日志消息
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {*} data - 附加数据
   * @returns {Array<*>} 格式化后的参数数组
   * @private
   */
  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString()
    const colors = this.colorConfig[level] || {}

    if (this.isBrowser) {
      // 浏览器环境：使用 CSS 样式
      const timestampParts = this._colorize(`[${timestamp}]`, colors.prefix)
      const levelParts = this._colorize(
        `[${level.toUpperCase()}]`,
        colors.level
      )
      const messageParts = this._colorize(message, colors.message)

      // 合并所有样式化的部分
      const formatString = `${timestampParts[0]} ${levelParts[0]} ${messageParts[0]}`
      const styles = [timestampParts[1], levelParts[1], messageParts[1]]

      if (data !== undefined) {
        return [formatString, ...styles, data]
      }
      return [formatString, ...styles]
    } else {
      // Node.js 环境：使用 ANSI 转义码
      const coloredTimestamp = this._colorize(`[${timestamp}]`, colors.prefix)
      const coloredLevel = this._colorize(
        `[${level.toUpperCase()}]`,
        colors.level
      )
      const coloredMessage = this._colorize(message, colors.message)

      const prefix = `${coloredTimestamp} ${coloredLevel}`

      if (data !== undefined) {
        return [prefix, coloredMessage, data]
      }
      return [prefix, coloredMessage]
    }
  }

  /**
   * 输出调试日志
   * @param {string} message - 日志消息
   * @param {*} [data] - 附加数据
   */
  debug(message, data) {
    if (this._shouldLog(LOG_LEVEL.DEBUG)) {
      console.log(...this._formatMessage(LOG_LEVEL.DEBUG, message, data))
    }
  }

  /**
   * 输出信息日志
   * @param {string} message - 日志消息
   * @param {*} [data] - 附加数据
   */
  info(message, data) {
    if (this._shouldLog(LOG_LEVEL.INFO)) {
      console.info(...this._formatMessage(LOG_LEVEL.INFO, message, data))
    }
  }

  /**
   * 输出警告日志
   * @param {string} message - 日志消息
   * @param {*} [data] - 附加数据
   */
  warn(message, data) {
    if (this._shouldLog(LOG_LEVEL.WARN)) {
      console.warn(...this._formatMessage(LOG_LEVEL.WARN, message, data))
    }
  }

  /**
   * 输出错误日志
   * @param {string} message - 日志消息
   * @param {*} [data] - 附加数据
   */
  error(message, data) {
    if (this._shouldLog(LOG_LEVEL.ERROR)) {
      console.error(...this._formatMessage(LOG_LEVEL.ERROR, message, data))
    }
  }

  /**
   * 输出分组日志
   * @param {string} groupName - 分组名称
   * @param {Function} callback - 回调函数
   */
  group(groupName, callback) {
    if (this.isDevelopment) {
      console.group(groupName)
      try {
        callback()
      } finally {
        console.groupEnd()
      }
    } else {
      callback()
    }
  }

  /**
   * 输出表格日志（仅开发环境）
   * @param {Array<*>|Object} data - 表格数据
   * @param {Array<string>} [columns] - 要显示的列
   */
  table(data, columns) {
    if (this.isDevelopment && this._shouldLog(LOG_LEVEL.DEBUG)) {
      console.table(data, columns)
    }
  }

  /**
   * 开始计时
   * @param {string} label - 计时标签
   */
  time(label) {
    if (this.isDevelopment && this._shouldLog(LOG_LEVEL.DEBUG)) {
      console.time(label)
    }
  }

  /**
   * 结束计时
   * @param {string} label - 计时标签
   */
  timeEnd(label) {
    if (this.isDevelopment && this._shouldLog(LOG_LEVEL.DEBUG)) {
      console.timeEnd(label)
    }
  }
}

// 导出单例实例
const logger = new Logger()

export default logger
export { Logger, LOG_LEVEL, CONSOLE_COLORS, ANSI_COLORS, BROWSER_STYLES }
