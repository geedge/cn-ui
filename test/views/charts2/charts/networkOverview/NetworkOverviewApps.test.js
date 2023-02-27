import NetworkOverviewApps from '@/views/charts2/charts/networkOverview/NetworkOverviewApps'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'
import { mockData } from './mockData/NetworkOverviewApps'

const chart = mockData.common.chart

const linkInfo = 5

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675180800,
  endTime: 1675353599
}

let wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * 模拟localStorage获取数据
 * ElementPlus
 * @param Metric
 */
function axiosPostAndMounted (Metric, flag, data) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  // eslint-disable-next-line no-proto
  jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(() => linkInfo)

  if (flag === 'empty') {
    for (let i = 0; i < 8; i++) {
      axios.get.mockResolvedValueOnce(data)
    }
  } else if (flag === 'boundary') {
    data.forEach(item => {
      axios.get.mockResolvedValueOnce(item)
    })
  } else {
    mockData.common.mockGet.forEach(item => {
      axios.get.mockResolvedValueOnce(item)
    })
  }

  wrapper = mount(NetworkOverviewApps, {
    propsData: {
      timeFilter,
      chart,
      metric: Metric
    },
    global: {
      plugins: [ElementPlus]
    }
  })
}

describe('views/charts2/charts/networkOverview/NetworkOverviewApps.vue测试', () => {
  test('Providers and Applications 列表信息 Metric:Bits/s', async () => {
    axiosPostAndMounted()
    await new Promise(resolve => setTimeout(async () => {
      const testName0 = wrapper.get('[test-id="name0"]')
      const testName1 = wrapper.get('[test-id="name1"]')
      const testName2 = wrapper.get('[test-id="name6"]')
      const testName3 = wrapper.get('[test-id="name7"]')

      expect(testName0.text()).toEqual('douyin')
      expect(testName1.text()).toEqual('kuaishou')
      expect(testName2.text()).toEqual('Alibaba')
      expect(testName3.text()).toEqual('Baidu')
      //
      const testIcon0 = wrapper.get('[test-id="icon0"]')
      const testIcon1 = wrapper.get('[test-id="icon1"]')
      const testIcon2 = wrapper.get('[test-id="icon6"]')
      const testIcon3 = wrapper.get('[test-id="icon7"]')

      expect(testIcon0.classes()).toContain('cn-icon-app2')
      expect(testIcon1.classes()).toContain('cn-icon-app2')
      expect(testIcon2.classes()).toContain('cn-icon-entity')
      expect(testIcon3.classes()).toContain('cn-icon-entity')
      //
      const testrate0 = wrapper.get('[test-id="rate0"]')
      const testrate1 = wrapper.get('[test-id="rate1"]')
      const testrate2 = wrapper.get('[test-id="rate6"]')
      const testrate3 = wrapper.get('[test-id="rate7"]')

      expect(testrate0.text()).toEqual('34.15 M')
      expect(testrate1.text()).toEqual('9.18 M')
      expect(testrate2.text()).toEqual('4.74 M')
      expect(testrate3.text()).toEqual('1.27 M')

      const testPercent0 = wrapper.get('[test-id="percent0"]')
      const testPercent1 = wrapper.get('[test-id="percent3"]')
      const testPercent2 = wrapper.get('[test-id="percent6"]')
      const testPercent3 = wrapper.get('[test-id="percent7"]')

      expect(testPercent0.text()).toEqual('>500.00%')
      expect(testPercent1.text()).toEqual('-9.82%')
      expect(testPercent2.text()).toEqual('+23.87%')
      expect(testPercent3.text()).toEqual('+16.63%')

      const testTotal0 = wrapper.get('[test-id="total0"]')
      const testTotal1 = wrapper.get('[test-id="total1"]')
      const testTotal2 = wrapper.get('[test-id="total6"]')
      const testTotal3 = wrapper.get('[test-id="total7"]')

      expect(testTotal0.text()).toEqual('686.94 GB')
      expect(testTotal1.text()).toEqual('184.70 GB')
      expect(testTotal2.text()).toEqual('95.26 GB')
      expect(testTotal3.text()).toEqual('25.53 GB')

      // 模拟点击 add 新增
      const testAdd0 = wrapper.find('[test-id="add"]')
      await testAdd0.trigger('click')
      expect(wrapper.vm.showAddApp).toBe(true)
      await wrapper.vm.$nextTick()

      // element drawer
      // add provide 列表 图标
      // const testProvideIcon0 = wrapper.get('[test-id="provide-icon0"]')
      // const testAPPIcon0 = wrapper.get('[test-id="app-icon0"]')

      const testProvide0 = wrapper.find('[test-id="provide0"]')
      await testProvide0.trigger('click')
      expect(testProvide0.classes()).toContain('provide-show')

      const testProvideTitle0 = wrapper.get('[test-id="provide-title0"]')
      expect(testProvideTitle0.text()).toEqual('Jingdong')

      const testProvideRemark0 = wrapper.get('[test-id="provide-remark0"]')
      expect(testProvideRemark0.text()).toEqual('JD.com, Inc., also known as Jingdong and formerly called 360buy, is a Chinese e-commerce company headquartered in Beijing. It is one of the two massive B2C online retailers in China by transaction volume and revenue, a member of the Fortune Global 500 and a major competitor to Alibaba-run Tmall.')

      const testAppTypeTab1 = wrapper.find('[id="tab-1"]')
      await testAppTypeTab1.trigger('click')
      expect(parseFloat(wrapper.vm.appTypeTab)).toBe(1)
      await wrapper.vm.$nextTick()

      const testApp0 = wrapper.find('[test-id="app0"]')
      await testApp0.trigger('click')
      expect(testApp0.classes()).toContain('app-show')

      const testAppTitle0 = wrapper.get('[test-id="app-title0"]')
      expect(testAppTitle0.text()).toEqual('avoidr')

      const testAppRemark0 = wrapper.get('[test-id="app-remark0"]')
      expect(testAppRemark0.text()).toEqual('Avoidr is a free web proxy')
      resolve()
    }, 200))
  })
  test('Providers and Applications 列表信息 Metric:Packets/s', async () => {
    axiosPostAndMounted('Packets/s')
    await new Promise(resolve => setTimeout(async () => {
      const testName0 = wrapper.get('[test-id="name0"]')
      const testName1 = wrapper.get('[test-id="name1"]')
      const testName2 = wrapper.get('[test-id="name6"]')
      const testName3 = wrapper.get('[test-id="name7"]')

      expect(testName0.text()).toEqual('douyin')
      expect(testName1.text()).toEqual('kuaishou')
      expect(testName2.text()).toEqual('Alibaba')
      expect(testName3.text()).toEqual('Baidu')
      //
      const testIcon0 = wrapper.get('[test-id="icon0"]')
      const testIcon1 = wrapper.get('[test-id="icon1"]')
      const testIcon2 = wrapper.get('[test-id="icon6"]')
      const testIcon3 = wrapper.get('[test-id="icon7"]')
      const testIcon4 = wrapper.get('[test-id="icon2"]')

      expect(testIcon0.classes()).toContain('cn-icon-app2')
      expect(testIcon1.classes()).toContain('cn-icon-app2')
      expect(testIcon4.classes()).toContain('cn-icon-app2')
      expect(testIcon2.classes()).toContain('cn-icon-entity')
      expect(testIcon3.classes()).toContain('cn-icon-entity')
      //
      const testrate0 = wrapper.get('[test-id="rate0"]')
      const testrate1 = wrapper.get('[test-id="rate1"]')
      const testrate2 = wrapper.get('[test-id="rate6"]')
      const testrate3 = wrapper.get('[test-id="rate7"]')
      const testrate4 = wrapper.get('[test-id="rate2"]')

      expect(testrate0.text()).toEqual('31.33 K')
      expect(testrate1.text()).toEqual('8.46 K')
      expect(testrate2.text()).toEqual('5.01 K')
      expect(testrate3.text()).toEqual('1.33 K')
      expect(testrate4.text()).toEqual('-')

      const testPercent0 = wrapper.get('[test-id="percent0"]')
      const testPercent1 = wrapper.get('[test-id="percent3"]')
      const testPercent2 = wrapper.get('[test-id="percent6"]')
      const testPercent3 = wrapper.get('[test-id="percent7"]')

      expect(testPercent0.text()).toEqual('+25.20%')
      expect(testPercent1.text()).toEqual('+12.12%')
      expect(testPercent2.text()).toEqual('+23.61%')
      expect(testPercent3.text()).toEqual('+17.90%')

      const testTotal0 = wrapper.get('[test-id="total0"]')
      const testTotal1 = wrapper.get('[test-id="total1"]')
      const testTotal2 = wrapper.get('[test-id="total6"]')
      const testTotal3 = wrapper.get('[test-id="total7"]')
      const testTotal4 = wrapper.get('[test-id="total2"]')

      expect(testTotal0.text()).toEqual('676.80 M')
      expect(testTotal1.text()).toEqual('182.71 M')
      expect(testTotal2.text()).toEqual('108.16 M')
      expect(testTotal3.text()).toEqual('28.83 M')
      expect(testTotal4.text()).toEqual('-')
      resolve()
    }, 200))
  })
  test('Providers and Applications 列表信息 Metric:Sessions/s', async () => {
    axiosPostAndMounted('Sessions/s')
    await new Promise(resolve => setTimeout(async () => {
      const testName0 = wrapper.get('[test-id="name0"]')
      const testName1 = wrapper.get('[test-id="name1"]')
      const testName2 = wrapper.get('[test-id="name6"]')
      const testName3 = wrapper.get('[test-id="name7"]')

      expect(testName0.text()).toEqual('douyin')
      expect(testName1.text()).toEqual('kuaishou')
      expect(testName2.text()).toEqual('Alibaba')
      expect(testName3.text()).toEqual('Baidu')
      //
      const testIcon0 = wrapper.get('[test-id="icon0"]')
      const testIcon1 = wrapper.get('[test-id="icon1"]')
      const testIcon2 = wrapper.get('[test-id="icon6"]')
      const testIcon3 = wrapper.get('[test-id="icon7"]')

      expect(testIcon0.classes()).toContain('cn-icon-app2')
      expect(testIcon1.classes()).toContain('cn-icon-app2')
      expect(testIcon2.classes()).toContain('cn-icon-entity')
      expect(testIcon3.classes()).toContain('cn-icon-entity')
      //
      const testrate0 = wrapper.get('[test-id="rate0"]')
      const testrate1 = wrapper.get('[test-id="rate1"]')
      const testrate2 = wrapper.get('[test-id="rate6"]')
      const testrate3 = wrapper.get('[test-id="rate7"]')

      expect(testrate0.text()).toEqual('30.96')
      expect(testrate1.text()).toEqual('6.24')
      expect(testrate2.text()).toEqual('-')
      expect(testrate3.text()).toEqual('9.20')

      const testPercent0 = wrapper.get('[test-id="percent0"]')
      const testPercent1 = wrapper.get('[test-id="percent3"]')
      const testPercent2 = wrapper.get('[test-id="percent6"]')
      const testPercent3 = wrapper.get('[test-id="percent7"]')

      expect(testPercent0.text()).toEqual('+23.64%')
      expect(testPercent1.text()).toEqual('+100.00%')
      expect(testPercent2.text()).toEqual('-100.00%')
      expect(testPercent3.text()).toEqual('+25.00%')

      const testTotal0 = wrapper.get('[test-id="total0"]')
      const testTotal1 = wrapper.get('[test-id="total1"]')
      const testTotal2 = wrapper.get('[test-id="total6"]')
      const testTotal3 = wrapper.get('[test-id="total7"]')

      expect(testTotal0.text()).toEqual('668.23 K')
      expect(testTotal1.text()).toEqual('134.46 K')
      expect(testTotal2.text()).toEqual('-')
      expect(testTotal3.text()).toEqual('198.26 K')
      resolve()
    }, 200))
  })
  test('搜索功能：模糊匹配', async () => {
    axiosPostAndMounted()
    await new Promise(resolve => setTimeout(async () => {
      // 模拟点击 add 新增
      const testAdd0 = wrapper.find('[test-id="add"]')
      await testAdd0.trigger('click')
      expect(wrapper.vm.showAddApp).toBe(true)
      await wrapper.vm.$nextTick()

      const testSearchInput = wrapper.get('[test-id="search-input"]')
      await wrapper.get('input[type="text"]').setValue('sina')
      await testSearchInput.trigger('input')
      await testAdd0.trigger('click')
      expect(wrapper.vm.searcherApp).toEqual('sina')

      const testAppTypeTab0 = wrapper.find('[id="tab-0"]')
      await testAppTypeTab0.trigger('click')
      expect(parseFloat(wrapper.vm.appTypeTab)).toBe(0)

      const testProvideTitle0 = wrapper.get('[test-id="provide-title0"]')
      expect(testProvideTitle0.text()).toEqual('Sina')

      const testProvideRemark0 = wrapper.get('[test-id="provide-remark0"]')
      expect(testProvideRemark0.text()).toEqual('Sina Corporation is a Chinese technology company. Sina operates four major business lines: Sina Weibo, Sina Mobile, Sina Online, and Sinanet. Sina has over 100 million registered users worldwide.')

      const testAppTypeTab1 = wrapper.find('[id="tab-1"]')
      await testAppTypeTab1.trigger('click')
      expect(parseFloat(wrapper.vm.appTypeTab)).toBe(1)

      const testAppTitle0 = wrapper.get('[test-id="app-title0"]')
      expect(testAppTitle0.text()).toEqual('iapp')

      const testAppRemark0 = wrapper.get('[test-id="app-remark0"]')
      expect(testAppRemark0.text()).toEqual('News site about mobile applications')
      resolve()
    }, 300))
  })
  test('鼠标移入、移出、点击事件', async () => {
    axiosPostAndMounted()
    await new Promise(resolve => setTimeout(async () => {
      // 模拟鼠标 移入 移出 显示隐藏更多 icon 图标
      const testAppDataCard = wrapper.find('[test-id="app-data-card"]')
      await testAppDataCard.trigger('mouseenter')
      expect(wrapper.vm.appData[0].showMore).toBe(true)
      await testAppDataCard.trigger('mouseleave')
      expect(wrapper.vm.appData[0].showMore).toBe(false)
      expect(wrapper.vm.appData[0].moreOptions).toBe(false)

      // 模拟鼠标移入 移出 显示隐藏下拉内容
      const testDark = wrapper.find('[test-id="mouseenter-dark"]')
      await testDark.trigger('mouseenter')
      expect(wrapper.vm.appData[0].moreOptions).toBe(true)

      const testMouseleaveMore = wrapper.find('[test-id="mouseleave-more"]')
      await testMouseleaveMore.trigger('mouseleave')
      expect(wrapper.vm.appData[0].moreOptions).toBe(false)

      // 模拟点击 add 新增
      const testAdd0 = wrapper.find('[test-id="add"]')
      await testAdd0.trigger('click')
      expect(wrapper.vm.showAddApp).toBe(true)
      await wrapper.vm.$nextTick()

      // 模拟 cancel 取消
      const testCancelAdd = wrapper.find('[test-id="cancel-app"]')
      await testCancelAdd.trigger('click')
      expect(wrapper.vm.showAddApp).toBe(false)
      resolve()
    }, 500))
  })
  test('Providers and Applications 列表信息 Metric:Bits/s无数据', async () => {
    axiosPostAndMounted('Bits/s', 'empty', mockData.empty)
    await new Promise(resolve => setTimeout(async () => {
      const testName0 = wrapper.get('[test-id="name0"]')
      const testName1 = wrapper.get('[test-id="name1"]')
      const testName2 = wrapper.get('[test-id="name6"]')
      const testName3 = wrapper.get('[test-id="name7"]')

      expect(testName0.text()).toEqual('douyin')
      expect(testName1.text()).toEqual('kuaishou')
      expect(testName2.text()).toEqual('Alibaba')
      expect(testName3.text()).toEqual('Baidu')

      const testIcon0 = wrapper.get('[test-id="icon0"]')
      const testIcon1 = wrapper.get('[test-id="icon1"]')
      const testIcon2 = wrapper.get('[test-id="icon6"]')
      const testIcon3 = wrapper.get('[test-id="icon7"]')

      expect(testIcon0.classes()).toContain('cn-icon-app2')
      expect(testIcon1.classes()).toContain('cn-icon-app2')
      expect(testIcon2.classes()).toContain('cn-icon-entity')
      expect(testIcon3.classes()).toContain('cn-icon-entity')
      //
      const testrate0 = wrapper.get('[test-id="rate0"]')
      const testrate1 = wrapper.get('[test-id="rate1"]')
      const testrate2 = wrapper.get('[test-id="rate6"]')
      const testrate3 = wrapper.get('[test-id="rate7"]')

      expect(testrate0.text()).toEqual('-')
      expect(testrate1.text()).toEqual('-')
      expect(testrate2.text()).toEqual('-')
      expect(testrate3.text()).toEqual('-')

      const testTotal0 = wrapper.get('[test-id="total0"]')
      const testTotal1 = wrapper.get('[test-id="total1"]')
      const testTotal2 = wrapper.get('[test-id="total6"]')
      const testTotal3 = wrapper.get('[test-id="total7"]')

      expect(testTotal0.text()).toEqual('-')
      expect(testTotal1.text()).toEqual('-')
      expect(testTotal2.text()).toEqual('-')
      expect(testTotal3.text()).toEqual('-')

      // 模拟点击 add 新增
      const testAdd0 = wrapper.find('[test-id="add"]')
      await testAdd0.trigger('click')
      expect(wrapper.vm.showAddApp).toBe(true)
      await wrapper.vm.$nextTick()

      const noData = wrapper.get('[test-id="noData"]')
      expect(noData.text()).toBe('npm.noData')
      resolve()
    }, 200))
  })
  test('Providers and Applications 列表信息 Metric:Packets/s 0或大数值', async () => {
    axiosPostAndMounted('Packets/s', 'boundary', mockData.boundary.data)

    await new Promise(resolve => setTimeout(async () => {
      const testName0 = wrapper.get('[test-id="name0"]')
      const testName1 = wrapper.get('[test-id="name1"]')
      const testName2 = wrapper.get('[test-id="name6"]')
      const testName3 = wrapper.get('[test-id="name7"]')

      expect(testName0.text()).toEqual('douyin')
      expect(testName1.text()).toEqual('kuaishou')
      expect(testName2.text()).toEqual('Alibaba')
      expect(testName3.text()).toEqual('Baidu')

      const testIcon0 = wrapper.get('[test-id="icon0"]')
      const testIcon1 = wrapper.get('[test-id="icon1"]')
      const testIcon2 = wrapper.get('[test-id="icon6"]')
      const testIcon3 = wrapper.get('[test-id="icon7"]')
      const testIcon4 = wrapper.get('[test-id="icon2"]')

      expect(testIcon0.classes()).toContain('cn-icon-app2')
      expect(testIcon1.classes()).toContain('cn-icon-app2')
      expect(testIcon4.classes()).toContain('cn-icon-app2')
      expect(testIcon2.classes()).toContain('cn-icon-entity')
      expect(testIcon3.classes()).toContain('cn-icon-entity')

      const testrate0 = wrapper.get('[test-id="rate0"]')
      const testrate1 = wrapper.get('[test-id="rate1"]')
      const testrate2 = wrapper.get('[test-id="rate6"]')
      const testrate3 = wrapper.get('[test-id="rate7"]')
      const testrate4 = wrapper.get('[test-id="rate2"]')

      expect(testrate0.text()).toEqual('31.33 G')
      expect(testrate1.text()).toEqual('84.59 T')
      expect(testrate2.text()).toEqual('500.75 K')
      expect(testrate3.text()).toEqual('0')
      expect(testrate4.text()).toEqual('-')

      const testPercent0 = wrapper.get('[test-id="percent0"]')
      const testPercent1 = wrapper.get('[test-id="percent1"]')
      const testPercent2 = wrapper.get('[test-id="percent6"]')
      const testPercent3 = wrapper.get('[test-id="percent7"]')

      expect(testPercent0.text()).toEqual('-87.48%')
      expect(testPercent1.text()).toEqual('>500.00%')
      expect(testPercent2.text()).toEqual('>500.00%')
      expect(testPercent3.text()).toEqual('-100.00%')

      const testTotal0 = wrapper.get('[test-id="total0"]')
      const testTotal1 = wrapper.get('[test-id="total1"]')
      const testTotal2 = wrapper.get('[test-id="total6"]')
      const testTotal3 = wrapper.get('[test-id="total7"]')
      const testTotal4 = wrapper.get('[test-id="total2"]')

      expect(testTotal0.text()).toEqual('67.68 P')
      expect(testTotal1.text()).toEqual('18.27 P')
      expect(testTotal2.text()).toEqual('10.82 P')
      expect(testTotal3.text()).toEqual('288.34 T')
      expect(testTotal4.text()).toEqual('-')
      resolve()
    }, 300))
  })
})
