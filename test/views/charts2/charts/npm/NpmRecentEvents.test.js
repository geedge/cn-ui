import NpmRecentEvents from '@/views/charts2/charts/npm/NpmRecentEvents'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'
import { mockData } from './mockData/NpmRecentEvents'

// 未下钻
const mockGet = mockData.common.data1
// 下钻
const mockGet1 = mockData.common.data2
const query = mockData.common.query

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}
let wrapper = null
/**
 * 进行axios请求，并挂载vue实例
 * @param data
 * @param query
 */
function axiosPostAndMounted (data, query) {
  const _query = query || {}
  require('vue-router').useRoute.mockReturnValue({ query: _query })
  const _data = data || mockGet
  axios.get.mockResolvedValue(_data)

  wrapper = mount(NpmRecentEvents, {
    propsData: {
      timeFilter
    },
    global: {
      plugins: [ElementPlus]
    }
  })
}

describe('views/charts2/charts/npm/NpmRecentEvents.vue测试', () => {
  test('npm events 近期事件表格 未下钻', async () => {
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      const severity0 = wrapper.get('[test-id="eventSeverity-critical-0"]')
      const severity1 = wrapper.get('[test-id="eventSeverity-high-1"]')
      const severity2 = wrapper.get('[test-id="eventSeverity-medium-2"]')
      const severity3 = wrapper.get('[test-id="eventSeverity-low-3"]')
      const severity4 = wrapper.get('[test-id="eventSeverity-info-4"]')
      const severity5 = wrapper.get('[test-id="eventSeverity-critical-5"]')

      expect(severity0.text()).toEqual('critical')
      expect(severity1.text()).toEqual('high')
      expect(severity2.text()).toEqual('medium')
      expect(severity3.text()).toEqual('low')
      expect(severity4.text()).toEqual('info')
      expect(severity5.text()).toEqual('critical')

      expect(severity0.classes()).toContain('critical')
      expect(severity1.classes()).toContain('high')
      expect(severity2.classes()).toContain('medium')
      expect(severity3.classes()).toContain('low')
      expect(severity4.classes()).toContain('info')
      expect(severity5.classes()).toContain('critical')

      const eventKey0 = wrapper.get('[test-id="eventKey-114.114.114.114-0"]')
      const eventKey1 = wrapper.get('[test-id="eventKey-116.178.78.241-1"]')
      const eventKey2 = wrapper.get('[test-id="eventKey-223.6.6.6-2"]')
      const eventKey3 = wrapper.get('[test-id="eventKey-114.114.114.114-3"]')
      const eventKey4 = wrapper.get('[test-id="eventKey-1.1.1.2-4"]')

      expect(eventKey0.text()).toEqual('114.114.114.114')
      expect(eventKey1.text()).toEqual('116.178.78.241')
      expect(eventKey2.text()).toEqual('223.6.6.6')
      expect(eventKey3.text()).toEqual('114.114.114.114')
      expect(eventKey4.text()).toEqual('1.1.1.2')

      const eventType0 = wrapper.get('[test-id="eventType-dns error-0"]')
      const eventType1 = wrapper.get('[test-id="eventType-http error-1"]')
      const eventType2 = wrapper.get('[test-id="eventType-dns error-2"]')
      const eventType3 = wrapper.get('[test-id="eventType-dns error-3"]')
      const eventType4 = wrapper.get('[test-id="eventType-http error-4"]')

      expect(eventType0.text()).toEqual('dns error')
      expect(eventType1.text()).toEqual('http error')
      expect(eventType2.text()).toEqual('dns error')
      expect(eventType3.text()).toEqual('dns error')
      expect(eventType4.text()).toEqual('http error')

      resolve()
    }, 200))
  })
  test('npm events 近期事件表格 下钻', async () => {
    axiosPostAndMounted(mockGet1, query)

    await new Promise(resolve => setTimeout(() => {
      const severity0 = wrapper.get('[test-id="eventSeverity-critical-0"]')
      const severity1 = wrapper.get('[test-id="eventSeverity-high-1"]')
      const severity2 = wrapper.get('[test-id="eventSeverity-low-2"]')
      const severity3 = wrapper.get('[test-id="eventSeverity-medium-3"]')
      const severity4 = wrapper.get('[test-id="eventSeverity-info-4"]')
      const severity5 = wrapper.get('[test-id="eventSeverity-critical-5"]')

      expect(severity0.text()).toEqual('critical')
      expect(severity1.text()).toEqual('high')
      expect(severity2.text()).toEqual('low')
      expect(severity3.text()).toEqual('medium')
      expect(severity4.text()).toEqual('info')
      expect(severity5.text()).toEqual('critical')

      expect(severity0.classes()).toContain('critical')
      expect(severity1.classes()).toContain('high')
      expect(severity2.classes()).toContain('low')
      expect(severity3.classes()).toContain('medium')
      expect(severity4.classes()).toContain('info')
      expect(severity5.classes()).toContain('critical')

      const eventType0 = wrapper.get('[test-id="eventType-http error-0"]')
      const eventType1 = wrapper.get('[test-id="eventType-dns error-1"]')
      const eventType2 = wrapper.get('[test-id="eventType-dns error-2"]')
      const eventType3 = wrapper.get('[test-id="eventType-http error-3"]')
      const eventType4 = wrapper.get('[test-id="eventType-dns error-4"]')

      expect(eventType0.text()).toEqual('http error')
      expect(eventType1.text()).toEqual('dns error')
      expect(eventType2.text()).toEqual('dns error')
      expect(eventType3.text()).toEqual('http error')
      expect(eventType4.text()).toEqual('dns error')

      const startTime0 = wrapper.get('[test-id="startTime-0"]')
      const startTime1 = wrapper.get('[test-id="startTime-1"]')
      const startTime2 = wrapper.get('[test-id="startTime-2"]')
      const startTime3 = wrapper.get('[test-id="startTime-3"]')
      const startTime4 = wrapper.get('[test-id="startTime-4"]')

      expect(startTime0.text()).toEqual('2023-01-04T11:25:00+08:00')
      expect(startTime1.text()).toEqual('2023-01-04T00:30:00+08:00')
      expect(startTime2.text()).toEqual('2023-01-03T13:05:00+08:00')
      expect(startTime3.text()).toEqual('2023-01-03T12:35:00+08:00')
      expect(startTime4.text()).toEqual('2023-01-03T12:15:00+08:00')

      resolve()
    }, 300))
  })
  test('npm events 近期事件表格 未下钻、未下钻无数据', async () => {
    axiosPostAndMounted(mockData.empty.data)

    await new Promise(resolve => setTimeout(() => {
      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.thereNoEvents')
      resolve()
    }, 200))
  })
})
