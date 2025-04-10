import { ref, computed, onBeforeMount } from 'vue'
import { SPACE_EVENT_NAME_ENUM } from '../constants'

export function useSceneLoading(space) {
  const modelLoadingState = ref({
    // 首入点全景是否已加载完成
    isEntryPanoLoaded: false,
    // 模型纹理是否已加载完成
    isTextureLoaded: false,
  })

  const isModelLoaded = computed(
    () =>
      modelLoadingState.value.isEntryPanoLoaded &&
      modelLoadingState.value.isTextureLoaded
  )

  onBeforeMount(() => {
    space.on(SPACE_EVENT_NAME_ENUM.ENTRY_PANO_LOADED, () => {
      modelLoadingState.value.isEntryPanoLoaded = true
    })

    space.on(SPACE_EVENT_NAME_ENUM.MODEL_TEXTURE_LOADED, () => {
      modelLoadingState.value.isTextureLoaded = true
    })
  })

  return { modelLoadingState, isModelLoaded }
}

export default {}
