<script setup>
import { inject, defineOptions, ref, computed } from 'vue';

defineOptions({
	name: 'FloorSwitchContainer'
});

const space = inject('space');
const viewMode = ref('');
const floorList = ref([]);
const currentFloorIdx = ref({ floorplan: 0, dollhouse: 'all' });
const currentIdx = computed(() => currentFloorIdx.value[viewMode.value]);

const switchFloor = idx => {
	space.switchFloor(idx);

	if (idx !== 'all') currentFloorIdx.value.floorplan = idx;
	currentFloorIdx.value.dollhouse = idx;
};

space.on('space.switch.scene.end', () => {
	floorList.value = space.feature.floor.floorData || [];
});

space.on('space.waypoint.floor.change', idx => currentFloorIdx.value.floorplan = idx);

space.on('space.view.mode.change', mode => {
	viewMode.value = mode;

	mode === 'floorplan'
		? switchFloor(currentFloorIdx.value.floorplan)
		: switchFloor('all');
});

</script>

<template>

<div
	v-show="floorList.length > 1 && ['floorplan', 'dollhouse'].indexOf(viewMode) > -1"
	id="floor-switch-container"
>
	<div
		v-show="viewMode === 'dollhouse'"
		class="floor-switch-option"
		:class="{
			active: currentIdx === 'all'
		}"
		@click="switchFloor('all')"
	>全部</div>
	<div
		v-for="(floor, index) in floorList"
		:key="index"
		class="floor-switch-option"
		:class="{
			active: floor.flooridx === currentIdx
		}"
		@click="switchFloor(floor.flooridx)"
	>{{ floor.name }}</div>
</div>

</template>

<style scoped>
#floor-switch-container {
	position: absolute;
	left: 30px;
	top: 50%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	transform: translateY(-100%);
	width: 40px;
	padding: 20px 0;
	border-radius: 20px;
	background-color: rgba(41, 41, 41, .77);

	.floor-switch-option {
		margin: 5px 0;
		width: 100%;
		height: 20px;
		line-height: 20px;
		text-align: center;
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
