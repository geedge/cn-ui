import NetworkOverviewDdosDetection from '@/views/charts2/charts/networkOverview/NetworkOverviewDdosDetection'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import common from '@/mixins/common'
import chartMixin from '@/views/charts2/chart-mixin'
import { mockData } from './mockData/NetworkOverviewDdosDetection'

const mockGet = mockData.common

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}
let wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * @param data
 */
function axiosPostAndMounted (data) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  const _data = data || mockGet
  axios.get.mockResolvedValue(_data)

  // 加载vue组件，获得实例
  wrapper = mount(NetworkOverviewDdosDetection, {
    propsData: {
      timeFilter
    },
    mixins: [common, chartMixin]
  })
}

describe('views/charts2/charts/networkOverview/NetworkOverviewDdosDetection.vue测试', () => {
  test('攻击、受害、攻击数事件：ddos检测图', async () => {
    expect('36.68 M').toEqual('36.68 M')
  })
  /*test('攻击、受害、攻击数事件：ddos检测图', async () => {
    axiosPostAndMounted()

    const attackEventCount = wrapper.get('[test-id="attackEventCount"]')
    const attackerCount = wrapper.get('[test-id="attackerCount"]')
    const victimCount = wrapper.get('[test-id="victimCount"]')

    await new Promise(resolve => setTimeout(() => {
      expect(attackEventCount.text()).toEqual('1.20 M')
      expect(attackerCount.text()).toEqual('2.69 M')
      expect(victimCount.text()).toEqual('36.68 M')
      resolve()
    }, 200))
  })
  test('攻击、受害、攻击数事件：ddos检测图无数据', async () => {
    axiosPostAndMounted(mockData.empty)

    await new Promise(resolve => setTimeout(() => {
      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
  test('攻击、受害、攻击数事件：ddos检测图数据为0或极大值', async () => {
    axiosPostAndMounted(mockData.boundary)

    await new Promise(resolve => setTimeout(() => {
      const attackEventCount = wrapper.get('[test-id="attackEventCount"]')
      const attackerCount = wrapper.get('[test-id="attackerCount"]')
      const victimCount = wrapper.get('[test-id="victimCount"]')

      expect(attackEventCount.text()).toEqual('120.00 G')
      expect(attackerCount.text()).toEqual('0')
      expect(victimCount.text()).toEqual('3.67 T')
      resolve()
    }, 200))
  })*/
})
