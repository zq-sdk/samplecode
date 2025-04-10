export class Floor {
	constructor(injection) {
		this.space = injection.space;
		this.qspace = injection.space.qspace;
		this.plugin = {}; // 该功能中使用到的功能插件&应用插件
		this.floorData = null; // 渲染户型图的数据
	}

	setData(data) {
		this.floorData = data;
	}

	getData() {
		return this.floorData;
	}

	update() {
		// 目前“全景图”没有楼层
		if (this.space.modelType === 'purepano') return;

		const floors = this.qspace.model.floors;

		// 添加楼层索引
		floors.forEach(floor => {
			const { idx } = floor;

			if (this.floorData && this.floorData[idx] && !('flooridx' in this.floorData[idx])) {
				this.floorData[idx].flooridx = idx;
			}
		});
	}

	switchFloor(idx) {
		if (!this.floorData) return;

		this.floorData.forEach((floor, index) => {
			const { flooridx } = floor;

			// 楼层全部显示
			if (idx === 'all') {
				this.qspace.model.showFloor(flooridx);
				return;
			}

			// 选择了某个楼层，即只显示对应的楼层，隐藏其他楼层
			flooridx === idx
				? this.qspace.model.showFloor(flooridx)
				: this.qspace.model.hideFloor(flooridx);

			// 应禁用非选中楼层，即可点击进入当前显示的楼层
			// flooridx === idx
			// 	? this.qspace.model.enableFloor(flooridx)
			// 	: this.qspace.model.disableFloor(flooridx);
		});
	}
}