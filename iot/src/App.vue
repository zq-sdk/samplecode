<script setup>
import { inject, ref, onMounted } from "vue";
import SceneContainer from "./components/SceneContainer.vue";

const space = inject("space");
const isInit = ref(false);

onMounted(async () => {
  await space.init();
  isInit.value = true;
});
</script>

<template>
  <SceneContainer v-if="isInit" />
</template>

<style scoped></style>
