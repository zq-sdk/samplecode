/**
 * 解析 Qverse 云平台图片地址，提取图片尺寸和类型信息
 * @param {string} url - 图片 URL 地址
 * @returns {{width: string|null, height: string|null, type: string}} 包含宽度、高度和类型的对象
 */
export const getOnlineImgSize = url => {
  // 提取宽度和高度的正则表达式
  const widthRegex = /_(\d+)_(\d+)\.(png|jpg|gif|jpeg)/
  const widthMatch = url.match(widthRegex)
  const width = widthMatch ? widthMatch[1] : null
  const height = widthMatch ? widthMatch[2] : null

  // 检查是否为 sprite 类型
  const typeRegex = /\?type=([^&]+)/
  const typeMatch = url.match(typeRegex)

  // 提取文件扩展名
  const extensionRegex = /\.(png|jpg|gif|jpeg)/
  const extensionMatch = url.match(extensionRegex)
  let fileExtension = 'png' // 默认值

  if (extensionMatch && extensionMatch[1]) {
    fileExtension = extensionMatch[1] === 'jpeg' ? 'jpg' : extensionMatch[1]
  }

  const type = typeMatch ? 'sprite' : fileExtension

  return {
    width,
    height,
    type,
  }
}

/**
 * 获取本地图片的尺寸信息
 * @param {string} filePath - 图片文件路径
 * @returns {Promise<{width: number, height: number, type: string}>} 包含宽度、高度和类型的对象
 */
export const getLocalImgSize = filePath => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const filePathStr = String(filePath)
      let fileExt = ''

      if (filePathStr.includes('.')) {
        const parts = filePathStr.split('.')
        if (parts.length > 0) {
          fileExt = parts[parts.length - 1].toLowerCase()
        }
      }

      resolve({
        width: img.width,
        height: img.height,
        type: fileExt,
      })
    }

    img.onerror = _err => {
      reject(new Error(`无法加载图片: ${filePath}`))
    }

    img.src = filePath
  })
}

/**
 * 将 RGBA 字符串转换为十六进制颜色值和透明度
 * @param {string} rgbaString - RGBA 颜色字符串，格式如 "rgba(255, 255, 255, 1)"
 * @returns {{color: string, opacity: number}} 包含十六进制颜色值和透明度的对象
 */
export const rgbaToHex = rgbaString => {
  const rgbaArray = rgbaString.substring(5, rgbaString.length - 1).split(', ')
  const red = parseInt(rgbaArray[0])
  const green = parseInt(rgbaArray[1])
  const blue = parseInt(rgbaArray[2])
  const alpha = parseFloat(rgbaArray[3])

  const hexString = ((1 << 24) + (red << 16) + (green << 8) + blue)
    .toString(16)
    .slice(1)

  return {
    color: hexString,
    opacity: alpha,
  }
}

/**
 * 生成 UUID（通用唯一标识符）
 * @returns {string} 格式为 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 的 UUID 字符串
 */
export const generateUuid = () => {
  /**
   * 生成 4 位十六进制字符串
   * @returns {string} 4 位十六进制字符串
   * @private
   */
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  )
}
