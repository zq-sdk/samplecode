const { HotspotTag } = window;
import dataCenter from '../../DataCenter/index.js';

// 标签详情中，存储相机相关配置的字段
const modeVisibleParamMap = {
	panorama: 'pano_config',
	dollhouse: 'three_dimensional_config'
};

export class Tag {
	constructor(injection) {
		this.space = injection.space;
		this.qspace = injection.space.qspace;
		this.plugin = {}; // 该功能中使用到的功能插件&应用插件
		this.tagData = null; // 渲染标签的数据
		this.tagIdToData = {};
	}

	// 初始化热点标签功能
	init() {
		const hotspotTag = this.plugin.hotspotTag = new HotspotTag();
		const { resourceBaseUrl } = this.space;

		hotspotTag.init({
			res: {
				head_bg: `${resourceBaseUrl}/e100_sdk/tag-head-bg.png`,
				base_plate: `${resourceBaseUrl}/e100_sdk/tag.base.plate.png`,
				rotate_control_torus: `${resourceBaseUrl}/e100_sdk/torus_2x.png`,
				rotate_control_arc_surface: `${resourceBaseUrl}/e100_sdk/arc_surface_2x.png`
			}
		});

		this.qspace.extension.mount(hotspotTag, () => { });

		// 鼠标在标签头上，禁用点位切换，防止点击时触发多个事件
		// 也可用同样方式处理标签标题
		hotspotTag.addEventListener('head.hover', tag => {
			this.space.feature.waypoint.disableSwitch();
		});

		// 鼠标移出标签头，恢复点位切换
		hotspotTag.addEventListener('head.hoverout', tag => {
			this.space.feature.waypoint.enableSwitch();
		});

		// 点击标签头
		hotspotTag.addEventListener('head.click', tag => {
			const cameraFeature = this.space.feature.camera;
			// 获取标签业务数据信息
			const tagInfo = this.getHotspotTagInfo(tag.id);
			// 当前模型的类型
			const sceneType = this.qspace.model.type;
			// 派发一个开始标签点击的事件
			this.space.emit('space.tag.head.click', tagInfo);

			// 在非全景图场景中，如果标签没有绑定点位，说明是仅 3d 模式显示的标签
			if (sceneType !== 'purepano' && !tagInfo.location_id) {
				const {
					label_control_target_3d: target3d,
					label_camera_position_3d: position3d,
					label_camera_quaternion_3d: quaternion3d
				} = tagInfo;

				const targetPose = {
					target: target3d,
					position: position3d,
					quaternion: quaternion3d
				};

				cameraFeature.lookAt3d({
					targetPose,
					duration: 500,
				});

				return;
			}

			// 如果当前点位和标签绑定的点位相同
			// 或当前为全景图，全景图只有一个点位
			// 此时相机看向标签
			if (this.space.currentWaypoint === tag.location_id || sceneType === 'purepano') {
				cameraFeature.lookAt({
					duration: 500,
					target: tag.position,
					complete: () => {
						this.space.emit('space.tag.head.click.end', tagInfo);
					}
				});
			} else {
				// 启用点位切换，因为在标签 head.hover 时禁用了
				this.space.feature.waypoint.enableSwitch();
				// 移动到标签绑定的点位，并看向它
				this.qspace.model.switchWaypoint({
					location_id: tag.location_id,
					lookat_target: tag.position,
					complete: () => {
						this.space.emit('space.tag.head.click.end', tagInfo);
					}
				});
			}
		});

		// 目前平面模式未显示标签
		this.qspace.view.addEventListener('mode.change', mode => {
			if (['panorama', 'dollhouse'].includes(mode)) this.computeTagVisible();
			if (mode === 'floorplan') this.hideAll();
		});

		this.qspace.model.addEventListener('switch.waypoint.complete', () => this.computeTagVisible());

		// 每次切换场景，先把当前场景已加载的标签都删除，场景加载完成后会加载新场景中的标签
		this.space.on('space.switch.scene.start', () => {
			this.removeAll();
		});
	}

	// 设置标签数据
	setData(data) {
		this.tagData = data;
		data.forEach(tag => this.tagIdToData[tag.id] = tag);
	}

	// 获取标签数据
	getData() {
		return this.tagData;
	}

	// 更新热点标签
	update() {
		if (!this.tagData) return;

		const { hotspotTag } = this.plugin;

		hotspotTag.load({
			data: this.tagData,
			success: () => {
				this.computeTagVisible();
			},
			failed: () => console.log('tags load failed!')
		});
	}

	computeTagVisible() {
		const { hotspotTag } = this.plugin;
		const tagList = hotspotTag.getAllData();
		const modeVisibleParam = modeVisibleParamMap[this.space.viewMode];

		if (!modeVisibleParam) return;

		tagList.forEach(tag => {
			const { id, uuid } = tag;
			const tagInfo = this.getHotspotTagInfo(id);

			// 后台配置该需要隐藏
			// or 在当前相机模式不显示
			// 老版本数据，tagInfo[modeVisibleParam] 可能不存在，即不可配置显隐，在该模式下显示
			if (!this.tagIdToData[id].visible
				|| (tagInfo[modeVisibleParam] && !tagInfo[modeVisibleParam].visible)
			) {
				hotspotTag.hide(uuid);
				return;
			}

			// 全景相机，计算后续遮挡等信息
			if (this.space.viewMode !== 'panorama') {
				hotspotTag.show(uuid);
				return;
			}

			// 根据标签是否被模型遮挡的计算结果，控制标签显隐
			const barrier = hotspotTag.computeHeadIsBarrierWithinModel(uuid);

			barrier ? hotspotTag.hide(uuid) : hotspotTag.show(uuid);
		});
	}

	// 通过标签id获取热点标签业务信息
	getHotspotTagInfo(tagId) {
		const { currentSceneId } = this.space;
		const tagSourceList = dataCenter.getHotspotTagSourceList(currentSceneId);
		const info = tagSourceList.find(tagSourceItem => tagSourceItem.id === tagId);

		// 内容信息
		// info.content.text.content
		// 标题
		// info.content.title_info.text
		// 关键字（如果数据版本较低，此字段可能不存在）
		// info.keyword

		return info;
	}

	// 显示所有初始 visible 为 true 的标签
	showAll() {
		const { hotspotTag } = this.plugin;

		if (!hotspotTag) return;

		hotspotTag.getAllData().forEach((tag, index) => {
			if (this.tagData[index].visible) {
				hotspotTag.show(tag.uuid);
			}
		});
	}

	// 隐藏所有标签
	hideAll() {
		const { hotspotTag } = this.plugin;

		if (!hotspotTag) return;

		hotspotTag.getAllData().forEach(tag => hotspotTag.hide(tag.uuid));
	}

	// 移出当前加载的所有标签
	removeAll() {
		const { hotspotTag } = this.plugin;

		if (!hotspotTag) return;

		hotspotTag.getAllData().forEach(tag => hotspotTag.del(tag.uuid));
	}
}