import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import 'animate.css'
import App from './App.vue'
import './style.css'

// 创建Vue应用实例
const app = createApp(App)

// 使用Element Plus UI组件库
app.use(ElementPlus)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info)
}

// 挂载应用
app.mount('#app')
