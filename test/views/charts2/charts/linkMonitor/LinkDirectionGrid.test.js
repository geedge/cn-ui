import LinkDirectionGrid from '@/views/charts2/charts/linkMonitor/LinkDirectionGrid'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import { mockGet1, mockGet2, linkInfoData } from './LinkDirectionGridData'

const linkInfo = JSON.stringify(linkInfoData)
const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}

var wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * @param list1
 * @param list2
 */
function axiosPostAndMounted (list1, list2) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })

  const data1 = list1 || mockGet1
  const data2 = list2 || mockGet2
  // 模拟axios返回数据
  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/link/overview/bigramAnalysis':
        return Promise.resolve(data1)
      case '/interface/link/overview/bigramNextHopAnalysis':
        return Promise.resolve(data2)
    }
  })

  // 模拟localStorage获取数据
  jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(key => linkInfo)

  // 加载vue组件，获得实例
  wrapper = mount(LinkDirectionGrid, {
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/linkMonitor/LinkBlock.vue测试', () => {
  test('鼠标移动到链路网格图第5行第3列，下一跳网格图第3行第1列，测试界面内容', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      /**
       * 此为左侧链路网格图dom
       */
      const fromLinkId5 = wrapper.find('[test-id="fromLinkId5"]')
      const toLinkId3 = wrapper.find('[test-id="toLinkId3"]')
      // 出入流量占比dom，egressUsage10-5-3，10-5-3表示，10行10列的左侧网格图第5行第3列的上行流量
      const egressUsage1053 = wrapper.find('[test-id="egressUsage10-5-3"]')
      const ingressUsage1053 = wrapper.find('[test-id="ingressUsage10-5-3"]')
      // 总流量
      const totalBitsRate1053 = wrapper.find('[test-id="totalBitsRate10-5-3"]')
      // 评分
      const score1053 = wrapper.find('[test-id="score10-5-3"]')
      // TCP连接建立延迟
      const tcp1053 = wrapper.find('[test-id="tcp10-5-3"]')
      // HTTP响应延迟
      const http1053 = wrapper.find('[test-id="http10-5-3"]')
      // SSL响应延迟
      const ssl1053 = wrapper.find('[test-id="ssl10-5-3"]')
      // 数据包丢失
      const packetLoss1053 = wrapper.find('[test-id="packetLoss10-5-3"]')
      // 重传率
      const packetRetrans1053 = wrapper.find('[test-id="packetRetrans10-5-3"]')

      expect(fromLinkId5.text()).toBe('Hundredgige5')
      expect(toLinkId3.text()).toBe('Hundredgige3')
      expect(egressUsage1053.text()).toBe('< 0.01%')
      expect(ingressUsage1053.text()).toBe('< 0.01%')
      expect(totalBitsRate1053.text()).toBe('576.94Kbps')
      expect(score1053.text()).toBe('6')
      expect(tcp1053.text()).toBe('83ms')
      expect(http1053.text()).toBe('107ms')
      expect(ssl1053.text()).toBe('0ms')
      expect(packetLoss1053.text()).toBe('0.38%')
      expect(packetRetrans1053.text()).toBe('0.91%')

      /**
       * 此为右侧下一跳网络网格图dom
       */
      const toNextHop3 = wrapper.find('[test-id="toNextHop3"]')
      const toNextHop1 = wrapper.find('[test-id="toNextHop1"]')
      // 出入流量占比dom，egressUsage3-3-1，3-3-1表示，3行3列的右侧网格图第3行第1列的上行流量
      const egressUsage331 = wrapper.find('[test-id="egressUsage3-3-1"]')
      const ingressUsage331 = wrapper.find('[test-id="ingressUsage3-3-1"]')
      // 总流量
      const totalBitsRate331 = wrapper.find('[test-id="totalBitsRate3-3-1"]')
      // 评分
      const score331 = wrapper.find('[test-id="score3-3-1"]')
      // TCP连接建立延迟
      const tcp331 = wrapper.find('[test-id="tcp3-3-1"]')
      // HTTP响应延迟
      const http331 = wrapper.find('[test-id="http3-3-1"]')
      // SSL响应延迟
      const ssl331 = wrapper.find('[test-id="ssl3-3-1"]')
      // 数据包丢失
      const packetLoss331 = wrapper.find('[test-id="packetLoss3-3-1"]')
      // 重传率
      const packetRetrans331 = wrapper.find('[test-id="packetRetrans3-3-1"]')

      expect(toNextHop3.text()).toBe('西宁')
      expect(toNextHop1.text()).toBe('太原')
      expect(egressUsage331.text()).toBe('< 0.01%')
      expect(ingressUsage331.text()).toBe('< 0.01%')
      expect(totalBitsRate331.text()).toBe('6.50Mbps')
      expect(score331.text()).toBe('5')
      expect(tcp331.text()).toBe('89ms')
      expect(http331.text()).toBe('151ms')
      expect(ssl331.text()).toBe('0ms')
      expect(packetLoss331.text()).toBe('0.53%')
      expect(packetRetrans331.text()).toBe('2.24%')
      resolve()
    }, 200))
  })
  test('鼠标移动到链路网格图第5行第3列，下一跳网格图第3行第1列，测试total和上下行流量占比', async () => {
    const list1 = JSON.parse(JSON.stringify(mockGet1))
    const list2 = JSON.parse(JSON.stringify(mockGet2))
    // 5行3列的位置顺序为1053，因为数组index从0开始，在数组中键值即为43
    // totalBitsRate原为576935.76，即576.94Kbps，修改后为57.69Mbps
    list1.data.data.result[43].totalBitsRate = 57693576
    list1.data.data.result[43].egressBitsRate = 100000000000
    list1.data.data.result[43].ingressBitsRate = 0

    // 下一跳是3行3列，所以3行1列位置是7，键值为6
    list2.data.data.result[6].totalBitsRate = 87726000
    list2.data.data.result[6].egressBitsRate = 0
    list2.data.data.result[6].ingressBitsRate = 100000000000
    axiosPostAndMounted(list1, list2)

    await new Promise(resolve => setTimeout(() => {
      /**
       * 此为左侧链路网格图dom
       */
      // 出入流量占比dom，egressUsage10-5-3，表示第5行第3列的上行流量
      const egressUsage1053 = wrapper.get('[test-id="egressUsage10-5-3"]')
      const ingressUsage1053 = wrapper.get('[test-id="ingressUsage10-5-3"]')
      // 总流量
      const totalBitsRate1053 = wrapper.get('[test-id="totalBitsRate10-5-3"]')
      // 评分
      const score1053 = wrapper.get('[test-id="score10-5-3"]')

      expect(egressUsage1053.text()).toBe('100.00%')
      expect(ingressUsage1053.text()).toBe('0%')
      expect(totalBitsRate1053.text()).toBe('57.69Mbps')
      expect(score1053.text()).toBe('6')

      /**
       * 此为右侧下一跳网络网格图dom
       */
      const egressUsage331 = wrapper.find('[test-id="egressUsage3-3-1"]')
      const ingressUsage331 = wrapper.find('[test-id="ingressUsage3-3-1"]')
      // 总流量
      const totalBitsRate331 = wrapper.find('[test-id="totalBitsRate3-3-1"]')
      // 评分
      const score331 = wrapper.find('[test-id="score3-3-1"]')

      expect(egressUsage331.text()).toBe('0%')
      expect(ingressUsage331.text()).toBe('100.00%')
      expect(totalBitsRate331.text()).toBe('87.73Mbps')
      expect(score331.text()).toBe('5')
      resolve()
    }, 200))
  })
})
