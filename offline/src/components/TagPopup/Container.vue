<script setup>
import { inject, defineOptions, ref } from 'vue';

defineOptions({
	name: 'TagPopupContainer'
});

const space = inject('space');
const tagPopupVisible = ref(false);
const currentTag = ref(null);
const tagTitle = ref('');
const tagPopupPostion = ref({ top: 100, left: 0 });

const updatePosotion = () => {
	if (!currentTag.value) return;

	const { x, y } = space.qspace.sceneCamera.convertWorldPositionToScreen(currentTag.value.position);

	tagPopupPostion.value.left = x - 100;
	tagPopupPostion.value.top = y - 150;
};

const close = () => {
	tagPopupVisible.value = false;
	currentTag.value = null;
};

space.on('space.tag.head.click.end', tag => {
	currentTag.value = tag;
	tagTitle.value = tag.title_info || tag.content.title_info;
	updatePosotion();
	tagPopupVisible.value = true;
});

space.on('space.panorama.camera.rotation', () => updatePosotion());
space.on('space.view.mode.change', () => tagPopupVisible.value = false);
space.on('space.model.switch.waypoint.start', () => tagPopupVisible.value = false);
space.on('space.switch.scene.start', () => tagPopupVisible.value = false);

</script>

<template>

<div id="tag-popup-container">
	<div
		v-show="tagPopupVisible"
		class="tag-popup"
		:style="{
			top: tagPopupPostion.top + 'px',
			left: tagPopupPostion.left + 'px'
		}"
		@click="close()"
	>
		<p>点击弹框关闭</p>
		<p>标题：{{ tagTitle.text }}</p>
		<p>可自定义弹框内容</p>
	</div>
</div>

</template>

<style scoped>
#tag-popup-container {
	.tag-popup {
		position: fixed;
		width: 200px;
		height: 100px;
		border-radius: 8px;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.7);
		border: 1px solid #333333;
		color: #ffffff;

		p {
			margin: 5px 0;
		}
	}
}
</style>
