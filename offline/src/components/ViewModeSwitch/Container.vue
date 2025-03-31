<script setup>
import { inject, defineOptions, ref } from 'vue';

defineOptions({
	name: 'ViewModeSwitchContainer'
});

const space = inject('space');
const viewMode = ref('');
const modeList = [
	{ key: 'panorama', title: '漫游' },
	{ key: 'dollhouse', title: '三维' },
	{ key: 'floorplan', title: '平面' },
];
const isEnterMeasure = ref(false);
space.on('measure.enter', () => isEnterMeasure.value = true);
space.on('measure.quit', () => isEnterMeasure.value = false);
space.on('space.switch.scene.end', () => viewMode.value = space.viewMode);
space.on('space.view.mode.change', mode => viewMode.value = mode);

const changeViewMode  = mode => space.turnViewTo(mode);

</script>

<template>

<div
	v-show="viewMode !== 'transitioning' > -1 && !isEnterMeasure"
	id="view-mode-switch-container"
>
	<div
		v-for="(mode, index) in modeList"
		:key="index"
		class="mode-switch-option"
		:class="{
			active: viewMode === mode.key
		}"
		@click="changeViewMode(mode.key)"
	>{{ mode.title }}</div>
</div>

</template>

<style scoped>
#view-mode-switch-container {
	position: absolute;
	top: 30px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	justify-content: center;
	align-items: center;
	width: 200px;
	height: 30px;

	.mode-switch-option {
		margin: 0 5px;
		width: 50px;
		text-align: center;
		line-height: 30px;
		cursor: pointer;
		font-size: 16px;
		font-weight: 700;
		color: #ffffff4d;

		&.active {
			color: #ffffff;
		}
	}
}
</style>
