import EntityDetailLine from '@/views/charts2/charts/entityDetail/EntityDetailLine'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import mockData from './mockData/EntityDetailLine'
import common from '@/mixins/common'
import chartMixin from '@/views/charts2/chart-mixin'

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}
const chart = {
  id: 2108,
  name: 'APP流量图',
  i18n: '',
  panelId: 20,
  pid: 0,
  type: 107,
  x: 0,
  y: 6,
  w: 30,
  h: 6,
  children: [],
  panel: {
    id: 20,
    name: 'APP entity detail'
  },
  i: 2108,
  category: 'echarts',
  firstShow: false,
  moved: false
}
const entity = {
  entityType: 'ip',
  entityName: '153.99.250.123'
}

function init (query) {
  require('vue-router').useRoute.mockReturnValue({ query: query || {} })
}

describe('views/charts2/charts/entityDetail/EntityDetailLine.vue测试', () => {
  test('Metric=Bits/s，无数据（空数组）', async () => {
    init()
    axios.get.mockResolvedValue(mockData.empty)
    const wrapper = mount(EntityDetailLine, {
      propsData: {
        entity,
        timeFilter,
        chart
      },
      data () {
        return {
          isUnitTesting: true
        }
      },
      mixins: [common, chartMixin]
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="tabContent0"]')
      const textNode1 = await wrapper.get('[test-id="tabContent1"]')
      const textNode2 = await wrapper.get('[test-id="tabContent2"]')
      const textNode3 = await wrapper.get('[test-id="tabContent3"]')
      const textNode4 = await wrapper.get('[test-id="tabContent4"]')
      const textNode5 = await wrapper.get('[test-id="tabContent5"]')
      expect(textNode0.text()).toEqual('-')
      expect(textNode1.text()).toEqual('-')
      expect(textNode2.text()).toEqual('-')
      expect(textNode3.text()).toEqual('-')
      expect(textNode4.text()).toEqual('-')
      expect(textNode5.text()).toEqual('-')
      resolve()
    }, 200))
  })
  test('Metric=Bits/s，0和大数值', async () => {
    init()
    axios.get.mockResolvedValue(mockData.bytes.boundary)
    const wrapper = mount(EntityDetailLine, {
      propsData: {
        entity,
        timeFilter,
        chart
      },
      data () {
        return {
          isUnitTesting: true
        }
      },
      mixins: [common, chartMixin]
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      // total页签固定显示，数据是0也一样
      const titleNode0 = await wrapper.get('[test-id="tabTitle0"]')
      const titleNode1 = await wrapper.get('[test-id="tabTitle2"]')
      const titleNode2 = await wrapper.get('[test-id="tabTitle5"]')
      const textNode0 = await wrapper.get('[test-id="tabContent0"]')
      const textNode1 = await wrapper.get('[test-id="tabContent2"]')
      const textNode2 = await wrapper.get('[test-id="tabContent5"]')
      expect(titleNode0.text()).toEqual('network.total')
      expect(titleNode1.text()).toEqual('network.outbound')
      expect(titleNode2.text()).toEqual('network.other')
      expect(textNode0.text()).toEqual('<0.01bps')
      expect(textNode1.text()).toEqual('95.23Ebps')
      expect(textNode2.text()).toEqual('0.01bps')
      resolve()
    }, 200))
  })
  test('Metric=Bits/s，点击第三个tab', async () => {
    init()
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockData.common)
    // 加载vue组件，获得实例
    const wrapper = mount(EntityDetailLine, {
      propsData: {
        entity,
        timeFilter,
        chart
      },
      data () {
        return {
          isUnitTesting: true
        }
      },
      mixins: [common, chartMixin]
    })

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="tabContent0"]')
      const textNode1 = await wrapper.get('[test-id="tabContent1"]')
      const textNode2 = await wrapper.get('[test-id="tabContent2"]')
      expect(textNode0.text()).toEqual('112.04Mbps')
      expect(textNode1.text()).toEqual('18.59Mbps')
      expect(textNode2.text()).toEqual('87.56Mbps')
      resolve()
    }, 200))

    // 点击tab后，是否切换高亮状态
    const textNode3 = await wrapper.get('[test-id="tab2"]')
    await textNode3.trigger('click')
    expect(textNode3.classes()).toContain('is-active')
  })
  test('Metric=Packets/s', async () => {
    const query = { entityType: 'app', name: 'uplive', startTime: 1675388605, endTime: 1675410205, range: 60, metric: 'Packets/s' }
    init(query)
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockData.common)
    // 加载vue组件，获得实例
    const wrapper = mount(EntityDetailLine, {
      propsData: {
        entity,
        timeFilter,
        chart,
        metric: 'Packets/s'
      },
      data () {
        return {
          isUnitTesting: true
        }
      },
      mixins: [common, chartMixin]
    })

    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="tabContent0"]')
      const textNode1 = await wrapper.get('[test-id="tabContent1"]')
      const textNode2 = await wrapper.get('[test-id="tabContent2"]')
      expect(textNode0.text()).toEqual('14.06Kpackets/s')
      expect(textNode1.text()).toEqual('4.24Kpackets/s')
      expect(textNode2.text()).toEqual('9.17Kpackets/s')
      resolve()
    }, 200))
  })
  test('Metric=Sessions/s', async () => {
    const query = { entityType: 'app', name: 'uplive', startTime: 1675388605, endTime: 1675410205, range: 60, metric: 'Sessions/s' }
    init(query)
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockData.common)
    // 加载vue组件，获得实例
    const wrapper = mount(EntityDetailLine, {
      propsData: {
        entity,
        timeFilter,
        chart,
        metric: 'Sessions/s'
      },
      data () {
        return {
          isUnitTesting: true
        }
      },
      mixins: [common, chartMixin]
    })

    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="tabContent0"]')
      expect(textNode0.text()).toEqual('29.89sessions/s')
      resolve()
    }, 200))
  })
})
