export class View {
	constructor(injection) {
		this.space = injection.space;
		this.qspace = injection.space.qspace;
		this.panoramaLeavePoint = null; // 离开漫游模式时的点位 id
	}

	// 切换 漫游、三维、平面 模式
	turnTo(name) {
		const map = {
			panorama: 'turnToPanorama', // 漫游
			dollhouse: 'turnToDollhouse', // 三维
			floorplan: 'turnToFloorplan' // 平面
		};

		if (!map[name]) return;

		let locationId;
		const scene = this.space.currentScene;

		if (name === 'panorama') {
			// 进入全景相机时，需提供一个点位 id
			locationId = this.panoramaLeavePoint // 离开漫游时的点位
				|| scene?.entry_info?.point // setting 场景数据取首入点
				|| scene?.fadein_view_location_id // 开放平台场景数据中取首入点
				|| 'location_01'; // 都没有用第一个点
		} else {
			// 离开全景相机时，记录一个离开的点位
			this.panoramaLeavePoint = this.space.currentWaypoint;
		}

		this.qspace.view[map[name]]({
			location_id: locationId
		});
	}
}