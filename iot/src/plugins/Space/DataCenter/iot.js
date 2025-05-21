/**
 * IoT 数据处理模块
 * 负责处理 IoT 设备数据的解析、存储和查询
 * 该模块保持与原有 iot.js 相同的导出接口，但内部实现使用模块化架构
 */

import iotDataManager from '@/utils/iotDataManager'
import IotDataService from '@/services/iotDataService'

// 导出与原有 iot.js 相同的接口，保持兼容性
export const getTagIotType = tagId => iotDataManager.getTagIotType(tagId)

export const setCurSceneIotData = (tagList, put2dList, splitSeparator) => {
  IotDataService.initSceneIotData(tagList, put2dList, splitSeparator)
}

export const getCurSceneIotData = () => iotDataManager.getSceneIotData()

export const getDeviceListByDisplayType = type =>
  iotDataManager.getDeviceListByDisplayType(type)

export const setTagPluginDataList = (tagId, data) =>
  iotDataManager.setTagPluginDataList(tagId, data)

export const getIotIdMap = () => iotDataManager.getIotIdMap()

export const getIotTagIdMap = () => iotDataManager.getIotTagIdMap()

export const getTagPluginData = tagId => iotDataManager.getTagPluginData(tagId)

export const getTypedTagData = () => iotDataManager.getTypedTagData()

export const getTagDeviceListByIotType = type =>
  iotDataManager.getTagDeviceListByIotType(type)

export const getFormattedTagList = () => iotDataManager.getFormattedTagList()

export const getNormalTagList = () => iotDataManager.getNormalTagList()

export const getIotTagList = () => iotDataManager.getIotTagList()
