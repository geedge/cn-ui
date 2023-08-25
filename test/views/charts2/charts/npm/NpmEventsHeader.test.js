import NpmEventsHeader from '@/views/charts2/charts/npm/NpmEventsHeader'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockData } from './mockData/NpmEventsHeader'
import common from '@/mixins/common'
import chartMixin from '@/views/charts2/chart-mixin'

// 模拟数据
const chartData = mockData.common.data
// type
const type = 'severity'
let wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * @param data
 */
function axiosPostAndMounted (data) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  const _data = data || chartData
  // 模拟 axios 数据
  axios.get.mockResolvedValue(_data)

  // 加载vue组件，获得实例
  wrapper = mount(NpmEventsHeader, {
    propsData: {
      type
    },
    mixins: [common, chartMixin]
  })
}

describe('views/charts2/charts/npm/NpmEventsHeader.vue测试', () => {
  test('严重等级各等级个数：npm event 严重等级单值', async () => {
    axiosPostAndMounted()
    // 严重等级
    const severity0 = wrapper.get('[test-id="severity0"]')
    const severity1 = wrapper.get('[test-id="severity1"]')
    const severity2 = wrapper.get('[test-id="severity2"]')
    const severity3 = wrapper.get('[test-id="severity3"]')
    const severity4 = wrapper.get('[test-id="severity4"]')
    // 各等级个数
    const total0 = wrapper.get('[test-id="total0"]')
    const total1 = wrapper.get('[test-id="total1"]')
    const total2 = wrapper.get('[test-id="total2"]')
    const total3 = wrapper.get('[test-id="total3"]')
    const total4 = wrapper.get('[test-id="total4"]')

    // type
    expect(wrapper.vm.type).toEqual('severity')

    expect(severity0.text()).toEqual('critical')
    expect(severity1.text()).toEqual('high')
    expect(severity2.text()).toEqual('medium')
    expect(severity3.text()).toEqual('low')
    expect(severity4.text()).toEqual('info')

    await new Promise(resolve => setTimeout(() => {
      expect(total0.text()).toEqual('322,334')
      expect(total1.text()).toEqual('1,111')
      expect(total2.text()).toEqual('2,000,000')
      expect(total3.text()).toEqual('14,456,678')
      expect(total4.text()).toEqual('122,222')
      resolve()
    }, 200))
  })
  test('请求无数据', async () => {
    axiosPostAndMounted(mockData.empty.data)
    // 各等级个数
    const total0 = wrapper.get('[test-id="total0"]')
    const total1 = wrapper.get('[test-id="total1"]')
    const total2 = wrapper.get('[test-id="total2"]')
    const total3 = wrapper.get('[test-id="total3"]')
    const total4 = wrapper.get('[test-id="total4"]')

    await new Promise(resolve => setTimeout(() => {
      expect(total0.text()).toEqual('-')
      expect(total1.text()).toEqual('-')
      expect(total2.text()).toEqual('-')
      expect(total3.text()).toEqual('-')
      expect(total4.text()).toEqual('-')
      resolve()
    }, 200))
  })
  test('数据为0或极大', async () => {
    axiosPostAndMounted(mockData.boundary.data)
    // 各等级个数
    const total0 = wrapper.get('[test-id="total0"]')
    const total1 = wrapper.get('[test-id="total1"]')
    const total2 = wrapper.get('[test-id="total2"]')
    const total3 = wrapper.get('[test-id="total3"]')
    const total4 = wrapper.get('[test-id="total4"]')

    await new Promise(resolve => setTimeout(() => {
      expect(total0.text()).toEqual('0')
      expect(total1.text()).toEqual('0')
      expect(total2.text()).toEqual('0')
      expect(total3.text()).toEqual('14,456,678')
      expect(total4.text()).toEqual('1,222,225,432,456,789')
      resolve()
    }, 200))
  })
})
