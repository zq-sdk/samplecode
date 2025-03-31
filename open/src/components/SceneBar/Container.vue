<script setup>
import { inject, defineOptions, ref } from 'vue';

defineOptions({
	name: 'SceneBarContainer'
});

const space = inject('space');

const sceneBarList = ref([]);
const sceneHover = ref('');
const sceneActive = ref('');
const sceneBarVisible = ref(true);

const switchScene = sceneId => {
	if (sceneId === sceneActive.value) return;

	space.switchScene(sceneId);
};

space.on('space.init.end', () => {
	if (space.sceneBarList && space.sceneBarList[0]) {
		sceneBarList.value = space.sceneBarList[0].scenes;
	}
});

space.on('space.switch.scene.start', sceneId => sceneActive.value = sceneId);
space.on('navigator.view.state.change', isExit => sceneBarVisible.value = isExit);
space.on('measure.enter', () => sceneBarVisible.value = false);
space.on('measure.quit', () => sceneBarVisible.value = true);

</script>

<template>

<div v-show="sceneBarVisible && sceneBarList.length > 0" id="scene-bar-container">
	<div class="scene-swiper-container">
		<div class="scene-swiper">
			<div
				v-for="bar in sceneBarList"
				:key="bar.scene_id"
				class="scene-swiper-slide"
				@mouseenter="sceneHover = bar.scene_id"
				@mouseleave="sceneHover = ''"
				@click="switchScene(bar.scene_id)"
			>
				<div
					class="scene-swiper-image"
					:class="{
						'hover': bar.scene_id === sceneHover,
						'active': bar.scene_id === sceneActive
					}"
					:style="{
						backgroundImage: `url(${bar.cover}?x-oss-process=image/resize,w_180,m_lfit)`
					}"
				></div>
				<div class="scene-swiper-title">{{ bar.name }}</div>
			</div>
		</div>
	</div>
</div>

</template>

<style scoped>
#scene-bar-container {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 120px;
	background-color: #0000004d;

	.scene-swiper-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70px;
		margin-top: 8px;
	}

	.scene-swiper {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
	}

	.scene-swiper-slide {
		position: relative;
		width: 125px;
		height: 70px;
		border-radius: 5px;
		cursor: pointer;
		box-sizing: border-box;

		&:not(:last-child) {
			margin-right: 10px;
		}
	}

	.scene-swiper-image {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		border-radius: 5px;

		&.hover,
		&.active {
			box-shadow: inset 0px 0px 0px 2px #ffffff;
		}
	}

	.scene-swiper-title {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 26px;
		line-height: 26px;
		text-align: center;
		color: #ffffff;
		background-color: #0000004d;
		font-size: 12px;
		word-break: keep-all;
		overflow: hidden;
	}
}
</style>
