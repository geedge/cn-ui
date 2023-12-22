import { config } from '@vue/test-utils'
var BASE_CONFIG = {
  baseUrl: 'http://192.168.44.54:8091/',
  version: '23.06',
  apiVersion: 'v1'
}
const DEFAULT_TIME_FILTER_RANGE = {
  dashboard: 60,
  entity: {
    list: 60,
    trafficLine: 60,
    informationAggregation: 0,
    relatedEntity: 60 * 24 * 7,
    openPort: 60 * 24 * 7,
    securityEvent: 60 * 24 * 7,
    performanceEvent: 60 * 24 * 7,
    behaviorPattern: 60 * 24 * 7
  },
  detection: 60
}
/* 开启测试 */
config.global.mocks.isUnitTesting = true
/* 初始化dayjs */
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const advancedFormat = require('dayjs/plugin/advancedFormat')
const weekday = require('dayjs/plugin/weekday')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
window.$dayJs = dayjs
window.BASE_CONFIG = BASE_CONFIG
window.DEFAULT_TIME_FILTER_RANGE = DEFAULT_TIME_FILTER_RANGE
// 引入 lodash 工具 模拟 lodash
const _ = require('lodash') // lodash工具

/* 模拟vue-router库，否则组件中引用vue-router的代码报错 */
jest.mock('vue-router', () => {
  return {
    useRouter: jest.fn(),
    useRoute: jest.fn(),
    createWebHashHistory: jest.fn(),
    createRouter: jest.fn().mockReturnValue({
      beforeEach: jest.fn()
    })
  }
})
/* 模拟axios */
jest.mock('axios')
/* 模拟indexedDB工具 */
jest.mock('@/indexedDB')
/* 模拟$t */
config.global.mocks.$t = key => key
/* 模拟$route，具体用例中需要不同值时重写覆盖即可 */
config.global.mocks.$route = { query: '' }
/* 模拟 lodash */
config.global.mocks.$_ = _
/* 消除warn */
jest.spyOn(console, 'warn').mockImplementation(() => {})
/* 模拟codemirror */
jest.mock('Codemirror')
