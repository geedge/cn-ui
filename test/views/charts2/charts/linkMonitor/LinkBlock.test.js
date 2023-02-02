import linkBlock from '@/views/charts2/charts/linkMonitor/LinkBlock'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import NpmAppCategoryScore from '@/views/charts2/charts/npm/NpmAppCategoryScore'
import ElementPlus from '_element-plus@1.0.2-beta.71@element-plus'

const mockGet1 = {
  data: {"status":200,"code":200,"queryKey":"549b4c3bcabf0feee193b834671879de","success":true,"message":null,"statistics":{"elapsed":3,"rows_read":11480,"bytes_read":459200,"result_size":1214,"result_rows":21},"job":null,"formatType":"json","meta":[{"name":"link_id","type":"string","category":"Dimension"},{"name":"egress_bytes","type":"long","category":"Metric"},{"name":"ingress_bytes","type":"long","category":"Metric"}],"data":{"resultType":"table","result":[{"linkId":"257","egressBytes":"0","egressBitsRate":0,"ingressBytes":"493739879","ingressBitsRate":1097199.76},{"linkId":"256","egressBytes":"4147998874","egressBitsRate":9217775.28,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"1024","egressBytes":"4229808296","egressBitsRate":9399574,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"1793","egressBytes":"0","egressBitsRate":0,"ingressBytes":"604840505","ingressBitsRate":1344090},{"linkId":"2817","egressBytes":"0","egressBitsRate":0,"ingressBytes":"430811638","ingressBitsRate":957359.2},{"linkId":"0","egressBytes":"819878366014","egressBitsRate":1821951924.48,"ingressBytes":"140774357362","ingressBitsRate":312831905.28},{"linkId":"1281","egressBytes":"0","egressBitsRate":0,"ingressBytes":"544675122","ingressBitsRate":1210389.12},{"linkId":"2049","egressBytes":"0","egressBitsRate":0,"ingressBytes":"711346274","ingressBitsRate":1580769.52},{"linkId":"1536","egressBytes":"4195896971","egressBitsRate":9324215.52,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"2305","egressBytes":"0","egressBitsRate":0,"ingressBytes":"524865003","ingressBitsRate":1166366.64},{"linkId":"1792","egressBytes":"4145790227","egressBitsRate":9212867.2,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"1025","egressBytes":"0","egressBitsRate":0,"ingressBytes":"492227445","ingressBitsRate":1093838.8},{"linkId":"2816","egressBytes":"4000074817","egressBitsRate":8889055.12,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"513","egressBytes":"0","egressBitsRate":0,"ingressBytes":"1444814826","ingressBitsRate":3210699.6},{"linkId":"768","egressBytes":"4370006099","egressBitsRate":9711124.64,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"512","egressBytes":"3894190397","egressBitsRate":8653756.4,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"769","egressBytes":"0","egressBitsRate":0,"ingressBytes":"1877580759","ingressBitsRate":4172401.68},{"linkId":"2304","egressBytes":"3767761711","egressBitsRate":8372803.84,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"1537","egressBytes":"0","egressBitsRate":0,"ingressBytes":"367986916","ingressBitsRate":817748.72},{"linkId":"1280","egressBytes":"4040444894","egressBitsRate":8978766.4,"ingressBytes":"0","ingressBitsRate":0},{"linkId":"2048","egressBytes":"4682050724","egressBitsRate":10404557.2,"ingressBytes":"0","ingressBitsRate":0}]},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20arrayJoin%28splitByChar%28%27_%27%2C%20concat%28toString%28common_egress_link_id%29%2C%20%27_%27%2C%20toString%28common_ingress_link_id%29%29%29%29%20AS%20link_id%2CSUM%28IF%28toString%28common_egress_link_id%29%20%3D%20link_id%2C%20traffic_outbound_byte%2C%200%29%29%20AS%20egress_bytes%2CSUM%28IF%28toString%28common_ingress_link_id%29%20%3D%20link_id%2C%20traffic_inbound_byte%2C%200%29%29%20AS%20ingress_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201675303793%20AND%20stat_time%20%3C%201675307393%20GROUP%20BY%20link_id&format=json&option=real-time","msg":"OK"}
}
const mockGet2 = {
  data: {"status":200,"code":200,"queryKey":"ee2e820b1275748167cdee82b2b4ea40","success":true,"message":null,"statistics":{"elapsed":3,"rows_read":11480,"bytes_read":618564,"result_size":1053,"result_rows":10},"job":null,"formatType":"json","meta":[{"name":"egress_link_direction","type":"string","category":"Dimension"},{"name":"ingress_link_direction","type":"string","category":"Dimension"},{"name":"egress_bytes","type":"long","category":"Metric"},{"name":"ingress_bytes","type":"long","category":"Metric"}],"data":{"resultType":"table","result":[{"egressLinkDirection":"太原","ingressLinkDirection":"西宁","egressBytes":"2407509269","egressBitsRate":5350020.56,"ingressBytes":"193368911","ingressBitsRate":429708.72},{"egressLinkDirection":"西安","ingressLinkDirection":"西安","egressBytes":"3609358392","egressBitsRate":8020796.4,"ingressBytes":"345009143","ingressBitsRate":766686.96},{"egressLinkDirection":"西宁","ingressLinkDirection":"西安","egressBytes":"1273508499","egressBitsRate":2830018.88,"ingressBytes":"122646511","ingressBitsRate":272547.84},{"egressLinkDirection":"太原","ingressLinkDirection":"太原","egressBytes":"14840136119","egressBitsRate":32978080.24,"ingressBytes":"3386427658","ingressBitsRate":7525394.8},{"egressLinkDirection":"西安","ingressLinkDirection":"太原","egressBytes":"7070361369","egressBitsRate":15711914.16,"ingressBytes":"1853445429","ingressBitsRate":4118767.6},{"egressLinkDirection":"西宁","ingressLinkDirection":"太原","egressBytes":"2619231460","egressBitsRate":5820514.32,"ingressBytes":"291561196","ingressBitsRate":647913.76},{"egressLinkDirection":"","ingressLinkDirection":"","egressBytes":"409939183007","egressBitsRate":910975962.24,"ingressBytes":"70387178681","ingressBitsRate":156415952.64},{"egressLinkDirection":"太原","ingressLinkDirection":"西安","egressBytes":"7808050741","egressBitsRate":17351223.84,"ingressBytes":"1001570985","ingressBitsRate":2225713.28},{"egressLinkDirection":"西宁","ingressLinkDirection":"西宁","egressBytes":"337068337","egressBitsRate":749040.72,"ingressBytes":"165230290","ingressBitsRate":367178.4},{"egressLinkDirection":"西安","ingressLinkDirection":"西宁","egressBytes":"1508798824","egressBitsRate":3352886.24,"ingressBytes":"133628244","ingressBitsRate":296951.68}]},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20egress_link_direction%20AS%20egress_link_direction%2C%20ingress_link_direction%20AS%20ingress_link_direction%2C%20SUM%28traffic_outbound_byte%29%20AS%20egress_bytes%2C%20SUM%28traffic_inbound_byte%29%20AS%20ingress_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201675303793%20AND%20stat_time%20%3C%201675307393%20GROUP%20BY%20egress_link_direction%2C%20ingress_link_direction&format=json&option=real-time","msg":"OK"}
}
const linkInfoData = [{"originalLinkId":"256","linkId":"Hundredgige1","direction":"egress","nextHop":"西安","bandwidth":100000000000},{"originalLinkId":"257","linkId":"Hundredgige1","direction":"ingress","nextHop":"西安","bandwidth":100000000000},{"originalLinkId":"512","linkId":"Hundredgige2","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"513","linkId":"Hundredgige2","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"768","linkId":"Hundredgige3","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"769","linkId":"Hundredgige3","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"1024","linkId":"Hundredgige4","direction":"egress","nextHop":"西宁","bandwidth":100000000000},{"originalLinkId":"1025","linkId":"Hundredgige4","direction":"ingress","nextHop":"西宁","bandwidth":100000000000},{"originalLinkId":"1280","linkId":"Hundredgige5","direction":"egress","nextHop":"西安","bandwidth":100000000000},{"originalLinkId":"1281","linkId":"Hundredgige5","direction":"ingress","nextHop":"西安","bandwidth":100000000000},{"originalLinkId":"1536","linkId":"Hundredgige6","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"1537","linkId":"Hundredgige6","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"1792","linkId":"Hundredgige7","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"1793","linkId":"Hundredgige7","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"2048","linkId":"Hundredgige8","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"2049","linkId":"Hundredgige8","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"2304","linkId":"Hundredgige9","direction":"egress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"2305","linkId":"Hundredgige9","direction":"ingress","nextHop":"太原","bandwidth":100000000000},{"originalLinkId":"2816","linkId":"Hundredgige10","direction":"egress","nextHop":"西安","bandwidth":100000000000},{"originalLinkId":"2817","linkId":"Hundredgige10","direction":"ingress","nextHop":"西安","bandwidth":100000000000}]
const linkInfo = JSON.stringify(linkInfoData)
const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}

var wrapper = null

/**
 * 进行axios请求，并挂载vue实例
 * @param list
 */
function axiosPostAndMounted (list) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })

  const data = list || mockGet1
  // 模拟axios返回数据
  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/link/overview/analysis':
        return Promise.resolve(data)
      case '/interface/link/overview/nextHopAnalysis':
        return Promise.resolve(mockGet2)
    }
  })

  // 模拟localStorage获取数据
  jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(key => linkInfo)

  // 加载vue组件，获得实例
  wrapper = mount(linkBlock, {
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/linkMonitor/LinkBlock.vue测试', () => {
  test('测试链路蜂窝图和下一跳蜂窝图从大到小排列', async () => {
    axiosPostAndMounted()

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(() => {
      const linkBlockTotal0 = wrapper.get('[test-id="linkBlockTotal0"]')
      const linkBlockTotal1 = wrapper.get('[test-id="linkBlockTotal1"]')
      const linkBlockTotal2 = wrapper.get('[test-id="linkBlockTotal2"]')
      const linkBlockTotal3 = wrapper.get('[test-id="linkBlockTotal3"]')
      const linkBlockTotal4 = wrapper.get('[test-id="linkBlockTotal4"]')
      const linkBlockTotal5 = wrapper.get('[test-id="linkBlockTotal5"]')
      const linkBlockTotal6 = wrapper.get('[test-id="linkBlockTotal6"]')
      const linkBlockTotal7 = wrapper.get('[test-id="linkBlockTotal7"]')
      const linkBlockTotal8 = wrapper.get('[test-id="linkBlockTotal8"]')
      const linkBlockTotal9 = wrapper.get('[test-id="linkBlockTotal9"]')

      expect(linkBlockTotal0.text()).toBe('13.88 Mbps')
      expect(linkBlockTotal1.text()).toBe('11.99 Mbps')
      expect(linkBlockTotal2.text()).toBe('11.86 Mbps')
      expect(linkBlockTotal3.text()).toBe('10.56 Mbps')
      expect(linkBlockTotal4.text()).toBe('10.49 Mbps')
      expect(linkBlockTotal5.text()).toBe('10.31 Mbps')
      expect(linkBlockTotal6.text()).toBe('10.19 Mbps')
      expect(linkBlockTotal7.text()).toBe('10.14 Mbps')
      expect(linkBlockTotal8.text()).toBe('9.85 Mbps')
      expect(linkBlockTotal9.text()).toBe('9.54 Mbps')

      const nextHopTotal0 = wrapper.get('[test-id="nextHopTotal0"]')
      const nextHopTotal1 = wrapper.get('[test-id="nextHopTotal1"]')
      const nextHopTotal2 = wrapper.get('[test-id="nextHopTotal2"]')

      expect(nextHopTotal0.text()).toBe('67.97 Mbps')
      expect(nextHopTotal1.text()).toBe('30.35 Mbps')
      expect(nextHopTotal2.text()).toBe('10.49 Mbps')
      resolve()
    }, 200))
  })
  test('鼠标移动到链路蜂窝图第一个，测试total显示', async () => {
    // 以"Hundredgige3"为例，对应出方向linkId为768，对应出方向流量为9711124.64
    // 对应入方向linkId为769，对应入方向流量为4172401.68，修改流量测试total
    const list = JSON.parse(JSON.stringify(mockGet1))
    list.data.data.result[14].egressBitsRate = 9000000.00
    list.data.data.result[16].ingressBitsRate = 4000000.00

    axiosPostAndMounted(list)

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(() => {
      const linkBlockTotal0 = wrapper.get('[test-id="linkBlockTotal0"]')
      const linkBlockEgressUsage0 = wrapper.get('[test-id="linkBlockEgressUsage0"]')
      const linkBlockIngressUsage0 = wrapper.get('[test-id="linkBlockIngressUsage0"]')

      expect(linkBlockTotal0.text()).toBe('13 Mbps')
      expect(linkBlockEgressUsage0.text()).toBe('< 0.01%')
      expect(linkBlockIngressUsage0.text()).toBe('< 0.01%')
      resolve()
    }, 200))
  })
  test('鼠标移动到链路蜂窝图第一个，测试出入流量占比', async () => {
    // 以"Hundredgige3"为例，修改其出入流量为100000000000，测试上行流量占比为100%，下行占比为0%的情况
    const list = JSON.parse(JSON.stringify(mockGet1))
    list.data.data.result[14].egressBitsRate = 100000000000.00
    list.data.data.result[16].ingressBitsRate = 0

    axiosPostAndMounted(list)

    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await new Promise(resolve => setTimeout(() => {
      const linkBlockTotal0 = wrapper.get('[test-id="linkBlockTotal0"]')
      const linkBlockEgressUsage0 = wrapper.get('[test-id="linkBlockEgressUsage0"]')
      const linkBlockIngressUsage0 = wrapper.get('[test-id="linkBlockIngressUsage0"]')

      expect(linkBlockTotal0.text()).toBe('100 Gbps')
      expect(linkBlockEgressUsage0.text()).toBe('100.00%')
      expect(linkBlockIngressUsage0.text()).toBe('0%')
      resolve()
    }, 200))
  })
})
