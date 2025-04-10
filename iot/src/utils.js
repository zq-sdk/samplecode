/* 解析 Qverse 云平台图片地址 */
export const getOnlineImgSize = (url) => {
  // 提取宽度
  const widthRegex = /_(\d+)_(\d+)\.(png|jpg|gif|jpeg)/
  const widthMatch = url.match(widthRegex)
  const width = widthMatch ? widthMatch[1] : null
  const height = widthMatch ? widthMatch[2] : null
  const typeRegex = /\?type=([^&]+)/
  const typeMatch = url.match(typeRegex)
  const extensionRegex = /\.(png|jpg|gif|jpeg)/
  let extensionMatch = url.match(extensionRegex)[1]
  if (extensionMatch == 'jpeg') {
    extensionMatch = 'jpg'
  }
  const type = typeMatch ? 'sprite' : extensionMatch

  return {
    width,
    height,
    type,
  }
}

/**
 * 获取本地图片的尺寸
 * @param {string} filePath - 图片文件路径
 * @returns {Promise<Object>} 包含宽度和高度的对象
 */
export const getLocalImgSize = (filePath) => {
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
    img.onerror = (err) => {
      reject(new Error(`无法加载图片: ${filePath}`))
    }
    img.src = filePath
  })
}

export const RGBToHex = (rgbaString) => {
  const rgbaArray = rgbaString.substring(5, rgbaString.length - 1).split(', ')
  const red = parseInt(rgbaArray[0])
  const green = parseInt(rgbaArray[1])
  const blue = parseInt(rgbaArray[2])
  const alpha = parseFloat(rgbaArray[3])
  const hexString = ((1 << 24) + (red << 16) + (green << 8) + blue)
    .toString(16)
    .slice(1)
  return { color: hexString, opacity: alpha }
}

export const uuid = () => {
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
