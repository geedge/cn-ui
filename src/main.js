import { createApp } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'

import '@/assets/css/main.scss' // 样式入口

import ElementPlus from 'element-plus'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(ElementPlus)

app.mount('#app')
