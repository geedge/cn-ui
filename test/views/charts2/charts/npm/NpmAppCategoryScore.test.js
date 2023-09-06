import NpmAppCategoryScore from '@/views/charts2/charts/npm/NpmAppCategoryScore'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'
import { mockData } from './mockData/NpmAppCategoryScore'

const mockGet1 = mockData.common.data1
const mockGet2 = mockData.common.data2
const mockGet3 = mockData.common
delete mockGet3.data1
delete mockGet3.data2

let wrapper = null

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}

/**
 * 进行axios请求，并挂载vue实例
 * @param list1
 * @param list2
 * @param list3
 */
function axiosPostAndMounted (list1, list2, list3) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })

  const data1 = list1 || mockGet1
  const data2 = list2 || mockGet2
  const data3 = list3 || mockGet3
  axios.get.mockResolvedValueOnce(data1)
  axios.get.mockResolvedValueOnce(data2)

  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/application/performance/overview/appTcpSessionDelay':
        return Promise.resolve(data3.data3)
      case '/interface/application/performance/overview/appHttpResponseDelay':
        return Promise.resolve(data3.data4)
      case '/interface/application/performance/overview/appSslConDelay':
        return Promise.resolve(data3.data5)
      case '/interface/application/performance/overview/appTcpLostlenPercent':
        return Promise.resolve(data3.data6)
      case '/interface/application/performance/overview/appPacketRetransPercent':
        return Promise.resolve(data3.data7)
    }
  })

  // 加载vue组件，获得实例
  wrapper = mount(NpmAppCategoryScore, {
    global: {
      plugins: [ElementPlus]
    },
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/npm/NpmAppCategoryScore.vue测试', () => {
  test('NpmAppCategoryScore测试score列分数显示', async () => {
    // 调用axios请求，并加载实例
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的分数列
      const textNode0 = wrapper.find('[test-id="score-gaming"]')
      const textNode1 = wrapper.find('[test-id="score-email"]')
      const textNode2 = wrapper.find('[test-id="score-file-sharing"]')
      // const textNode3 = wrapper.find('[test-id="score-voip-video"]')
      const textNode4 = wrapper.find('[test-id="score-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="score-social-networking"]')

      expect(textNode0.text()).toBe('6')
      expect(textNode1.text()).toBe('-')
      expect(textNode2.text()).toBe('5')
      // expect(textNode3.text()).toBe('6')
      expect(textNode4.text()).toBe('5')
      expect(textNode5.text()).toBe('6')
      resolve()
    }, 200))
  })
  test('NpmAppCategoryScore测试分类不足6个时icon的class类名是否正确', async () => {
    // 模拟分类不足6个的情况
    const obj = JSON.parse(JSON.stringify(mockGet1))
    obj.data.data.result.splice(5, 1)

    // 调用axios请求，并加载实例
    axiosPostAndMounted(obj)

    await new Promise(resolve => setTimeout(() => {
      const iconNode0 = wrapper.find('[test-id="iconContent0"]')
      const iconNode1 = wrapper.find('[test-id="iconContent1"]')
      const iconNode2 = wrapper.find('[test-id="iconContent2"]')
      const iconNode3 = wrapper.find('[test-id="iconContent3"]')
      // const iconNode4 = wrapper.find('[test-id="iconContent4"]')
      // const iconNode5 = wrapper.find('[test-id="iconContent5"]')

      expect(iconNode0.classes()).toContain('cn-icon-gaming')
      expect(iconNode1.classes()).toContain('cn-icon-email')
      expect(iconNode2.classes()).toContain('cn-icon-file-sharing')
      expect(iconNode3.classes()).toContain('cn-icon-video')
      // expect(iconNode3.classes()).toContain('cn-icon-voip')
      // expect(iconNode4.classes()).toContain('cn-icon-video')
      // expect(iconNode5.classes()).toContain('cn-icon-social-network')
      resolve()
    }, 200))
  })
  test('score列的File Sharing和video，值为null', async () => {
    // 调用axios请求，并加载实例
    const data3 = mockData.score
    axiosPostAndMounted(mockGet1, mockGet2, data3)

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的分数列
      const textNode0 = wrapper.find('[test-id="score-gaming"]')
      const textNode1 = wrapper.find('[test-id="score-email"]')
      const textNode2 = wrapper.find('[test-id="score-file-sharing"]')
      // const textNode3 = wrapper.find('[test-id="score-voip-video"]')
      const textNode4 = wrapper.find('[test-id="score-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="score-social-networking"]')

      expect(textNode0.text()).toBe('6')
      expect(textNode1.text()).toBe('6')
      expect(textNode2.text()).toBe('6')
      // expect(textNode3.text()).toBe('-')
      expect(textNode4.text()).toBe('5')
      expect(textNode5.text()).toBe('3')
      resolve()
    }, 200))
  })
  test('NpmAppCategoryScore测试Inound列大数值', async () => {
    const data = mockData.boundary.large.data1

    axiosPostAndMounted(data)

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的inbound列
      const textNode0 = wrapper.find('[test-id="inbound-gaming"]')
      const textNode1 = wrapper.find('[test-id="inbound-email"]')
      const textNode2 = wrapper.find('[test-id="inbound-file-sharing"]')
      // const textNode3 = wrapper.find('[test-id="inbound-voip-video"]')
      const textNode4 = wrapper.find('[test-id="inbound-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="inbound-social-networking"]')

      expect(textNode0.text()).toBe('>500.00%')
      expect(textNode1.text()).toBe('>500.00%')
      expect(textNode2.text()).toBe('>500.00%')
      // expect(textNode3.text()).toBe('>500.00%')
      expect(textNode4.text()).toBe('>500.00%')
      expect(textNode5.text()).toBe('>500.00%')
      resolve()
    }, 200))
  })
  test('NpmAppCategoryScore测试Inound列无数据', async () => {
    const data1 = mockData.boundary.zero.data1

    // 调用axios请求，并加载实例
    axiosPostAndMounted(data1)

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的inbound列
      const textNode0 = wrapper.find('[test-id="inbound-packet-gaming"]')
      const textNode1 = wrapper.find('[test-id="inbound-packet-email"]')
      const textNode2 = wrapper.find('[test-id="inbound-packet-file-sharing"]')
      // const textNode3 = wrapper.find('[test-id="inbound-packet-voip-video"]')
      const textNode4 = wrapper.find('[test-id="inbound-packet-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="inbound-packet-social-networking"]')

      expect(textNode0.text()).toBe('<0.01 bps')
      expect(textNode1.text()).toBe('<0.01 bps')
      expect(textNode2.text()).toBe('<0.01 bps')
      // expect(textNode3.text()).toBe('<0.01 bps')
      expect(textNode4.text()).toBe('<0.01 bps')
      expect(textNode5.text()).toBe('<0.01 bps')
      resolve()
    }, 200))
  })
})
