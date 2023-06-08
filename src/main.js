import { createApp } from 'vue'
import '@/assets/css/font/iconfont.css'
import '@/assets/css/font/iconfont.js'
import router from '@/router'
import store from '@/store'
import App from '@/App.vue'
import { hasPermission } from '@/permission'
import commonMixin from '@/mixins/common'
import { cancelWithChange, noData } from '@/utils/tools'
import { ClickOutside } from 'element-plus/lib/directives'
import i18n from '@/i18n'
// import '@/mock/index.js'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/styles/color-brewer.css'
import '@/assets/css/main.scss' // 样式入口
import VueGridLayout from 'vue-grid-layout'
import ElementPlus from 'element-plus'
import bus from 'tiny-emitter'

import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'
import PanelChartList from '@/views/charts/PanelChartList'
import Error from '@/components/common/Error'
import 'lib-flexible'

const emitter = new bus()

const _ = require('lodash') // lodash工具

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.use(i18n)
app.use(hljsVuePlugin)
app.use(VueGridLayout)

app.directive('has', hasPermission) // 注册指令
app.directive('ele-click-outside', ClickOutside)
app.directive('cancel', cancelWithChange)
app.directive('no-data', noData)
app.config.globalProperties.$_ = _

app.mixin(commonMixin)

app.component('date-time-range', DateTimeRange)
app.component('time-refresh', TimeRefresh)
app.component('panel-chart-list', PanelChartList)
app.component('chart-error', Error)

app.mount('#app')

app.config.globalProperties.emitter = emitter
export default app
