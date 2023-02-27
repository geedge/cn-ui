import linkBlock from '@/views/charts2/charts/linkMonitor/LinkBlock'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockData, linkInfoData } from './MockData/LinkBlock'

const mockGet1 = mockData.common.data1
const mockGet2 = mockData.common.data2

const linkInfo = JSON.stringify(linkInfoData)
const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}

var wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 *
 */
function axiosPostAndMounted (list1, list2) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })

  const data1 = list1 || mockGet1
  const data2 = list2 || mockGet2
  // 模拟axios返回数据
  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/link/overview/analysis':
        return Promise.resolve(data1)
      case '/interface/link/overview/nextHopAnalysis':
        return Promise.resolve(data2)
    }
  })

  // 模拟localStorage获取数据
  // eslint-disable-next-line no-proto
  jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(() => linkInfo)

  // 加载vue组件，获得实例
  wrapper = mount(linkBlock, {
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/linkMonitor/LinkBlock.vue测试', () => {
  test('测试链路蜂窝图和下一跳蜂窝图从大到小排列', async () => {
    axiosPostAndMounted()

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(() => {
      const linkBlockTotal0 = wrapper.get('[test-id="linkBlockTotal0"]')
      const linkBlockTotal1 = wrapper.get('[test-id="linkBlockTotal1"]')
      const linkBlockTotal2 = wrapper.get('[test-id="linkBlockTotal2"]')
      const linkBlockTotal3 = wrapper.get('[test-id="linkBlockTotal3"]')
      const linkBlockTotal4 = wrapper.get('[test-id="linkBlockTotal4"]')
      const linkBlockTotal5 = wrapper.get('[test-id="linkBlockTotal5"]')
      const linkBlockTotal6 = wrapper.get('[test-id="linkBlockTotal6"]')
      const linkBlockTotal7 = wrapper.get('[test-id="linkBlockTotal7"]')
      const linkBlockTotal8 = wrapper.get('[test-id="linkBlockTotal8"]')
      const linkBlockTotal9 = wrapper.get('[test-id="linkBlockTotal9"]')

      expect(linkBlockTotal0.text()).toBe('13.88 Mbps')
      expect(linkBlockTotal1.text()).toBe('11.99 Mbps')
      expect(linkBlockTotal2.text()).toBe('11.86 Mbps')
      expect(linkBlockTotal3.text()).toBe('10.56 Mbps')
      expect(linkBlockTotal4.text()).toBe('10.49 Mbps')
      expect(linkBlockTotal5.text()).toBe('10.31 Mbps')
      expect(linkBlockTotal6.text()).toBe('10.19 Mbps')
      expect(linkBlockTotal7.text()).toBe('10.14 Mbps')
      expect(linkBlockTotal8.text()).toBe('9.85 Mbps')
      expect(linkBlockTotal9.text()).toBe('9.54 Mbps')

      const nextHopTotal0 = wrapper.get('[test-id="nextHopTotal0"]')
      const nextHopTotal1 = wrapper.get('[test-id="nextHopTotal1"]')
      const nextHopTotal2 = wrapper.get('[test-id="nextHopTotal2"]')

      expect(nextHopTotal0.text()).toBe('67.97 Mbps')
      expect(nextHopTotal1.text()).toBe('30.35 Mbps')
      expect(nextHopTotal2.text()).toBe('10.49 Mbps')
      resolve()
    }, 200))
  })
  test('链路蜂窝图和下一跳蜂窝图均无数据', async () => {
    const list1 = mockData.empty.data1
    const list2 = mockData.empty.data2

    axiosPostAndMounted(list1, list2)

    await new Promise(resolve => setTimeout(() => {
      const linkBlockNoData = wrapper.get('[test-id="linkBlockNoData"]')
      const nextHpNoData = wrapper.get('[test-id="nextHpNoData"]')

      expect(linkBlockNoData.text()).toBe('npm.noData')
      expect(nextHpNoData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
  test('链路蜂窝图上行流量大数值', async () => {
    const list1 = mockData.boundary.data1

    axiosPostAndMounted(list1)

    await new Promise(resolve => setTimeout(() => {
      const linkBlockTotal0 = wrapper.get('[test-id="linkBlockTotal0"]')
      const linkBlockEgressUsage0 = wrapper.get('[test-id="linkBlockEgressUsage0"]')
      const linkBlockEgressUsage1 = wrapper.get('[test-id="linkBlockEgressUsage1"]')
      const linkBlockEgressUsage2 = wrapper.get('[test-id="linkBlockEgressUsage2"]')
      const linkBlockEgressUsage3 = wrapper.get('[test-id="linkBlockEgressUsage3"]')
      const linkBlockEgressUsage4 = wrapper.get('[test-id="linkBlockEgressUsage4"]')
      const linkBlockEgressUsage5 = wrapper.get('[test-id="linkBlockEgressUsage5"]')
      const linkBlockEgressUsage6 = wrapper.get('[test-id="linkBlockEgressUsage6"]')
      const linkBlockEgressUsage7 = wrapper.get('[test-id="linkBlockEgressUsage7"]')
      const linkBlockEgressUsage8 = wrapper.get('[test-id="linkBlockEgressUsage8"]')
      const linkBlockEgressUsage9 = wrapper.get('[test-id="linkBlockEgressUsage9"]')

      // 超大流量时total显示
      expect(linkBlockTotal0.text()).toBe('100 Gbps')
      // 超大上行流量，上行占比情况
      expect(linkBlockEgressUsage0.text()).toBe('100.00%')
      expect(linkBlockEgressUsage1.text()).toBe('100.00%')
      expect(linkBlockEgressUsage2.text()).toBe('100.00%')
      expect(linkBlockEgressUsage3.text()).toBe('100.00%')
      expect(linkBlockEgressUsage4.text()).toBe('100.00%')
      expect(linkBlockEgressUsage5.text()).toBe('100.00%')
      expect(linkBlockEgressUsage6.text()).toBe('100.00%')
      expect(linkBlockEgressUsage7.text()).toBe('100.00%')
      expect(linkBlockEgressUsage8.text()).toBe('100.00%')
      expect(linkBlockEgressUsage9.text()).toBe('100.00%')
      resolve()
    }, 200))
  })
  test('下一跳蜂窝图下行流量大数值', async () => {
    const list1 = mockData.common.data1
    const list2 = mockData.boundary.data2

    axiosPostAndMounted(list1, list2)

    await new Promise(resolve => setTimeout(() => {
      const nextHopTotal0 = wrapper.get('[test-id="nextHopTotal0"]')
      const nextHopIngressUsage0 = wrapper.get('[test-id="nextHopIngressUsage0"]')
      const nextHopIngressUsage1 = wrapper.get('[test-id="nextHopIngressUsage1"]')
      const nextHopIngressUsage2 = wrapper.get('[test-id="nextHopIngressUsage2"]')
      const nextHopEgressUsage0 = wrapper.get('[test-id="nextHopEgressUsage0"]')
      const nextHopEgressUsage1 = wrapper.get('[test-id="nextHopEgressUsage1"]')
      const nextHopEgressUsage2 = wrapper.get('[test-id="nextHopEgressUsage2"]')

      // 超大流量时total显示
      expect(nextHopTotal0.text()).toBe('30 Tbps')
      // 超大上行流量，上行、下行占比情况
      expect(nextHopEgressUsage0.text()).toBe('0%')
      expect(nextHopEgressUsage1.text()).toBe('0%')
      expect(nextHopEgressUsage2.text()).toBe('0%')
      expect(nextHopIngressUsage0.text()).toBe('100.00%')
      expect(nextHopIngressUsage1.text()).toBe('100.00%')
      expect(nextHopIngressUsage2.text()).toBe('100.00%')
      resolve()
    }, 200))
  })
})
