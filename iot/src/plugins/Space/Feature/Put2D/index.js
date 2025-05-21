import { SDK_EVENT_NAME_ENUM } from '@/constants'

const { Put2D } = window
const initOptions = {
  choosed_show_controller: {
    translate: false,
    rotate: false,
    scale: false,
  },
  icon: {
    play: '//material.3dnest.cn/e100_sdk/player-play-btn.png',
    rotate: '//material.3dnest.cn/e100_sdk/rotate_picker.png',
    rotate_hover: '//material.3dnest.cn/e100_sdk/rotate_picker_hover.png',
  },
}

export class Put2DContent {
  constructor(injection) {
    this.space = injection.space
    this.qspace = injection.space.qspace
    this.plugin = {}
  }

  init() {
    const put2d = (this.plugin.put2d = new Put2D())
    put2d.init(initOptions)

    this.qspace.extension.mount(put2d, () => {})

    put2d.addEventListener(SDK_EVENT_NAME_ENUM.PUT_2D.CLICK, data => {
      console.log(`点击 2D 物品->data`, data)
    })

    put2d.addEventListener(SDK_EVENT_NAME_ENUM.PUT_2D.HOVER, data => {
      console.log(`鼠标移入 2D 物品->data`, data)
    })

    put2d.addEventListener(SDK_EVENT_NAME_ENUM.PUT_2D.HOVER_OUT, data => {
      console.log(`鼠标移出 2D 物品->data`, data)
    })

    put2d.addEventListener('control.drag.start', data => {
      console.log('put2d: control.drag.start', data)
      this.qspace.model.disableSwitchWaypoint()
      this.qspace.panoramaCamera.disableControl()
    })

    put2d.addEventListener('control.drag.end', data => {
      console.log('put2d: control.drag.end', data)
      this.qspace.model.enableSwitchWaypoint()
      this.qspace.panoramaCamera.enableControl()
    })
  }
}
