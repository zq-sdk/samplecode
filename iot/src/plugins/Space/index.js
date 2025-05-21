import { Space } from './descriptor.js'

const spaceVueCustomPlugin = {
  install(app, _options) {
    const space = new Space(app)
    app.provide('space', space)
  },
}

export default spaceVueCustomPlugin
