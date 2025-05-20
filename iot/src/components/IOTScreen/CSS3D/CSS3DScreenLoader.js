/**
 * 基于CSS3DRenderer的IOT仪表盘实现
 */
export class CSS3DScreenLoader {
  constructor(options = {}) {
    this.css3dObjectMap = new Map()
    this.loadedScreenMap = new Map()
    this.idToUUIDMap = new Map()
    this.THREE = window.qspace.THREE

    window.qspace.core.enableCss3d()
  }

  /**
   *  加载仪表盘到场景中
   * @param {Object} params
   */
  load(params) {
    if (!params || !params.length) {
      throw new Error('params is required')
    }

    params.forEach((p) => {
      const {
        deviceId,
        container,
        width,
        height,
        position,
        quaternion,
        pixelsPerMeter = 300,
      } = p
      const css3dObject = this.createCSS3DObject({
        id: deviceId,
        container,
        pixelsPerMeter,
        width,
        height,
        position,
        quaternion,
      })

      this.css3dObjectMap.set(css3dObject.uuid, css3dObject)
      this.loadedScreenMap.set(css3dObject.uuid, {
        uuid: css3dObject.uuid,
        ...p,
      })
      this.idToUUIDMap.set(deviceId, css3dObject.uuid)
      this.addToScene(css3dObject)
    })
  }

  /**
   * 创建CSS3DObject
   */
  createCSS3DObject(options) {
    const {
      id,
      container,
      width,
      height,
      position,
      quaternion,
      pixelsPerMeter = 300,
    } = options
    // 创建CSS3DObject
    const css3dObject = new this.THREE.CSS3DObject(container)

    // 设置位置、旋转和缩放
    css3dObject.position.set(position.x, position.y, position.z)
    css3dObject.quaternion.set(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    )

    const scale = 1 / pixelsPerMeter

    css3dObject.scale.set(scale, scale, scale)

    return css3dObject
  }

  /**
   * 将仪表盘添加到场景
   */
  addToScene(css3dObject) {
    // 添加到qspace场景
    window.qspace.scene.add(css3dObject)
  }

  /**
   * 移除仪表盘
   */
  remove(uuid) {
    const css3dObject = this.css3dObjectMap.get(uuid)
    // 从场景中移除
    if (css3dObject) {
      window.qspace.scene.remove(css3dObject)
      this.css3dObjectMap.delete(uuid)
      this.loadedScreenMap.delete(uuid)
    }
  }

  getScreen(uuid) {
    return this.loadedScreenMap.get(uuid)
  }

  getScreenByDeviceId(deviceId) {
    const uuid = this.idToUUIDMap.get(deviceId)
    return this.getScreen(uuid)
  }
}
