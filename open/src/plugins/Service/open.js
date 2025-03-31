const baseUrl = import.meta.env.VITE_BASE_URL;
const globalBaseURL = baseUrl + '/api/v1/qverse_open_platform/openapi';

let Authorization = '';

const get = url => {
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization
		}
	}).then(res => res.json()).then(res => res.data || res);
};

const post = (url, data) => {
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization
		},
		body: JSON.stringify(data)
	}).then(res => res.json()).then(res => res.data || res);
};

const getLocalBaseUrl = () => {
	const url = new URL(window.location.href);
	let path = url.pathname.replace('index.html', '');

	if (path.endsWith('/')) {
		path = path.slice(0, -1);
	}

	return `${url.origin}${path}`;
};

export class OpenService {
  get baseUrl() {
		return isDev
			? import.meta.env.VITE_BASE_URL
			: import.meta.env.VITE_BASE_URL_PROD
				? `${import.meta.env.VITE_BASE_URL_PROD}/${this.workId}`
				: getLocalBaseUrl();
	}
	/* 鉴权 */
	async appAccessToken(data) {
		const result = await post(`${globalBaseURL}/auth/access_token`, data);

		Authorization = result.token;

		return result;
	}

	/* 作品信息 */
	async getWorkData(workId) {
		return get(`${globalBaseURL}/work/info?id=${workId}`);
	}

	/* 作品展示信息 */
	async getDisplayData(workId) {
		return get(`${globalBaseURL}/display/work/info?id=${workId}`);
	}

	/* 场景 */
	async getSceneData(sceneId) {
		return get(`${globalBaseURL}/display/scene/info?id=${sceneId}`);
	}

	/* 导航栏 */
	async getNavigatorData(workId) {
		return get(`${globalBaseURL}/display/navigator/info?work_id=${workId}`);
	}

	/* 点位 */
	async getLocationData(sceneId) {
		return get(`${globalBaseURL}/display/location/list?scene_id=${sceneId}`);
	}

	/* 定位点 */
	async getAnchorData(sceneId) {
		return get(`${globalBaseURL}/display/anchor_location/list?scene_id=${sceneId}`);
	}

	/* 自动导览 */
	async getAutoGuideData(sceneId) {
		return get(`${globalBaseURL}/display/auto_guide/list?scene_id=${sceneId}`);
	}

	/* 热点标签 */
	async getHotspotsData(sceneId) {
		return get(`${globalBaseURL}/display/hotspot/list?scene_id=${sceneId}`);
	}

	/* 平面图 */
	async getFloorplanData(sceneId) {
		return get(`${globalBaseURL}/display/floorplan/info?scene_id=${sceneId}`);
	}

	/* 内容摆放 */
	async getPlacementData(sceneId) {
		return get(`${globalBaseURL}/display/placement/list?scene_id=${sceneId}`);
	}

	/* 测量组 */
	async getMeasureData(sceneId) {
		return get(`${globalBaseURL}/display/measure/list?scene_id=${sceneId}`);
	}

	/* 分区讲解 */
	async getSectionaltData(sceneId) {
		return get(`${globalBaseURL}/display/sectional_explanation/list?scene_id=${sceneId}`);
	}

	async getRawSettings(modelId, modelVersion) {
		return get(`${globalBaseURL}/scene_matarial/raw_setting?scene_material_id=${modelId}&scene_material_version=${modelVersion}`);
	}
}