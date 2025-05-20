import { CAMERA_VIDEO_MODE_ENUM, DEVICE_DATA_DISPLAY_TYPE_ENUM } from '@/constants'

/**
 * 当前场景内容数据，用于存储当前场景的热点标签原始数据、与标签绑定的IOT设备ID、与 2D 物品绑定的设备 ID。
 */
const curSceneIotData = {
  // 原始的标签数据
  tagList: [],
  // 传给插件的热点标签数据
  tagPluginDataList: {},
  // 根据keyword分类的热点标签数据
  typedTagList: {
    tag: {},
    put2d: {},
  },
  // IOT设备id与热点标签id的映射
  iotIdMap: {},
  // 热点标签id与IOT设备id的映射
  iotTagIdMap: {},
}

// 当前场景的IOT设备类型缓存
const iotTagTypeCache = []
// 当前场景的IOT设备类型数据缓存（与热点绑定的）
let iotTypedTagDataCache = null

const setIotTagTypeCache = (type) => {
  iotTagTypeCache.push(type)
}

const setIotTypedTagDataCache = (data) => {
  iotTypedTagDataCache = data
}

const getCurSceneIotData = () => {
  return curSceneIotData
}

const setCurSceneIotData = (tagList, put2dList, splitSeparator) => {
  curSceneIotData.tagList = tagList
  curSceneIotData.typedTagList = parseIOTDataFromWork(
    tagList,
    put2dList,
    splitSeparator
  )
}

const setTagPluginDataList = (tagId, data) => {
  curSceneIotData.tagPluginDataList[tagId] = data
}

const getTagPluginData = (tagId) => curSceneIotData.tagPluginDataList[tagId]

/**
 * 解析当前场景下绑定了 IOT 设备ID 的热点和 2D 物品摆放数据
 * @param {Object} tagList 场景下的标签原始数据
 * @param {Object} put2dList 场景下的 2D 物品原始数据
 * @param {string} splitSeparator keyword 解析分隔符
 * @returns
 */
const parseIOTDataFromWork = (tagList, put2dList, splitSeparator = '_') => {
  let res = {
    tag: {},
    put2d: {},
  }

  tagList.forEach((tag) => {
    const type = tag.keyword.split(splitSeparator)[0].toLowerCase() || 'others'
    const data = {
      id: tag.id,
      type,
      deviceId: '',
      name: tag.content.title_info.text,
    }

    if (type !== 'others') {
      setIotTagTypeCache(type)
    }

    if (data.type === 'camera') {
      const [_, deviceId, mode = CAMERA_VIDEO_MODE_ENUM.VOD] =
        tag.keyword.split(splitSeparator)
      data.mode = parseInt(mode)
      data.deviceId = deviceId
    }

    if (data.type === 'iot') {
      data.deviceId = tag.keyword.split(splitSeparator)[1]
    }

    setIotIdMap(tag.id, data.deviceId)

    res.tag[tag.id] = data
  })

  put2dList.forEach((p) => {
    const [type, deviceId, mode = DEVICE_DATA_DISPLAY_TYPE_ENUM.CANVAS] = p.title.split(splitSeparator)
    res.put2d[p.id] = {
      id: p.id,
      deviceId,
      type: type.toLowerCase(),
      mode: parseInt(mode),
      locationId: p.location_id ?? undefined,
      position: p.position,
      position3D: p.camera_position_3d,
      quaternion: p.quaternion,
      quaternion3d: p.camera_quaternion_3d,
      scale: p.scale,
      width: p.width / 1000,
      height: p.height / 1000,
    }
  })

  console.log(`parseIOTDataFromWork: `, res)

  return res
}

/**
 * 设置标签 ID与设备 ID的双向映射
 * @param {string} tagId 标签ID
 * @param {string} deviceId 设备ID
 */
const setIotIdMap = (tagId, deviceId) => {
  curSceneIotData.iotIdMap[deviceId] = tagId
  curSceneIotData.iotTagIdMap[tagId] = deviceId
}

const getTagIotType = (tagId) => {
  return curSceneIotData.typedTagList.tag[tagId].type
}

/**
 *
 * @param {string} type IOT 设备数据的呈现方式（'tag': 标签；'put2d': 2D 物品）
 * @returns
 */
const getDeviceListByDisplayType = (type) => {
  let res
  switch (type) {
    case 'tag': {
      res = Object.values(curSceneIotData.typedTagList.tag)
      break
    }

    case 'put2d': {
      res = Object.values(curSceneIotData.typedTagList.put2d)
      break
    }

    default: {
      console.error(`unknown display type: ${type}`)
    }
  }

  return res
}

/**
 *
 * @param {string} type IOT 类型（iot - 设备 | camera - 摄像头）
 * @returns
 */
const getTagDeviceListByIotType = (type) => {
  if (!iotTagTypeCache.includes(type)) return []

  return getDeviceListByDisplayType('tag')?.filter((d) => d.type === type)
}

/**
 *
 * @returns 热点 ID 映射到设备 ID
 */
const getIotTagIdMap = () => curSceneIotData.iotTagIdMap

/**
 *
 * @returns 设备 ID 映射到热点 ID
 */
const getIotIdMap = () => curSceneIotData.iotIdMap

/**
 *
 * @returns 绑定了IOT 类型的热点数据
 */
const getTypedTagData = () => {
  const res = iotTagTypeCache.reduce((acc, cur) => {
    acc[cur] = []
    return acc
  }, {})

  Object.values(curSceneIotData.typedTagList.tag).forEach((t) => {
    res[t.type].push(t)
  })

  setIotTypedTagDataCache(res)

  console.log(`getTypedTagData: `, res)

  return !iotTypedTagDataCache ? iotTypedTagDataCache : res
}

export {
  getTagIotType,
  setCurSceneIotData,
  getCurSceneIotData,
  getDeviceListByDisplayType,
  setTagPluginDataList,
  getIotIdMap,
  getIotTagIdMap,
  getTagPluginData,
  getTypedTagData,
  getTagDeviceListByIotType,
}
