import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import spaceVueCustomPlugin from './plugins/Space/index.js'

const app = createApp(App)

// 注册空间服务插件
app.use(spaceVueCustomPlugin)

app.mount('#app')
