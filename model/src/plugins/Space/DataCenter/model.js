import { modelServer } from '../../Service/index.js';
const { Adapter } = window;

const urlParams = new URLSearchParams(window.location.search);
const MODEL_ID = urlParams.get('model_id');
const MODEL_VERSION = urlParams.get('model_version');
const BASE_URL = import.meta.env.VITE_BASE_URL;

// 存储获取过的源数据
const cache = {
	initial: false,
	rawSetiingsList: []
};

// 获取模型数据
const getRawSettings = async () => {
	if (!cache.initial) return null;

	let rawSettings = cache.rawSetiingsList.find(setting => {
		const { modelId, modelVersion } = setting;

		return modelId === MODEL_ID && modelVersion === MODEL_VERSION;
	})?.data;

	if (!rawSettings) {
		rawSettings = await modelServer.getRawSettings(MODEL_ID, MODEL_VERSION);

		cache.rawSetiingsList.push({
			modelId: MODEL_ID,
			modelVersion: MODEL_VERSION,
			data: rawSettings
		});
	}

	return rawSettings;
};

const dataCenter = {
	// 初始化
	async init() {
		if (cache.initial) return;

		cache.initial = true;
	},

	// 获取首入场景 id
	getEntrySenceId() {
		return '';
	},

	// 获取已存在过的场景数据
	getExistSceneData() {
		return null;
	},

	// 获取场景列表，用于绘制场景切换栏
	getSceneBarList() {
		return [];
	},

	// 获取模型加载数据
	async getCoreData(sceneId) {
		if (!cache.initial) return null;

		const rawSettings = await getRawSettings(sceneId);

		const rawCoreData = {
			rawSettings,
			modelId: MODEL_ID,
			modelVersion: MODEL_VERSION,
			modelBaseUrl: BASE_URL,
			pointImage: 'default',
			entryInfo: {
				mode: 'panorama',
				point: 'location_02',
				rotation: { x: 0, y: 0, z: 0, w: 0 },
			}
		};
		return Adapter.core.adapt('model-1.0.0', 'initData-1.3.0', rawCoreData);
	},

	// 获取楼层列表
	async getFloorList(sceneId) {
		if (!cache.initial) return null;

		const rawSettings = await getRawSettings(sceneId);

		return rawSettings?.building?.floors || [];
	},

	// 获取热点标签数据
	getHotspotTagData() {
		return [];
	},

	// 获取热点标签源数据
	getHotspotTagSourceList() {
		return null;
	}
};

export default dataCenter;