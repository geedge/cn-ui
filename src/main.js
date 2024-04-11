import { createApp } from 'vue'
import '@/assets/css/font/iconfont.css'
import '@/assets/css/font/iconfont.js'
import router from '@/router'
import store from '@/store'
import App from '@/App.vue'
import '@/utils/http.js'
import commonMixin from '@/mixins/common'
import { cancelWithChange, noData, myHighLight, selectLoadMore } from '@/utils/tools'
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
import Renderer from '@/components/advancedSearch/showhint/Hint/Renderer'
import 'lib-flexible'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const emitter = new bus()

const _ = require('lodash') // lodash工具

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.use(i18n)
app.use(hljsVuePlugin)
app.use(VueGridLayout)

app.directive('ele-click-outside', ClickOutside)
app.directive('cancel', cancelWithChange)
app.directive('no-data', noData)
app.directive('high-light', myHighLight)
app.directive('select-load-more', selectLoadMore)
app.config.globalProperties.$_ = _

app.mixin(commonMixin)

app.component('date-time-range', DateTimeRange)
app.component('time-refresh', TimeRefresh)
app.component('panel-chart-list', PanelChartList)
app.component('chart-error', Error)
app.component('Renderer', Renderer)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')

app.config.globalProperties.emitter = emitter
export default app
