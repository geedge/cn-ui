import LinkTrafficLine from '@/views/charts2/charts/linkMonitor/LinkTrafficLine'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockData } from './MockData/LinkTrafficLine'
import { linkInfoData } from './MockData/LinkBlock'

const mockGet = mockData.common.data1
const mockGet1 = mockData.common.data2

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000,
  endTime: 1673247600
}

const linkInfo = JSON.stringify(linkInfoData)

const query1 = { t: '1675395023486', thirdPanel: '15', thirdMenu: 'Link ID: Hundredgige10', panelName: 'Link ID: Hundredgige10', queryCondition: 'common_egress_link_id = 1792 or common_ingress_link_id = 1793', curTab: 'ip', startTime: 1675391498, endTime: 1675395098, range: 60 }
const query2 = { t: '1675409029937', thirdPanel: '15', thirdMenu: 'Link ID: Hundredgige10', panelName: 'Link ID: Hundredgige10', queryCondition: 'common_egress_link_id = 2816 or common_ingress_link_id = 2817', curTab: 'ip', startTime: 1675388605, endTime: 1675410205, range: 360, lineMetric: 'Bits/s' }
const query3 = { t: '1675409029937', thirdPanel: '15', thirdMenu: 'Link ID: Hundredgige10', panelName: 'Link ID: Hundredgige10', queryCondition: 'common_egress_link_id = 2816 or common_ingress_link_id = 2817', curTab: 'ip', startTime: 1675388605, endTime: 1675410205, range: 360, lineMetric: 'Packets/s' }

let wrapper = null
/**
 * 进行axios请求，并挂载vue实例
 * 模拟localStorage获取数据
 * @param query
 * @param data1
 * @param data2
 */
function axiosPostAndMounted (query, data1, data2) {
  require('vue-router').useRoute.mockReturnValue({ query: query })
  const _data1 = data1 || mockGet
  const _data2 = data2 || mockGet1
  // 模拟 axios 数据
  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/link/overview/drilldown/totalTrafficAnalysis':
        return Promise.resolve(_data1)
      case '/interface/link/overview/drilldown/networkAnalysis':
        return Promise.resolve(_data2)
    }
  })
  // 模拟localStorage获取数据
  // eslint-disable-next-line no-proto
  jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(() => linkInfo)
  // 加载vue组件，获得实例
  wrapper = mount(LinkTrafficLine, {
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/linkMonitor/LinkTrafficLine.vue测试', () => {
  test('左侧列表信息：link下钻折线图 ', async () => {
    axiosPostAndMounted(query1)
    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="line-tabContent"]')
      const textNode1 = wrapper.get('[test-id="line-percent"]')
      const textNode2 = wrapper.get('[test-id="line-score"]')
      const textNode3 = wrapper.get('[test-id="line-tcp"]')
      const textNode4 = wrapper.get('[test-id="line-http"]')
      const textNode5 = wrapper.get('[test-id="line-ssl"]')
      const textNode6 = wrapper.get('[test-id="line-packetLoss"]')
      const textNode7 = wrapper.get('[test-id="line-packetRetrans"]')

      expect(textNode0.text()).toEqual('756.87Kbps')
      expect(textNode1.text()).toEqual('0%')
      expect(textNode2.text()).toEqual('5')
      expect(textNode3.text()).toEqual('92ms')
      expect(textNode4.text()).toEqual('154ms')
      expect(textNode5.text()).toEqual('0ms')
      expect(textNode6.text()).toEqual('0.69%')
      expect(textNode7.text()).toEqual('1.65%')
      resolve()
    }, 200))
  })
  test('Metric=Bits/s, tab点击第二个高亮：link下钻折线图 ', async () => {
    axiosPostAndMounted(query2)

    const textNode3 = await wrapper.get('[test-id="tab-1"]')
    await textNode3.trigger('click')
    expect(textNode3.classes()).toContain('is-active')

    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')

    await new Promise(resolve => setTimeout(() => {
      expect(textNode0.text()).toEqual('756.87Kbps')
      expect(textNode1.text()).toEqual('10.58Mbps')
      expect(textNode2.text()).toEqual('9.82Mbps')
      resolve()
    }, 200))
  })
  test('Metric=Packets/s：link下钻折线图 ', async () => {
    axiosPostAndMounted(query3)
    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')

    await new Promise(resolve => setTimeout(() => {
      expect(textNode0.text()).toEqual('72.72packets/s')
      expect(textNode1.text()).toEqual('904.03packets/s')
      expect(textNode2.text()).toEqual('976.75packets/s')
      resolve()
    }, 200))
  })
  test('左侧列表信息：link下钻折线图 大数值 ', async () => {
    const data1 = mockData.boundary.large.data1
    const data2 = mockData.boundary.large.data2

    axiosPostAndMounted(query1, data1, data2)
    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="line-tabContent"]')
      const textNode1 = wrapper.get('[test-id="line-percent"]')
      const textNode2 = wrapper.get('[test-id="line-score"]')
      const textNode3 = wrapper.get('[test-id="line-tcp"]')
      const textNode4 = wrapper.get('[test-id="line-http"]')
      const textNode5 = wrapper.get('[test-id="line-ssl"]')
      const textNode6 = wrapper.get('[test-id="line-packetLoss"]')
      const textNode7 = wrapper.get('[test-id="line-packetRetrans"]')

      expect(textNode0.text()).toEqual('75.69Tbps')
      expect(textNode1.text()).toEqual('37843.52%')
      expect(textNode2.text()).toEqual('1')
      expect(textNode3.text()).toEqual('9.29s')
      expect(textNode4.text()).toEqual('154ms')
      expect(textNode5.text()).toEqual('90ms')
      expect(textNode6.text()).toEqual('69.00%')
      expect(textNode7.text()).toEqual('16.50%')
      resolve()
    }, 200))
  })
  test('Metric=Packets/s：无数据', async () => {
    const data1 = mockData.empty.data1
    const data2 = mockData.empty.data2
    axiosPostAndMounted(query3, data1, data2)

    await new Promise(resolve => setTimeout(() => {
      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
  test('Metric=Packets/s：大数值', async () => {
    const data = mockData.boundary.large.data1
    axiosPostAndMounted(query3, data)
    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')

    await new Promise(resolve => setTimeout(() => {
      expect(textNode0.text()).toEqual('727.20Mpackets/s')
      expect(textNode1.text()).toEqual('904.03Gpackets/s')
      expect(textNode2.text()).toEqual('976.75Gpackets/s')
      resolve()
    }, 200))
  })
  test('Metric=Bits/s：数值为0', async () => {
    const data = mockData.boundary.zero.data1
    axiosPostAndMounted(query2, data)
    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')

    await new Promise(resolve => setTimeout(() => {
      expect(textNode0.text()).toEqual('<0.01bps')
      expect(textNode1.text()).toEqual('<0.01bps')
      expect(textNode2.text()).toEqual('<0.01bps')
      resolve()
    }, 200))
  })
})
