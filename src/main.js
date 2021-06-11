import { createApp } from 'vue'
import _ from 'lodash'

import router from '@/router'
import store from '@/store'
import App from '@/App.vue'
import { hasPermission } from '@/permission'
import commonMixin from '@/mixins/common'
import { cancelWithChange, clickOutside } from '@/utils/tools'
import i18n from '@/i18n'
import '@/assets/css/main.scss' // 样式入口

import ElementPlus from 'element-plus'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(ElementPlus)
app.use(i18n)
app.use(_)

app.directive('has', hasPermission) // 注册指令
app.directive('click-outside', clickOutside)
app.directive('cancel', cancelWithChange)

app.mixin(commonMixin)

app.mount('#app')
export default app
