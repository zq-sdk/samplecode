export class Waypoint {
	constructor(injection) {
		this.space = injection.space;
		this.qspace = injection.space.qspace;

		// 只有全景相机模式显示点位，可根据情况调整
		this.qspace.view.addEventListener('mode.change', mode => {
			mode === 'panorama' ? this.showAll() : this.hideAll();
		});
	}

	switchFirstWaypoint() {
		this.qspace.model.switchWaypoint({
			switch_mode: 'default',
			location_id: this.qspace.model.waypoints[0].location_id
		});
	}

	enableSwitch() {
		this.qspace.model.enableSwitchWaypoint();
	}

	disableSwitch() {
		this.qspace.model.disableSwitchWaypoint();
	}

	show(id) {
		this.qspace.model.showWaypoint(id);
	}

	hide(id) {
		this.qspace.model.hideWaypoint(id);
	}

	showAll() {
		this.qspace.model.waypoints?.forEach(waypoint => {
			this.show(waypoint.location_id);
		});
	}

	hideAll() {
		this.qspace.model.waypoints?.forEach(waypoint => {
			this.hide(waypoint.location_id);
		});
	}
}