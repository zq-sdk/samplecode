const replaceRuleMap = {
	'https?://material.3dnest.cn/work/':
		(options) => `${options.origin}/material/`,
	'https?://material.3dnest.cn/':
		(options) => `${options.origin}/material/`,
	'//material.3dnest.cn/':
		(options) => `${options.origin}/material/`,
	'https?://modelcdn2?.3dnest.cn/':
		(options) => `${options.origin}/model/`,
	'https?://infocdn2?.3dnest.cn/':
		(options) => `${options.origin}/model/`,
	'https?://bucket-material.oss-cn-beijing.aliyuncs.com/':
		(options) => `${options.origin}/material/`
};

const replaceUrl = (data, options = {}) => {
	let dataStr = JSON.stringify(data);

	for (const [regStr, target] of Object.entries(replaceRuleMap)) {
		dataStr = dataStr.replace(new RegExp(regStr, 'g'), target(options));
	}

	return JSON.parse(dataStr);
};

/**
 * 离线数据包中获取的数据，其中资源链接为线上链接
 * 可通过该方法替换数据中全部资源链接 origin
 */
class Replacer {
	execute(data, options = {}) {
		if (!data) return null;

		return replaceUrl(data, Object.assign({
			origin: window.location.origin
		}, options));
	}
}

const replacer = new Replacer();

export {
	replacer
};