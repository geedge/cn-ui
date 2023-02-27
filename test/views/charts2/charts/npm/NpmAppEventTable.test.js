import NpmAppEventTable from '@/views/charts2/charts/npm/NpmAppEventTable'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'
import { mockData } from './mockData/NpmAppEventByTable'

let wrapper = null
const mockGet = mockData.common.data

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675558657,
  endTime: 1675731457
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
  wrapper = mount(NpmAppEventTable, {
    global: {
      plugins: [ElementPlus]
    },
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/npm/NpmAppEventTable.vue测试', () => {
  test('Npm 事件：APP事件信息表格 严重程度色块验证', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      // critical
      const criticalArray = [1, 8]
      for (let index = 0; index < criticalArray.length; index++) {
        const rowIndex = criticalArray[index]
        for (let i = 1; i <= 5; i++) {
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
      }

      // high
      const highArray = [6]
      for (let index = 0; index < highArray.length; index++) {
        const rowIndex = highArray[index]
        for (let i = 1; i <= 4; i++) {
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for (let i = 5; i <= 5; i++) {
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // medium
      const mediumArray = [5, 7]
      for (let index = 0; index < mediumArray.length; index++) {
        const rowIndex = mediumArray[index]
        for (let i = 1; i <= 3; i++) {
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for (let i = 4; i <= 5; i++) {
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // low
      const lowArray = [2, 4]
      for (let index = 0; index < lowArray.length; index++) {
        const rowIndex = lowArray[index]
        for (let i = 1; i <= 2; i++) {
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for (let i = 3; i <= 5; i++) {
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // info
      const infoArray = [0, 3, 9]
      for (let index = 0; index < infoArray.length; index++) {
        const rowIndex = infoArray[index]
        for (let i = 1; i <= 1; i++) {
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for (let i = 2; i <= 5; i++) {
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue' + rowIndex + i + '"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }
      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(应用数据列)', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="appName0"]')
      const textNode1 = wrapper.find('[test-id="appName1"]')
      const textNode2 = wrapper.find('[test-id="appName2"]')
      const textNode3 = wrapper.find('[test-id="appName3"]')
      const textNode4 = wrapper.find('[test-id="appName4"]')
      const textNode5 = wrapper.find('[test-id="appName5"]')
      const textNode6 = wrapper.find('[test-id="appName6"]')
      const textNode7 = wrapper.find('[test-id="appName7"]')
      const textNode8 = wrapper.find('[test-id="appName8"]')
      const textNode9 = wrapper.find('[test-id="appName9"]')

      expect(textNode0.text()).toEqual('youku')
      expect(textNode1.text()).toEqual('uplive')
      expect(textNode2.text()).toEqual('youku')
      expect(textNode3.text()).toEqual('apple_hls')
      expect(textNode4.text()).toEqual('apple_hls')
      expect(textNode5.text()).toEqual('apple_hls')
      expect(textNode6.text()).toEqual('uplive')
      expect(textNode7.text()).toEqual('windows_update')
      expect(textNode8.text()).toEqual('apple_hls')
      expect(textNode9.text()).toEqual('cloudflare')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(严重程度数据列)', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="eventSeverity0"]')
      const textNode1 = wrapper.find('[test-id="eventSeverity1"]')
      const textNode2 = wrapper.find('[test-id="eventSeverity2"]')
      const textNode3 = wrapper.find('[test-id="eventSeverity3"]')
      const textNode4 = wrapper.find('[test-id="eventSeverity4"]')
      const textNode5 = wrapper.find('[test-id="eventSeverity5"]')
      const textNode6 = wrapper.find('[test-id="eventSeverity6"]')
      const textNode7 = wrapper.find('[test-id="eventSeverity7"]')
      const textNode8 = wrapper.find('[test-id="eventSeverity8"]')
      const textNode9 = wrapper.find('[test-id="eventSeverity9"]')

      expect(textNode0.text()).toEqual('info')
      expect(textNode1.text()).toEqual('critical')
      expect(textNode2.text()).toEqual('low')
      expect(textNode3.text()).toEqual('info')
      expect(textNode4.text()).toEqual('low')
      expect(textNode5.text()).toEqual('medium')
      expect(textNode6.text()).toEqual('high')
      expect(textNode7.text()).toEqual('medium')
      expect(textNode8.text()).toEqual('critical')
      expect(textNode9.text()).toEqual('info')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(事件类型数据列)', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="eventType0"]')
      const textNode1 = wrapper.find('[test-id="eventType1"]')
      const textNode2 = wrapper.find('[test-id="eventType2"]')
      const textNode3 = wrapper.find('[test-id="eventType3"]')
      const textNode4 = wrapper.find('[test-id="eventType4"]')
      const textNode5 = wrapper.find('[test-id="eventType5"]')
      const textNode6 = wrapper.find('[test-id="eventType6"]')
      const textNode7 = wrapper.find('[test-id="eventType7"]')
      const textNode8 = wrapper.find('[test-id="eventType8"]')
      const textNode9 = wrapper.find('[test-id="eventType9"]')

      expect(textNode0.text()).toEqual('http error')
      expect(textNode1.text()).toEqual('http error')
      expect(textNode2.text()).toEqual('http error')
      expect(textNode3.text()).toEqual('http error')
      expect(textNode4.text()).toEqual('http error')
      expect(textNode5.text()).toEqual('http error')
      expect(textNode6.text()).toEqual('http error')
      expect(textNode7.text()).toEqual('http error')
      expect(textNode8.text()).toEqual('http error')
      expect(textNode9.text()).toEqual('http error')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(事件数量数据列)', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="count0"]')
      const textNode1 = wrapper.find('[test-id="count1"]')
      const textNode2 = wrapper.find('[test-id="count2"]')
      const textNode3 = wrapper.find('[test-id="count3"]')
      const textNode4 = wrapper.find('[test-id="count4"]')
      const textNode5 = wrapper.find('[test-id="count5"]')
      const textNode6 = wrapper.find('[test-id="count6"]')
      const textNode7 = wrapper.find('[test-id="count7"]')
      const textNode8 = wrapper.find('[test-id="count8"]')
      const textNode9 = wrapper.find('[test-id="count9"]')

      expect(textNode0.text()).toEqual('6')
      expect(textNode1.text()).toEqual('5')
      expect(textNode2.text()).toEqual('4')
      expect(textNode3.text()).toEqual('3')
      expect(textNode4.text()).toEqual('3')
      expect(textNode5.text()).toEqual('2')
      expect(textNode6.text()).toEqual('2')
      expect(textNode7.text()).toEqual('2')
      expect(textNode8.text()).toEqual('1')
      expect(textNode9.text()).toEqual('1')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 无数据', async () => {
    axiosPostAndMounted(mockData.empty.data)

    await new Promise(resolve => setTimeout(() => {
      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
})
