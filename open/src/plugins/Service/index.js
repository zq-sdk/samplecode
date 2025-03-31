import { OpenService } from "./open.js"
const openServer = new OpenService()

export default {
  install: (app, options) => {
    app.provide("openServer", openServer)
  },
}

export {  openServer }
