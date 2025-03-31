import CryptoJS from 'crypto-js';
import { openServer } from '../../Service/index.js';
const { Adapter } = window;

const APP_ID = import.meta.env.VITE_QVERSE_APP_ID;
const SECRET_KEY = import.meta.env.VITE_QVERSE_APP_SECRET;

// 存储获取过的源数据
const cache = {
	initial: false,
	workId: '',
	workData: null,
	workDisplayData: null, // 作品展示信息
	navigatorData: null, // 导航栏
	rawSetiingsList: [],
	sceneData: [],
	navigatorViewList: [],
	hotspotTagData: Object.create(null),
	waypointConfig: Object.create(null)
};

// 获取指定场景数据
const getSceneData = async sceneId => {
	if (!cache.initial) return null;

	let scene = cache.sceneData.find(scene => scene.id === sceneId);

	if (!scene) {
		scene = await openServer.getSceneData(sceneId);
		cache.sceneData.push(scene);
	}

	return scene;
};

// 获取模型数据
const getRawSettings = async sceneId => {
	if (!cache.initial) return null;

	const scene = await getSceneData(sceneId);
	let rawSettings = cache.rawSetiingsList.find(setting => {
		const { modelId, modelVersion } = setting;

		return modelId === scene.model_id && modelVersion === scene.model_version;
	})?.data;

	if (!rawSettings && scene.type !== 3 && scene.type !== 4) {
		rawSettings = await openServer.getRawSettings(scene.model_id, scene.model_version);

		cache.rawSetiingsList.push({
			modelId: scene.model_id,
			modelVersion: scene.model_version,
			data: rawSettings
		});
	}

	return rawSettings;
};

const accessToken = async () => {
	const app_id = APP_ID;
	const secret_key = SECRET_KEY;
	const timestamp = Math.floor(Date.now()).toString();
	const request_id = Math.random().toString(36).slice(-6); // 生成随机字符串
	const sign = CryptoJS.MD5(`${app_id}${secret_key}${timestamp}${request_id}`).toString();

	// 旧的 sign 拼接方式，已废弃
	// const sign = CryptoJS.MD5(`${app_id}+${timestamp}`).toString();

	return openServer.appAccessToken({
		app_id, timestamp, sign, request_id
	});
};

const dataCenter = {
	// 初始化，根据 作品id 获取作品信息
	async init(workId) {
		if (cache.initial) return;

		cache.workId = workId;
		cache.initial = true;

		await accessToken();

		const [workData, workDisplayData, navigatorData] = await Promise.all([
			openServer.getWorkData(cache.workId),
			openServer.getDisplayData(cache.workId),
			openServer.getNavigatorData(cache.workId)
		]);

		cache.workData = workData;
		cache.workDisplayData = workDisplayData;
		cache.navigatorData = navigatorData;
	},

	// 获取首入场景 id
	getEntrySenceId() {
		if (!cache.initial) return null;
		return cache.workDisplayData.first_view_scene_id;
	},

	// 获取已存在过的场景数据
	getExistSceneData(sceneId) {
		return cache.sceneData.find(scene => scene.id === sceneId);
	},

	// 获取场景列表，用于绘制场景切换栏
	getSceneBarList() {
		if (!cache.initial) return null;

		return Adapter.sceneGroup.adapt('open-1.0.0', 'sceneGroup-1.3.0', {group: cache.navigatorData});
	},

	// 获取模型加载数据
	async getCoreData(sceneId) {
		if (!cache.initial) return null;

		const scene = await getSceneData(sceneId);
		const rawSettings = await getRawSettings(sceneId);

		const waypointConfig = cache.waypointConfig[sceneId] || await openServer.getLocationData(sceneId);
		!cache.waypointConfig[sceneId] && (cache.waypointConfig[sceneId] = waypointConfig);

		const rawCoreData = {
			work: cache.workDisplayData,
			scene,
			rawSettings,
			// 若有户型图，该角度可从户型图数据中获取
			floorplanRotateAngle: 0,
			waypointConfig
		};

		return Adapter.core.adapt('open-1.0.0', 'initData-1.3.0', rawCoreData);
	},

	// 获取楼层列表
	// 若需要获取户型图编辑器更改过的楼层名称等信息，楼层数据需要从户型图数据中提取
	// 获取户型图数据 openServer.getFloorplanData(sceneId)
	async getFloorList(sceneId) {
		if (!cache.initial) return null;

		const rawSettings = await getRawSettings(sceneId);

		return rawSettings?.building?.floors || [];
	},

	// 获取热点标签数据
	async getHotspotTagData(sceneId) {
		if (!cache.initial) return null;

		const sceneData = await getSceneData(sceneId);
		const hotspotTagData = cache.hotspotTagData[sceneId] || await openServer.getHotspotsData(sceneId);

		!cache.hotspotTagData[sceneId] && (cache.hotspotTagData[sceneId] = hotspotTagData);

		return Adapter.hotspotTag.adapt('open-1.0.0', 'HotspotTagLoadOptions-1.3.0', {
			scene: sceneData,
			hotspotTagList: hotspotTagData
		});
	},

	getHotspotTagSourceList(sceneId) {
		if (!cache.initial) return null;

		const hotspotTagData = cache.hotspotTagData[sceneId];

		return hotspotTagData?.list || null;
	}
};

export default dataCenter;