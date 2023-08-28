import NpmEventsByType from '@/views/charts2/charts/npm/NpmEventsByType'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockData } from './mockData/NpmEventsByType'
import common from '@/mixins/common'
import chartMixin from '@/views/charts2/chart-mixin'

const mockGet = mockData.common.data
let wrapper = null

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000,
  endTime: 1673247600
}

/**
 * 进行axios请求，并挂载vue实例
 * @param data
 */
function axiosPostAndMounted (data) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  const _data = data || mockGet
  // 模拟 axios 数据
  axios.get.mockResolvedValue(_data)

  // 加载vue组件，获得实例
  wrapper = mount(NpmEventsByType, {
    propsData: {
      timeFilter
    },
    data () {
      return {
        isUnitTesting: true
      }
    },
    mixins: [common, chartMixin]
  })
}

describe('views/charts2/charts/npm/NpmEventsByType.vue测试', () => {
  test('类型分类事件统计信息： npm events 类型分类事件图 ', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      // type
      const testNode0 = wrapper.get('[test-id="testNode0"]')
      const testNode1 = wrapper.get('[test-id="testNode1"]')

      expect(testNode0.text()).toEqual('dns error')
      expect(testNode1.text()).toEqual('http error')

      // total
      const total0 = wrapper.get('[test-id="total0"]')
      const total1 = wrapper.get('[test-id="total1"]')
      expect(total0.text()).toEqual('151')
      expect(total1.text()).toEqual('32')
      resolve()
    }, 200))
  })
  test('类型分类事件统计信息： npm events 类型分类事件图无数据 ', async () => {
    axiosPostAndMounted(mockData.empty.data)

    await new Promise(resolve => setTimeout(() => {
      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
  test('类型分类事件统计信息： npm events 类型分类事件图无Http Error类型 ', async () => {
    const data = JSON.parse(JSON.stringify(mockData.common.data))
    data.data.data.result = data.data.data.result.filter(item => item.eventType !== 'http error')
    axiosPostAndMounted(data)

    await new Promise(resolve => setTimeout(() => {
      const testNode0 = wrapper.get('[test-id="testNode0"]')
      expect(testNode0.text()).toEqual('dns error')

      // total
      const total0 = wrapper.get('[test-id="total0"]')
      expect(total0.text()).toEqual('151')
      resolve()
    }, 200))
  })
})
