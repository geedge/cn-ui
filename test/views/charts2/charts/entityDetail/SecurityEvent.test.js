import SecurityEvent from '@/views/charts2/charts/entityDetail/tabs/SecurityEvent'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import mockData from './mockData/SecurityEvent'
import chartMixin from '@/views/charts2/chart-mixin'
import common from '@/mixins/common'

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}
const entity = {
  entityType: 'ip',
  entityName: '153.99.250.123'
}

function init (query) {
  require('vue-router').useRoute.mockReturnValue({ query: query || {} })
}
function getRgb (str) {
  return str.substring(str.indexOf('rgb'), str.indexOf(';'))
}

describe('views/charts2/charts/entityDetail/tabs/SecurityEvent.vue测试', () => {
  /* test('实体详情tabs-安全事件：信息展示，severity严重程度与色块验证', async () => {
    init()
    axios.get.mockResolvedValue(mockData.common)
    const wrapper = mount(SecurityEvent, {
      propsData: {
        entity,
        timeFilter
      },
      mixins: [chartMixin, common]
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="severity-color-block0"]')
      const textNode1 = await wrapper.get('[test-id="severity-color-block1"]')
      const textNode2 = await wrapper.get('[test-id="severity-color-block2"]')

      expect(getRgb(textNode0.html())).toEqual('rgb(216, 76, 76)')
      expect(getRgb(textNode1.html())).toEqual('rgb(255, 216, 45)')
      expect(getRgb(textNode2.html())).toEqual('rgb(255, 216, 45)')

      const offenderIp1 = await wrapper.get('[test-id="offender-ip0"]')
      const offenderIp2 = await wrapper.get('[test-id="offender-ip1"]')
      const offenderIp3 = await wrapper.get('[test-id="offender-ip2"]')
      const victimIp1 = await wrapper.get('[test-id="victim-ip0"]')
      const victimIp2 = await wrapper.get('[test-id="victim-ip1"]')
      const victimIp3 = await wrapper.get('[test-id="victim-ip2"]')

      expect(offenderIp1.text()).toEqual('213.186.33.5')
      expect(offenderIp2.text()).toEqual('213.186.33.5')
      expect(offenderIp3.text()).toEqual('213.186.33.5')
      expect(victimIp1.text()).toEqual('116.178.217.92')
      expect(victimIp2.text()).toEqual('116.178.217.93')
      expect(victimIp3.text()).toEqual('116.178.217.93')
      resolve()
    }, 200))
  }) */
  test('实体详情tabs-安全事件：请求无数据', async () => {
    init()
    axios.get.mockResolvedValue(mockData.empty)
    const wrapper = mount(SecurityEvent, {
      propsData: {
        entity,
        timeFilter
      },
      mixins: [chartMixin, common]
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const noData = wrapper.get('[test-id="no-data"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
})
