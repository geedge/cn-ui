import NpmRecentEvents from '@/views/charts2/charts/npm/NpmRecentEvents'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'
// 未下钻
const mockGet = {
  data: { status: 200, code: 200, queryKey: '68d8aa5867b08b926b5bd38c36add9e5', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 550, result_rows: 5 }, job: null, formatType: 'json', meta: [{ name: 'event_id', type: 'long', category: 'Metric' }, { name: 'event_severity', type: 'string', category: 'Metric' }, { name: 'event_key', type: 'string', category: 'Metric' }, { name: 'event_type', type: 'string', category: 'Metric' }], data: { resultType: 'table', result: [{ eventId: 1173511643475208200, eventSeverity: 'critical', eventKey: '114.114.114.114 dns error', eventType: 'dns error' }, { eventId: 1173504415263352800, eventSeverity: 'high', eventKey: '116.178.78.241 http error', eventType: 'http error' }, { eventId: 1173492761289025500, eventSeverity: 'medium', eventKey: '223.6.6.6 dns error', eventType: 'dns error' }, { eventId: 1173489002890651600, eventSeverity: 'low', eventKey: '114.114.114.114 dns error', eventType: 'dns error' }, { eventId: 1173482380537620500, eventSeverity: 'info', eventKey: '1.1.1.2 dns error', eventType: 'http error' }, { eventId: 1173482380537620500, eventSeverity: 'critical', eventKey: '1.1.1.2 dns error', eventType: 'dns error' }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_id%20AS%20event_id%2Cevent_severity%20AS%20event_severity%2C%20event_key%20AS%20event_key%2C%20event_type%20AS%20event_type%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675227528%20AND%20end_time%20%3C%201675231128%20ORDER%20BY%20start_time%20DESC%20%20LIMIT%208%20&format=json&option=real-time', msg: 'OK' }
}

// 下钻
const mockGet1 = {
  data: { status: 200, code: 200, queryKey: 'fc0bd92bf3b48a37310d5c004d8b7a7b', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 689, result_rows: 7 }, job: null, formatType: 'json', meta: [{ name: 'event_id', type: 'long', category: 'Metric' }, { name: 'event_severity', type: 'string', category: 'Metric' }, { name: 'event_type', type: 'string', category: 'Metric' }, { name: 'start_time', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ eventId: 1132790825086844900, eventSeverity: 'critical', eventType: 'http error', startTime: 1672802700 }, { eventId: 1132132403379142700, eventSeverity: 'high', eventType: 'dns error', startTime: 1672763400 }, { eventId: 1131441760155689000, eventSeverity: 'low', eventType: 'dns error', startTime: 1672722300 }, { eventId: 1131411523384598500, eventSeverity: 'medium', eventType: 'http error', startTime: 1672720500 }, { eventId: 1131390214323789800, eventSeverity: 'info', eventType: 'dns error', startTime: 1672719300 }, { eventId: 1131306200132968400, eventSeverity: 'critical', eventType: 'http error', startTime: 1672714200 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_id%20AS%20event_id%2Cevent_severity%20AS%20event_severity%2C%20event_type%20AS%20event_type%2C%20start_time%20AS%20start_time%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201672675200%20AND%20start_time%20%3C%201677513600%20AND%20server_ip%20%3D%20%27116.178.236.216%27%20ORDER%20BY%20start_time%20DESC&format=json&option=real-time', msg: 'OK' }
}

const query = {
  curTab: 'country',
  dimensionType: 'ip',
  fourthMenu: '116.178.214.84',
  fourthPanel: '8',
  networkOverviewBeforeTab: 'ip',
  panelName: '116.178.214.84',
  queryCondition: "common_client_ip='116.178.214.84' OR common_server_ip='116.178.214.84'",
  t: '1675236779453',
  tabIndex: '1',
  tabOperationBeforeType: '',
  tabOperationType: '4',
  thirdMenu: 'network.ips',
  thirdPanel: '12'
}

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}

describe('views/charts2/charts/npm/NpmRecentEvents.vue测试', () => {
  test('npm events 近期事件表格 未下钻', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 返回数据
    axios.get.mockResolvedValue(mockGet)

    const wrapper = mount(NpmRecentEvents, {
      propsData: {
        timeFilter
      },
      global: {
        plugins: [ElementPlus]
      }
    })
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
    require('vue-router').useRoute.mockReturnValue({ query: query })
    // 模拟 axios 返回数据
    axios.get.mockResolvedValue(mockGet1)

    const wrapper = mount(NpmRecentEvents, {
      propsData: {
        timeFilter
      },
      global: {
        plugins: [ElementPlus]
      }
    })
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
})
