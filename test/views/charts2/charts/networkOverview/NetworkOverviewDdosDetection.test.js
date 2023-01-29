import NetworkOverviewDdosDetection from '@/views/charts2/charts/networkOverview/NetworkOverviewDdosDetection'
import { mount } from '@vue/test-utils'
import axios from 'axios'
const data = {
  attackEventCount: 1200000,
  attackerCount: 2687878,
  victimCount: 36676767
}
describe('views/charts2/charts/networkOverview/NetworkOverviewDdosDetection.vueC测试', () => {
  test('攻击、受害、攻击数事件：ddos检测图', () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    axios.get.mockResolvedValue(data)
    // 加载vue组件，获得实例
    const wrapper = mount(NetworkOverviewDdosDetection, {
      propsData: {
        data
      }
    })
    setTimeout(() => {
      const attackEventCount = wrapper.get('[test-id="attackEventCount"]')
      const attackerCount = wrapper.get('[test-id="attackerCount"]')
      const victimCount = wrapper.get('[test-id="victimCount"]')

      expect(attackEventCount.text()).toEqual('1.20 M')
      expect(attackerCount.text()).toEqual('2.69 M')
      expect(victimCount.text()).toEqual('36.68 M')
    })
  })
})
