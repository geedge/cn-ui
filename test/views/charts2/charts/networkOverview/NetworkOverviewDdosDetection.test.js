import NetworkOverviewDdosDetection from '@/views/charts2/charts/networkOverview/NetworkOverviewDdosDetection'
import { mount } from '@vue/test-utils'
import axios from 'axios'

const mockGet = {
  data: {"status":200,"code":200,"queryKey":"dec6723e173e8fa2b00917dc597bfb27","success":true,"message":null,"statistics":{"elapsed":0,"rows_read":2,"result_size":58,"result_rows":1},"job":null,"formatType":"json","meta":[{"name":"attack_event_count","type":"long","category":"Metric"},{"name":"attacker_count","type":"long","category":"Metric"},{"name":"victim_count","type":"long","category":"Metric"}],"data":{"resultType":"object","result":[{"attackEventCount":1200000,"attackerCount":2687878,"victimCount":36676767}]},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20COUNT%28*%29%20AS%20attack_event_count%2C%20COUNT%28DISTINCT%28offender_ip%29%29%20AS%20attacker_count%2C%20COUNT%28DISTINCT%28victim_ip%29%29%20AS%20victim_count%20FROM%20security_event%20WHERE%20start_time%20%3E%3D%201675043912%20AND%20start_time%20%3C%201675047512%20AND%20security_type%20%3D%20%27ddos%27&format=json&option=real-time","msg":"OK"}
}

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}

describe('views/charts2/charts/networkOverview/NetworkOverviewDdosDetection.vue测试', () => {
  test('攻击、受害、攻击数事件：ddos检测图', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 返回数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NetworkOverviewDdosDetection, {
      propsData: {
        timeFilter
      }
    })
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
})
