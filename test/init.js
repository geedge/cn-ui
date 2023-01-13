import { config } from '@vue/test-utils'

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
/* 模拟$t */
config.global.mocks.$t = key => key
/* 模拟$route，具体用例中需要不同值时重写覆盖即可 */
config.global.mocks.$route = { query: '' }
/* 消除warn */
jest.spyOn(console, 'warn').mockImplementation(() => {})
