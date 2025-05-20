import { offlineServer } from '../../Service/index.js'
import {
  getCurSceneIotData,
  setCurSceneIotData,
  setTagPluginDataList,
} from './iot.js'
import { replacer } from './replacer.js'
const { Adapter } = window

// 存储获取过的源数据
const cache = {
  initial: false,
  workId: '',
  setting: null,
  rawSetiingsList: [],
}

// 获取指定场景数据
const getSceneData = (sceneId) => {
  return cache.setting.scenes.list.find((scene) => scene.scene_id === sceneId)
}

// 获取模型数据
const getRawSettings = async (sceneId) => {
  if (!cache.initial) return null

  const scene = getSceneData(sceneId)
  let rawSettings = cache.rawSetiingsList.find((setting) => {
    const { modelId, modelVersion } = setting

    return modelId === scene.id && modelVersion === scene.version
  })?.data

  if (!rawSettings && scene.type !== 'purepano') {
    rawSettings = replacer.execute(
      await offlineServer.getRawSettings(scene.id, scene.version),
      { origin: offlineServer.baseUrl }
    )

    cache.rawSetiingsList.push({
      modelId: scene.id,
      modelVersion: scene.version,
      data: rawSettings,
    })
  }

  return rawSettings
}

const dataCenter = {
  // 初始化，根据 作品id 获取作品信息
  async init(workId) {
    if (cache.initial) return

    offlineServer.workId = cache.workId = workId

    cache.setting = replacer.execute(await offlineServer.getSetting(workId), {
      origin: offlineServer.baseUrl,
    })
    cache.initial = true

    // 设置当前场景下 IOT 相关的数据
    setCurSceneIotData(
      this.getHotspotTagSourceList(this.getEntrySenceId()),
      this.getPut2dContentSourceList(this.getEntrySenceId())
    )

    console.log(`curSceneContentData`, getCurSceneIotData())
  },

  // 获取首入场景 id
  getEntrySenceId() {
    if (!cache.initial) return null

    return cache.setting.scenes.entry_scene_id.parent_scene_id
  },

  // 获取已存在过的场景数据
  getExistSceneData(sceneId) {
    return getSceneData(sceneId)
  },

  // 获取场景列表，用于绘制场景切换栏
  getSceneBarList() {
    if (!cache.initial) return null

    const setting = cache.setting

    return Adapter.sceneGroup.adapt('offline-1.0.0', 'sceneGroup-1.3.0', {
      scenes: setting.scenes,
    })
  },

  // 获取模型加载数据
  async getCoreData(sceneId) {
    if (!cache.initial) return null

    const scene = getSceneData(sceneId)
    const rawSettings = await getRawSettings(sceneId)

    const rawCoreData = {
      work: cache.setting,
      scene,
      rawSettings,
      // 若有户型图，该角度可从户型图数据中获取
      floorplanRotateAngle: 0,
      modelBaseUrl: `${offlineServer.baseUrl}/model/`,
    }

    return Adapter.core.adapt('offline-1.0.0', 'initData-1.3.0', rawCoreData)
  },

  // 获取楼层列表
  // 若需要获取户型图编辑器更改过的楼层名称等信息，楼层数据需要从户型图数据中提取
  // 获取户型图数据 offlineServer.getFloorplanData(cache.workId, sceneId)
  async getFloorList(sceneId) {
    if (!cache.initial) return null

    const rawSettings = await getRawSettings(sceneId)

    return rawSettings?.building?.floors || []
  },

  // 获取热点标签数据
  getHotspotTagData(sceneId) {
    if (!cache.initial) return null

    const scene = getSceneData(sceneId)

    const adaptedTagData = Adapter.hotspotTag.adapt(
      'offline-1.0.0',
      'HotspotTagLoadOptions-1.3.0',
      {
        scene,
        hotspotTagList: scene.tags,
      }
    )

    adaptedTagData.forEach((t) => {
      setTagPluginDataList(t.id, t)
    })

    return adaptedTagData
  },

  // 获取热点标签源数据
  getHotspotTagSourceList(sceneId) {
    if (!cache.initial) return null

    return getSceneData(sceneId)?.tags.list || null
  },

  // 获取 2D 物品摆放的源数据
  getPut2dContentSourceList(sceneId) {
    if (!cache.initial) return null

    return getSceneData(sceneId)?.content_placement['2D'].list || null
  },

  getSettingData() {
    return cache.setting
  },
}

export default dataCenter
