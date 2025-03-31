const isDev = import.meta.env.DEV;
const fetchData = url => fetch(url).then(res => res.json()).then(res => res.data || res);

/**
 * 场景：该项目打包后的文件，复制粘贴到离线数据包中，将数据包整体部署到服务
 * 作用：获取当前服务用于获取离线包中数据的 baseUrl
 */
const getLocalBaseUrl = () => {
	const url = new URL(window.location.href);
	let path = url.pathname.replace('index.html', '');

	if (path.endsWith('/')) {
		path = path.slice(0, -1);
	}

	return `${url.origin}${path}`;
};

export class OfflineService {
	constructor() {
		this.workId = '';
	}

	get baseUrl() {
		return isDev
			? import.meta.env.VITE_BASE_URL
			: import.meta.env.VITE_BASE_URL_PROD
				? `${import.meta.env.VITE_BASE_URL_PROD}/${this.workId}`
				: getLocalBaseUrl();
	}

	async getSetting(workId) {
		const settingUrl = `${this.baseUrl}/base.json`;

		return fetchData(settingUrl);
	}

	async getRawSettings(modelId, modelVersion) {
		const rawSettingUrl = `${this.baseUrl}/model/${modelId}/${modelVersion}/raw_settings.txt`;

		return fetchData(rawSettingUrl);
	}

	async getFloorplanData(workId, sceneId) {
		const floorplanUrl = `${this.baseUrl}/houseplan/${sceneId}/houseplan_info.json`;

		return fetchData(floorplanUrl);
	}
}