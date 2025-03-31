import * as Events from '@produck/charon-events';
import dataCenter from './DataCenter/index.js';
import { openServer } from '../Service/index.js';
import * as Feature from './Feature/index.js';

const { qspace } = window;

export class Space extends Events.Simple.Emitter {
	constructor(vue) {
		super();

		this.vue = vue;
		this.workId = '';
		this.qspace = qspace;
		this.coreData = null;
		this.sceneBarList = null;
		this.currentSceneId = '';
		this.state = {
			isD2P: false
		};
		this.feature = {};

		const injection = Object.freeze({ space: this });

		this.feature.tag = new Feature.Tag(injection);
		this.feature.floor = new Feature.Floor(injection);
		this.feature.view = new Feature.View(injection);
		this.feature.waypoint = new Feature.Waypoint(injection);
		this.feature.camera = new Feature.Camera(injection);
	}

	// 当前场景信息
	get currentScene() {
		return dataCenter.getExistSceneData(this.currentSceneId);
	}

	// 当前点位 id，3D模式 & 平面模式时为 null
	get currentWaypoint() {
		return this.qspace.model.waypoint;
	}

	// 当前场景的模型类型 model 模型 / purepano 全景
	get modelType() {
		return this.qspace.model.type;
	}

	// 当前模式 漫游、三维、平面
	get viewMode() {
		return this.qspace.view.mode;
	}

	// 根据环境，获取部分插件初始化时使用的资源的地址，以适配不同启动模式
	get resourceBaseUrl() {
		return '//material.3dnest.cn';
	}

	// 初始化，处理作品相关内容
	async init() {
		const urlParams = new URLSearchParams(window.location.search);
		this.workId = urlParams.get('work_id');

		// offline model 模式也可以不在 url 后拼接 work_id
		if (!this.workId && !['offline', 'model'].includes(import.meta.env.MODE)) {
			throw new Error('请在 url 添加参数 ?work_id=作品id');
		}

		// 监听一些 qspace 中的事件
		// 根据实际情况也可以拆分成一个模块，此处为了方便查看未拆分
		this.eventListen();

		// 初始化 dataCenter，从 dataCenter 中获取处理好的数据
		await dataCenter.init(this.workId);

		// 首入场景 id
		const entrySceneId = dataCenter.getEntrySenceId();
		// 当前作品全部场景
		this.sceneBarList = dataCenter.getSceneBarList();
		// 切换到首入场景
		await this.switchScene(entrySceneId);

		this.emit('space.init.end');
	}

	// 切换场景
	async switchScene(sceneId = this.currentSceneId) {
		this.emit('space.switch.scene.start', sceneId);
		this.currentSceneId = sceneId;

		// 从 dataCenter 获取当前场景所需的处理好的数据
		// 先获取 coreData，后续有些数据可以从 dataCenter 中缓存的 coreData 中提取
		const coreData = await dataCenter.getCoreData(sceneId);
		// 标签数据 & 楼层数据
		const [hotspotTagData, floorList] = await Promise.all([
			dataCenter.getHotspotTagData(sceneId),
			dataCenter.getFloorList(sceneId)
		]);

		// qspace.js 不支持 dollhouse.flyto.panorama，需手动实现从 dollhouse 进入 panorama
		if (coreData.entry_info.mode === 'dollhouse.flyto.panorama') {
			coreData.entry_info.mode = 'dollhouse';
			this.state.isD2P = true;
		}

		// 场景数据
		this.coreData = coreData;
		// 热点标签数据
		this.feature.tag.setData(hotspotTagData);
		// 楼层数据
		this.feature.floor.setData(floorList);

		qspace.core.initData(this.coreData);
		qspace.core.beginRender({
			onProgress: data => {
				// 加载进度
				console.log('on core progress:', data);
			},
			onLoaded: () => {
				// 首次加载场景，会触发 onLoaded，不会收到 switch.scene.complete 事件
				// 初始化各个功能/应用插件，并首次更新
				// 功能模块中，init 方法会将用到的功能插件挂载到 qspace 上，需在 onLoaded 后才能挂载
				this.feature.tag.init();

				// 首次更新各功能状态
				this.feature.tag.update();
				this.feature.floor.update();

				if (this.state.isD2P) {
					this.feature.waypoint.switchFirstWaypoint();
					this.state.isD2P = false;
				}

				// 派发一个切换场景完成的事件
				// 后需切换场景时，会收到 switch.scene.complete 事件，其回调中也会派发该事件
				this.emit('space.switch.scene.end');
			}
		});
	}

	// 监听 qspace 中的事件，并用过 Space 派发，可在 vue 中监听
	eventListen() {
		this.qspace.view.addEventListener('mode.change', mode => this.emit('space.view.mode.change', mode));
		this.qspace.panoramaCamera.addEventListener('rotation', info => this.emit('space.panorama.camera.rotation', info));
		this.qspace.model.addEventListener('switch.waypoint.start', info => this.emit('space.model.switch.waypoint.start', info));
		this.qspace.model.addEventListener('switch.waypoint.complete', info => this.emit('space.model.switch.waypoint.end', info));
		this.qspace.model.addEventListener('switch.floor.complete', () => {
			if (this.qspace.model.floor) {
				this.feature.floor.update();
				this.emit('space.waypoint.floor.change', this.qspace.model.floor.idx);
			}
		});
		this.qspace.core.addEventListener('switch.scene.complete', () => {
			// 非首次加载场景，会收到 switch.model.complete 事件
			// 每次切换场景（除首次），更新各个功能/应用插件
			this.feature.tag.update();
			this.feature.floor.update();

			if (this.state.isD2P) {
				this.feature.waypoint.switchFirstWaypoint();
				this.state.isD2P = false;
			}

			// 派发一个切换场景完成的事件
			this.emit('space.switch.scene.end');
		});
	}

	// 多层模型切换楼层
	switchFloor(idx) {
		this.feature.floor.switchFloor(idx);
	}

	// 切换 漫游、三维、平面 模式
	turnViewTo(name) {
		this.feature.view.turnTo(name);
	}
}