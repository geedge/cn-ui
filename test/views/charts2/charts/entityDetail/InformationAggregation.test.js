import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import mockData from './mockData/InformationAggregation'
import ElementPlus from 'element-plus'
import common from '@/mixins/common'
import chartMixin from '@/views/charts2/chart-mixin'

let wrapper = null
const mockGet = mockData.common

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}
const entity = {
  entityType: 'ip',
  entityName: '153.99.250.123'
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
  wrapper = mount(InformationAggregation, {
    global: {
      plugins: [ElementPlus]
    },
    propsData: {
      entity,
      timeFilter
    },
    mixins: [common, chartMixin]
  })
}

describe('views/charts2/charts/entityDetail/tabs/InformationAggregation.vue测试', () => {
  test('实体详情tabs-情报聚合：表格信息验证（情报内容列）', async () => {
    axiosPostAndMounted()

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.find('[test-id="entity-tag0"]')
      const textNode1 = await wrapper.find('[test-id="entity-tag1"]')
      const textNode2 = await wrapper.find('[test-id="entity-tag2"]')
      const textNode3 = await wrapper.find('[test-id="entity-tag3"]')
      const textNode4 = await wrapper.find('[test-id="entity-tag4"]')

      expect(textNode0.classes()).toContain('entity-tag--level-two-normal')
      expect(textNode1.classes()).toContain('entity-tag--level-two-negative')
      expect(textNode2.classes()).toContain('entity-tag--level-two-negative')
      expect(textNode3.classes()).toContain('entity-tag--level-two-normal')
      expect(textNode4.classes()).toContain('entity-tag--level-two-normal')

      expect(textNode0.text()).toEqual('dba Omsoft')
      expect(textNode1.text()).toEqual('IcedID')
      expect(textNode2.text()).toEqual('I2P')
      expect(textNode3.text()).toEqual('门户网站')
      expect(textNode4.text()).toEqual('用户tag')
      resolve()
    }, 400))
  })
  test('实体详情tabs-情报聚合：表格信息验证（状态列）', async () => {
    axiosPostAndMounted()

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = await wrapper.get('[test-id="entity-status0"]')
      const textNode1 = await wrapper.get('[test-id="entity-status1"]')
      const textNode2 = await wrapper.get('[test-id="entity-status2"]')
      const textNode3 = await wrapper.get('[test-id="entity-status3"]')
      const textNode4 = await wrapper.get('[test-id="entity-status4"]')

      expect(textNode0.text()).toEqual('entity.detail.valid')
      expect(textNode1.text()).toEqual('entity.detail.valid')
      expect(textNode2.text()).toEqual('entity.detail.valid')
      expect(textNode3.text()).toEqual('entity.detail.valid')
      expect(textNode4.text()).toEqual('entity.detail.valid')
      resolve()
    }, 200))
  })
  test('实体详情tabs-安全事件：请求无数据', async () => {
    axiosPostAndMounted(mockData.empty)
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(async () => {
      const noData = wrapper.get('[test-id="no-data"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
})
