export class Camera {
	constructor(injection) {
		this.space = injection.space;
		this.qspace = injection.space.qspace;

		this.init();
	}

	init() {
		this.space.on('space.switch.scene.end', () => this.updateZoom());
		this.qspace.view.addEventListener('mode.change', () => this.updateZoom());
	}

	updateZoom() {
		const { dollhouseCamera, floorplanCamera } = this.qspace;

		// 开启平面相机模式的缩放与拖拽，根据实际情况选择开启/关闭
		floorplanCamera.enableZoomControl();
		floorplanCamera.enablePanControl();

		// 全景图或相机模式为全景相机时，使用“变焦缩放”
		if (this.space.modelType === 'purepano' || this.space.viewMode === 'panorama') {
			dollhouseCamera.disableDistanceZoomControl();
			dollhouseCamera.enableZoomControl();
		} else { // 实拍、虚拟、倾斜摄影，相机模式为 3d 或平面时，使用“距离缩放”
			dollhouseCamera.enableDistanceZoomControl();
			dollhouseCamera.disableZoomControl();
		}
	}

	lookAt(options) {
		const { panoramaCamera } = this.qspace;

		panoramaCamera.disableControl();
		panoramaCamera.lookAtTarget({
			target: options.target,
			duration: options?.duration || 1000,
			progress: () => { },
			complete: () => {
				if (options.complete) options.complete();

				panoramaCamera.enableControl();
				this.space.emit('space.camera.look.at.complete', options);
			}
		});
	}

	lookAt3d(options) {
		const { originPose = {}, targetPose, duration, delay, complete } = options;
		const { dollhouseCamera } = this.qspace;

		dollhouseCamera.disableControl();
		dollhouseCamera.switchPose({
			origin_pose: {
				position: dollhouseCamera.position,
				quaternion: dollhouseCamera.quaternion,
				target: dollhouseCamera.target,
				...originPose
			},
			target_pose: {
				...targetPose
			},
			duration: duration || 1000,
			delay: delay || 0,
			complete: () => {
				if (complete) complete();

				dollhouseCamera.enableControl();
				this.space.emit('space.camera.look.at.3d.complete', options);
			}
		});
	};
}