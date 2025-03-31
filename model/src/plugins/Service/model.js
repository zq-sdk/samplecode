const fetchData = url => fetch(url).then(res => res.json()).then(res => res.data || res);

export class ModelService {
	constructor() {
		this.workId = '';
	}

	get baseUrl() {
		return import.meta.env.VITE_BASE_URL;
	}

	async getRawSettings(modelId, modelVersion) {
		const rawSettingUrl = `${this.baseUrl}/${modelId}/info/${modelVersion}/raw_settings.txt`;
		return fetchData(rawSettingUrl);
	}
}