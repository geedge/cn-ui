import NpmEventsHeader from '@/views/charts2/charts/npm/NpmEventsHeader'
import { mount } from '@vue/test-utils'
import axios from 'axios'

// 模拟数据
const chartData = {
  data: { status: 200, code: 200, queryKey: '6480498979f7501d822572ebeb9e9665', success: true, message: null, statistics: { elapsed: 0, rows_read: 3, result_size: 167, result_rows: 5 }, job: null, formatType: 'json', meta: [{ name: 'event_severity', type: 'string', category: 'Dimension' }, { name: 'count', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ eventSeverity: 'critical', count: 322334 }, { eventSeverity: 'high', count: 1111 }, { eventSeverity: 'info', count: 122222 }, { eventSeverity: 'low', count: 14456678 }, { eventSeverity: 'medium', count: 2000000 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_severity%20AS%20event_severity%2C%20COUNT%28*%29%20AS%20count%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675026686%20AND%20end_time%20%3C%201675048286%20GROUP%20BY%20event_severity&format=json&option=real-time', msg: 'OK' }
}
// type
const type = 'severity'

describe('views/charts2/charts/npm/NpmEventsHeader.vue测试', () => {
  test('严重等级各等级个数：npm event 严重等级单值', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 返回数据
    axios.get.mockResolvedValue(chartData)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmEventsHeader, {
      propsData: {
        type
      }
    })
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
})
