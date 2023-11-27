import NpmNetworkQuantity from '@/views/charts2/charts/npm/NpmNetworkQuantity'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockData } from './mockData/NpmNetworkQuantity'

const notDrillDownData = mockData.common.notDrillDown // 未下钻数据
const drillDownData = mockData.common.drillDown // 下钻数据
const emptyData = mockData.empty.data // 空数据
const query = mockData.common.query

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}

let wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * @param type
 * @param data
 * @param empty
 */
function axiosPostAndMounted (type, data, empty) {
  if (type === 'drillDown') {
    require('vue-router').useRoute.mockReturnValue({ query: query })
    if (empty) {
      axios.get.mockResolvedValueOnce(emptyData)
      axios.get.mockResolvedValueOnce(emptyData)
    } else {
      axios.get.mockResolvedValueOnce(data.data1)
      axios.get.mockResolvedValueOnce(data.data2)
    }
  } else {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    if (empty) {
      for (let i = 0; i < 10; i++) {
        axios.get.mockResolvedValue(emptyData)
      }
    } else {
      axios.get.mockResolvedValueOnce(data.data1.tcp0)
      axios.get.mockResolvedValueOnce(data.data1.http0)
      axios.get.mockResolvedValueOnce(data.data1.ssl0)
      axios.get.mockResolvedValueOnce(data.data1.tcpPercent0)
      axios.get.mockResolvedValueOnce(data.data1.packetPercent0)

      axios.get.mockResolvedValueOnce(data.data2.tcp1)
      axios.get.mockResolvedValueOnce(data.data2.http1)
      axios.get.mockResolvedValueOnce(data.data2.ssl1)
      axios.get.mockResolvedValueOnce(data.data2.tcpPercent1)
      axios.get.mockResolvedValueOnce(data.data2.packetPercent1)
    }
  }

  wrapper = mount(NpmNetworkQuantity, {
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/npm/NpmNetworkQuantity.vue测试', () => {
  test('Npm概况信息：服务质量图 下钻', async () => {
    axiosPostAndMounted('drillDown', {
      data1: drillDownData.data1,
      data2: drillDownData.data2
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('130 ms')
      expect(textNode1.text()).toEqual('598 ms')
      expect(textNode2.text()).toEqual('1 ms')
      expect(textNode3.text()).toEqual('1.08 %')
      expect(textNode4.text()).toEqual('3.79 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      /*
       * 当元素存在的时候，find 和 get 是一样的；
       * 当找不到元素的时候:
       *    (1) find 会返回 null, 不会报错，case 通过
       *    (2) get 会报错，case 失败
       * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
       */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')

      expect(trendIconNode0.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2.classes()).toContain('cn-icon-constant')
      expect(trendIconNode3.classes()).toContain('cn-icon-decline')
      expect(trendIconNode4.classes()).toContain('cn-icon-rise1')

      const trendValueNode0 = wrapper.get('[test-id="singleValueTrendValue0"]')
      const trendValueNode1 = wrapper.get('[test-id="singleValueTrendValue1"]')
      const trendValueNode2 = wrapper.find('[test-id="singleValueTrendValue2"]')
      const trendValueNode3 = wrapper.get('[test-id="singleValueTrendValue3"]')
      const trendValueNode4 = wrapper.find('[test-id="singleValueTrendValue4"]')

      expect(trendValueNode0.text()).toEqual('51.22%')
      expect(trendValueNode1.text()).toEqual('91.99%')
      expect(trendValueNode2 === null)
      expect(trendValueNode3.text()).toEqual('-26.53%')
      expect(trendValueNode4.text()).toEqual('6.16%')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95: 445 ms')
      expect(p95Node1.text()).toEqual('P95: 2.95 s')
      expect(p95Node2.text()).toEqual('P95: <1 ms')
      expect(p95Node3.text()).toEqual('P95: 3.46 %')
      expect(p95Node4.text()).toEqual('P95: 10.47 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99: 601 ms')
      expect(p99Node1.text()).toEqual('P99: 4.62 s')
      expect(p99Node2.text()).toEqual('P99: <1 ms')
      expect(p99Node3.text()).toEqual('P99: 13.72 %')
      expect(p99Node4.text()).toEqual('P99: 18.30 %')
      resolve()
    }, 400))
  })
  test('Npm概况信息：服务质量图 未下钻', async () => {
    axiosPostAndMounted('', {
      data1: notDrillDownData.cycle0,
      data2: notDrillDownData.cycle1
    })

    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('92 ms')
      expect(textNode1.text()).toEqual('193 ms')
      expect(textNode2.text()).toEqual('1 ms')
      expect(textNode3.text()).toEqual('1.56 %')
      expect(textNode4.text()).toEqual('3.82 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      // /*
      //  * 当元素存在的时候，find 和 get 是一样的；
      //  * 当找不到元素的时候:
      //  *    (1) find 会返回 null, 不会报错，case 通过
      //  *    (2) get 会报错，case 失败
      //  * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
      //  */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')
      //
      expect(trendIconNode0.classes()).toContain('cn-icon-decline')
      expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2.classes()).toContain('cn-icon-constant')
      expect(trendIconNode3.classes()).toContain('cn-icon-decline')
      expect(trendIconNode4.classes()).toContain('cn-icon-decline')

      const trendValueNode0 = wrapper.get('[test-id="singleValueTrendValue0"]')
      const trendValueNode1 = wrapper.get('[test-id="singleValueTrendValue1"]')
      const trendValueNode2 = wrapper.find('[test-id="singleValueTrendValue2"]')
      const trendValueNode3 = wrapper.get('[test-id="singleValueTrendValue3"]')
      const trendValueNode4 = wrapper.find('[test-id="singleValueTrendValue4"]')

      expect(trendValueNode0.text()).toEqual('-4.17%')
      expect(trendValueNode1.text()).toEqual('4.89%')
      expect(trendValueNode2 === null)
      expect(trendValueNode3.text()).toEqual('-39.53%')
      expect(trendValueNode4.text()).toEqual('-8.83%')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95: 160 ms')
      expect(p95Node1.text()).toEqual('P95: 266 ms')
      expect(p95Node2.text()).toEqual('P95: <1 ms')
      expect(p95Node3.text()).toEqual('P95: 2.23 %')
      expect(p95Node4.text()).toEqual('P95: 6.60 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99: 789 ms')
      expect(p99Node1.text()).toEqual('P99: 2.09 s')
      expect(p99Node2.text()).toEqual('P99: <1 ms')
      expect(p99Node3.text()).toEqual('P99: 21.87 %')
      expect(p99Node4.text()).toEqual('P99: 9.26 %')
      resolve()
    }, 300))
  })
  test('Npm概况信息：服务质量图 下钻无数据', async () => {
    axiosPostAndMounted('drillDown', '', 'empty1')

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('-')
      expect(textNode1.text()).toEqual('-')
      expect(textNode2.text()).toEqual('-')
      expect(textNode3.text()).toEqual('-')
      expect(textNode4.text()).toEqual('-')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95: -')
      expect(p95Node1.text()).toEqual('P95: -')
      expect(p95Node2.text()).toEqual('P95: -')
      expect(p95Node3.text()).toEqual('P95: -')
      expect(p95Node4.text()).toEqual('P95: -')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99: -')
      expect(p99Node1.text()).toEqual('P99: -')
      expect(p99Node2.text()).toEqual('P99: -')
      expect(p99Node3.text()).toEqual('P99: -')
      expect(p99Node4.text()).toEqual('P99: -')
      resolve()
    }, 500))
  })
  test('Npm概况信息：服务质量图 未下钻无数据', async () => {
    axiosPostAndMounted('', '', 'empty')

    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('-')
      expect(textNode1.text()).toEqual('-')
      expect(textNode2.text()).toEqual('-')
      expect(textNode3.text()).toEqual('-')
      expect(textNode4.text()).toEqual('-')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95: -')
      expect(p95Node1.text()).toEqual('P95: -')
      expect(p95Node2.text()).toEqual('P95: -')
      expect(p95Node3.text()).toEqual('P95: -')
      expect(p95Node4.text()).toEqual('P95: -')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99: -')
      expect(p99Node1.text()).toEqual('P99: -')
      expect(p99Node2.text()).toEqual('P99: -')
      expect(p99Node3.text()).toEqual('P99: -')
      expect(p99Node4.text()).toEqual('P99: -')
      resolve()
    }, 300))
  })
  test('Npm概况信息：服务质量图 下钻数据为0或极大值', async () => {
    axiosPostAndMounted('drillDown', {
      data1: mockData.boundary.drillDown.data1,
      data2: mockData.boundary.drillDown.data2
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('3.63 h')
      expect(textNode1.text()).toEqual('1.66 h')
      expect(textNode2.text()).toEqual('2.78 h')
      expect(textNode3.text()).toEqual('10800.00 %')
      expect(textNode4.text()).toEqual('37900.00 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      // const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      /*
       * 当元素存在的时候，find 和 get 是一样的；
       * 当找不到元素的时候:
       *    (1) find 会返回 null, 不会报错，case 通过
       *    (2) get 会报错，case 失败
       * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
       */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')

      expect(trendIconNode0.classes()).toContain('cn-icon-rise1')
      // expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode3.classes()).toContain('cn-icon-decline')
      expect(trendIconNode4.classes()).toContain('cn-icon-rise1')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95: <1 ms')
      expect(p95Node1.text()).toEqual('P95: 4.92 m')
      expect(p95Node2.text()).toEqual('P95: 10.00 s')
      expect(p95Node3.text()).toEqual('P95: 3.46 %')
      expect(p95Node4.text()).toEqual('P95: 10.47 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99: <1 ms')
      expect(p99Node1.text()).toEqual('P99: 7.70 m')
      expect(p99Node2.text()).toEqual('P99: 10.00 s')
      expect(p99Node3.text()).toEqual('P99: 13.72 %')
      expect(p99Node4.text()).toEqual('P99: 18.30 %')
      resolve()
    }, 500))
  })
})
