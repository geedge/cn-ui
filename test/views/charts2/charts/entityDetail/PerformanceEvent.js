import PerformanceEvent from '@/views/charts2/charts/entityDetail/tabs/PerformanceEvent'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import mockData from './mockData/PerformanceEvent'

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}
const entity = {
  entityType: 'ip',
  entityName: '153.99.250.123'
}

function init (query) {
  require('vue-router').useRoute.mockReturnValue({ query: query || {} })
}
function getRgb (str) {
  return str.substring(str.indexOf('rgb'), str.indexOf(';'))
}

describe('views/charts2/charts/entityDetail/tabs/PerformanceEvent.vue测试', () => {
  test('实体详情tabs-性能事件：信息展示', async () => {
    init()
    axios.get.mockResolvedValue(mockData.common)
    const wrapper = mount(PerformanceEvent, {
      propsData: {
        entity,
        timeFilter
      }
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="severity-color-block0"]')
      const textNode1 = await wrapper.get('[test-id="severity-color-block1"]')

      expect(getRgb(textNode0.html())).toEqual('rgb(216, 76, 76)')
      expect(getRgb(textNode1.html())).toEqual('rgb(255, 216, 45)')

      const severity0 = await wrapper.get('[test-id="severity0"]')
      const severity1 = await wrapper.get('[test-id="severity1"]')

      expect(severity0.text()).toEqual('critical')
      expect(severity1.text()).toEqual('info')

      const startTime0 = await wrapper.get('[test-id="start-time0"]')
      const startTime1 = await wrapper.get('[test-id="start-time1"]')

      expect(startTime0.text()).toEqual('2023-06-07 10:16:16')
      expect(startTime1.text()).toEqual('2023-06-07 10:16:16')

      const duration0 = await wrapper.get('[test-id="duration-time0"]')
      const duration1 = await wrapper.get('[test-id="duration-time1"]')

      expect(duration0.text()).toEqual('15 m')
      expect(duration1.text()).toEqual('15 m')
      resolve()
    }, 200))
  })
  test('实体详情tabs-性能事件：持续时间过小或过大，单位转换', async () => {
    init()
    axios.get.mockResolvedValue(mockData.empty)
    const wrapper = mount(PerformanceEvent, {
      propsData: {
        entity,
        timeFilter
      }
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const duration0 = await wrapper.get('[test-id="duration-time0"]')
      const duration1 = await wrapper.get('[test-id="duration-time1"]')

      expect(duration0.text()).toEqual('900 ms')
      expect(duration1.text()).toEqual('104167 d')
      resolve()
    }, 200))
  })
  test('实体详情tabs-性能事件：请求无数据', async () => {
    init()
    axios.get.mockResolvedValue(mockData.empty)
    const wrapper = mount(PerformanceEvent, {
      propsData: {
        entity,
        timeFilter
      }
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const noData = wrapper.get('[test-id="no-data"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
})
