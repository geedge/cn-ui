import NpmAppCategoryScore from '@/views/charts2/charts/npm/NpmAppCategoryScore'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from 'element-plus'

const mockGet1 = {
  data: {"status":200,"code":200,"queryKey":"85bef15c1d30074bd716a1e95ba98b71","success":true,"message":null,"statistics":{"elapsed":3,"rows_read":8239,"bytes_read":1130060,"result_size":1550,"result_rows":6},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"total_bytes","type":"long","category":"Metric"},{"name":"inbound_bytes","type":"long","category":"Metric"},{"name":"outbound_bytes","type":"long","category":"Metric"},{"name":"internal_bytes","type":"long","category":"Metric"},{"name":"through_bytes","type":"long","category":"Metric"},{"name":"total_packets","type":"long","category":"Metric"},{"name":"inbound_packets","type":"long","category":"Metric"},{"name":"outbound_packets","type":"long","category":"Metric"},{"name":"internal_packets","type":"long","category":"Metric"},{"name":"through_packets","type":"long","category":"Metric"},{"name":"sessions","type":"long","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","totalBytes":"1198357","totalBitsRate":2663.04,"inboundBytes":"209590","inboundBitsRate":465.76,"outboundBytes":"868709","outboundBitsRate":1930.48,"internalBytes":"0","internalBitsRate":0,"throughBytes":"17814","throughBitsRate":39.6,"totalPackets":"2125","totalPacketsRate":"0.59","inboundPackets":"295","inboundPacketsRate":"0.08","outboundPackets":"705","outboundPacketsRate":"0.20","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"29","throughPacketsRate":"0.01","sessions":"49","sessionsRate":"0.01"},{"appSubcategory":"email","totalBytes":"524260","totalBitsRate":1165.04,"inboundBytes":"485307","inboundBitsRate":1078.48,"outboundBytes":"0","outboundBitsRate":0,"internalBytes":"0","internalBitsRate":0,"throughBytes":"0","throughBitsRate":0,"totalPackets":"621","totalPacketsRate":"0.17","inboundPackets":"380","inboundPacketsRate":"0.11","outboundPackets":"0","outboundPacketsRate":"0.00","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"0","throughPacketsRate":"0.00","sessions":"6","sessionsRate":"0.00"},{"appSubcategory":"file-sharing","totalBytes":"287808020","totalBitsRate":639573.36,"inboundBytes":"383569","inboundBitsRate":852.4,"outboundBytes":"283158589","outboundBitsRate":629241.28,"internalBytes":"150","internalBitsRate":0.32,"throughBytes":"103241","throughBitsRate":229.44,"totalPackets":"243319","totalPacketsRate":"67.59","inboundPackets":"1184","inboundPacketsRate":"0.33","outboundPackets":"206409","outboundPacketsRate":"57.34","internalPackets":"2","internalPacketsRate":"0.00","throughPackets":"1555","throughPacketsRate":"0.43","sessions":"655","sessionsRate":"0.18"},{"appSubcategory":"voip-video","totalBytes":"1394859","totalBitsRate":3099.68,"inboundBytes":"1309","inboundBitsRate":2.88,"outboundBytes":"1306937","outboundBitsRate":2904.32,"internalBytes":"55505","internalBitsRate":123.36,"throughBytes":"0","throughBitsRate":0,"totalPackets":"1249","totalPacketsRate":"0.35","inboundPackets":"9","inboundPacketsRate":"0.00","outboundPackets":"964","outboundPacketsRate":"0.27","internalPackets":"47","internalPacketsRate":"0.01","throughPackets":"0","throughPacketsRate":"0.00","sessions":"37","sessionsRate":"0.01"},{"appSubcategory":"multimedia-streaming","totalBytes":"20753258085","totalBitsRate":46118351.28,"inboundBytes":"885592886","inboundBitsRate":1967984.16,"outboundBytes":"18584773000","outboundBitsRate":41299495.52,"internalBytes":"1239219","internalBitsRate":2753.84,"throughBytes":"862004543","throughBitsRate":1915565.68,"totalPackets":"19072293","totalPacketsRate":"5297.86","inboundPackets":"622206","inboundPacketsRate":"172.84","outboundPackets":"13193955","outboundPacketsRate":"3664.99","internalPackets":"1093","internalPacketsRate":"0.30","throughPackets":"762869","throughPacketsRate":"211.91","sessions":"18867","sessionsRate":"5.24"},{"appSubcategory":"social-networking","totalBytes":"324162","totalBitsRate":720.4,"inboundBytes":"39911","inboundBitsRate":88.72,"outboundBytes":"218503","outboundBitsRate":485.6,"internalBytes":"0","internalBitsRate":0,"throughBytes":"0","throughBitsRate":0,"totalPackets":"729","totalPacketsRate":"0.20","inboundPackets":"99","inboundPacketsRate":"0.03","outboundPackets":"291","outboundPacketsRate":"0.08","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"0","throughPacketsRate":"0.00","sessions":"28","sessionsRate":"0.01"}]},"originalUrl":"http://192.168.44.55:9999?query=%20%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%29%20AS%20total_bytes%2C%20SUM%28traffic_inbound_byte%29%20AS%20inbound_bytes%2C%20SUM%28traffic_outbound_byte%29%20AS%20outbound_bytes%2C%20SUM%28traffic_internal_byte%29%20AS%20internal_bytes%2C%20SUM%28traffic_through_byte%29%20AS%20through_bytes%2C%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%20AS%20total_packets%2C%20SUM%28traffic_inbound_pkt%29%20AS%20inbound_packets%2C%20SUM%28traffic_outbound_pkt%29%20AS%20outbound_packets%2C%20SUM%28traffic_internal_pkt%29%20AS%20internal_packets%2C%20SUM%28traffic_through_pkt%29%20AS%20through_packets%2C%20SUM%28common_sessions%29%20AS%20sessions%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201674956525-3600%20AND%20stat_time%20%3C%201674960125-3600%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}
const mockGet2 = {
  data: {"status":200,"code":200,"queryKey":"afa724c5532a078ad0ca2bc52b834e2e","success":true,"message":null,"statistics":{"elapsed":7,"rows_read":9931,"bytes_read":1362019,"result_size":1550,"result_rows":6},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"total_bytes","type":"long","category":"Metric"},{"name":"inbound_bytes","type":"long","category":"Metric"},{"name":"outbound_bytes","type":"long","category":"Metric"},{"name":"internal_bytes","type":"long","category":"Metric"},{"name":"through_bytes","type":"long","category":"Metric"},{"name":"total_packets","type":"long","category":"Metric"},{"name":"inbound_packets","type":"long","category":"Metric"},{"name":"outbound_packets","type":"long","category":"Metric"},{"name":"internal_packets","type":"long","category":"Metric"},{"name":"through_packets","type":"long","category":"Metric"},{"name":"sessions","type":"long","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"multimedia-streaming","totalBytes":"21278548763","totalBitsRate":47285663.92,"inboundBytes":"785312903","inboundBitsRate":1745139.76,"outboundBytes":"19030565618","outboundBitsRate":42290145.84,"internalBytes":"3319150","internalBitsRate":7375.92,"throughBytes":"1046422310","throughBitsRate":2325382.88,"totalPackets":"19448513","totalPacketsRate":"5402.36","inboundPackets":"542606","inboundPacketsRate":"150.72","outboundPackets":"13518174","outboundPacketsRate":"3755.05","internalPackets":"2774","internalPacketsRate":"0.77","throughPackets":"907519","throughPacketsRate":"252.09","sessions":"18844","sessionsRate":"5.23"},{"appSubcategory":"file-sharing","totalBytes":"332811699","totalBitsRate":739581.52,"inboundBytes":"1672996","inboundBitsRate":3717.76,"outboundBytes":"324802448","outboundBitsRate":721783.2,"internalBytes":"0","internalBitsRate":0,"throughBytes":"75036","throughBitsRate":166.72,"totalPackets":"294049","totalPacketsRate":"81.68","inboundPackets":"2512","inboundPacketsRate":"0.70","outboundPackets":"238868","outboundPacketsRate":"66.35","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"1086","throughPacketsRate":"0.30","sessions":"565","sessionsRate":"0.16"},{"appSubcategory":"voip-video","totalBytes":"16159697","totalBitsRate":35910.4,"inboundBytes":"9983","inboundBitsRate":22.16,"outboundBytes":"16024232","outboundBitsRate":35609.44,"internalBytes":"11691","internalBitsRate":26,"throughBytes":"0","throughBitsRate":0,"totalPackets":"12250","totalPacketsRate":"3.40","inboundPackets":"63","inboundPacketsRate":"0.02","outboundPackets":"11168","outboundPacketsRate":"3.10","internalPackets":"15","internalPacketsRate":"0.00","throughPackets":"0","throughPacketsRate":"0.00","sessions":"46","sessionsRate":"0.01"},{"appSubcategory":"gaming","totalBytes":"2011572","totalBitsRate":4470.16,"inboundBytes":"85755","inboundBitsRate":190.56,"outboundBytes":"1809947","outboundBitsRate":4022.08,"internalBytes":"0","internalBitsRate":0,"throughBytes":"972","throughBitsRate":2.16,"totalPackets":"2157","totalPacketsRate":"0.60","inboundPackets":"249","inboundPacketsRate":"0.07","outboundPackets":"1336","outboundPacketsRate":"0.37","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"9","throughPacketsRate":"0.00","sessions":"47","sessionsRate":"0.01"},{"appSubcategory":"social-networking","totalBytes":"386093","totalBitsRate":858,"inboundBytes":"804","inboundBitsRate":176,"outboundBytes":"343729","outboundBitsRate":763.84,"internalBytes":"0","internalBitsRate":0,"throughBytes":"0","throughBitsRate":0,"totalPackets":"794","totalPacketsRate":"0.22","inboundPackets":"12","inboundPacketsRate":"0.00","outboundPackets":"436","outboundPacketsRate":"0.12","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"0","throughPacketsRate":"0.00","sessions":"34","sessionsRate":"0.01"},{"appSubcategory":"email","totalBytes":"33128","totalBitsRate":73.6,"inboundBytes":"21144","inboundBitsRate":46.96,"outboundBytes":"4069","outboundBitsRate":9.04,"internalBytes":"0","internalBitsRate":0,"throughBytes":"0","throughBitsRate":0,"totalPackets":"93","totalPacketsRate":"0.03","inboundPackets":"46","inboundPacketsRate":"0.01","outboundPackets":"7","outboundPacketsRate":"0.00","internalPackets":"0","internalPacketsRate":"0.00","throughPackets":"0","throughPacketsRate":"0.00","sessions":"6","sessionsRate":"0.00"}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%29%20AS%20total_bytes%2C%20SUM%28traffic_inbound_byte%29%20AS%20inbound_bytes%2C%20SUM%28traffic_outbound_byte%29%20AS%20outbound_bytes%2C%20SUM%28traffic_internal_byte%29%20AS%20internal_bytes%2C%20SUM%28traffic_through_byte%29%20AS%20through_bytes%2C%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%20AS%20total_packets%2C%20SUM%28traffic_inbound_pkt%29%20AS%20inbound_packets%2C%20SUM%28traffic_outbound_pkt%29%20AS%20outbound_packets%2C%20SUM%28traffic_internal_pkt%29%20AS%20internal_packets%2C%20SUM%28traffic_through_pkt%29%20AS%20through_packets%2C%20SUM%28common_sessions%29%20AS%20sessions%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201674956525%20AND%20stat_time%20%3C%201674960125%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20%20ORDER%20BY%20total_bytes%20desc%20%20%20&format=json&option=real-time","msg":"OK"}
}
const mockGet3 = {
  data: {"status":200,"code":200,"queryKey":"4492575d70af04eca0829f4cf049c523","success":true,"message":null,"statistics":{"elapsed":2,"rows_read":7960,"bytes_read":335660,"result_size":311,"result_rows":5},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"establish_latency_ms","type":"double","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","establishLatencyMs":80.2037},{"appSubcategory":"file-sharing","establishLatencyMs":186.7609},{"appSubcategory":"voip-video","establishLatencyMs":61},{"appSubcategory":"multimedia-streaming","establishLatencyMs":95.5483},{"appSubcategory":"social-networking","establishLatencyMs":51.0179}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20ROUND%28AVG%28avg_establish_latency_ms%29%2C%204%29%20AS%20establish_latency_ms%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201675144350%20AND%20stat_time%20%3C%201675147950%20AND%20isNotNull%28avg_establish_latency_ms%29%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}
const mockGet4 = {
  data: {"status":200,"code":200,"queryKey":"8141b611155bb7eac75b6be6da314b79","success":true,"message":null,"statistics":{"elapsed":1,"rows_read":7960,"bytes_read":335660,"result_size":258,"result_rows":4},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"http_response_latency","type":"double","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","httpResponseLatency":49.9375},{"appSubcategory":"file-sharing","httpResponseLatency":304.75},{"appSubcategory":"multimedia-streaming","httpResponseLatency":319.011},{"appSubcategory":"social-networking","httpResponseLatency":55.4423}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20ROUND%28AVG%28avg_http_response_latency_ms%29%2C%204%29%20AS%20http_response_latency%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201675144350%20AND%20stat_time%20%3C%201675147950%20AND%20isNotNull%28avg_http_response_latency_ms%29%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}
const mockGet5 = {
  data: {"status":200,"code":200,"queryKey":"df80ef09ef60ddc6da8343edd5699796","success":true,"message":null,"statistics":{"elapsed":2,"rows_read":7960,"bytes_read":335660,"result_size":209,"result_rows":4},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"ssl_con_latency","type":"double","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","sslConLatency":0},{"appSubcategory":"voip-video","sslConLatency":0},{"appSubcategory":"multimedia-streaming","sslConLatency":0},{"appSubcategory":"social-networking","sslConLatency":0}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20ROUND%28AVG%28avg_ssl_con_latency_ms%29%2C%204%29%20AS%20ssl_con_latency%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201675144350%20AND%20stat_time%20%3C%201675147950%20AND%20isNotNull%28avg_ssl_con_latency_ms%29%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}
const mockGet6 = {
  data: {"status":200,"code":200,"queryKey":"209ee36ddba970fef15d8347acbb45d1","success":true,"message":null,"statistics":{"elapsed":2,"rows_read":7960,"bytes_read":335660,"result_size":289,"result_rows":5},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"tcp_lostlen_percent","type":"double","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","tcpLostlenPercent":0},{"appSubcategory":"file-sharing","tcpLostlenPercent":0},{"appSubcategory":"voip-video","tcpLostlenPercent":0},{"appSubcategory":"multimedia-streaming","tcpLostlenPercent":0.006},{"appSubcategory":"social-networking","tcpLostlenPercent":0.0208}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20ROUND%28AVG%28tcp_lostlen_ratio%29%2C%204%29%20AS%20tcp_lostlen_percent%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201675144350%20AND%20stat_time%20%3C%201675147950%20AND%20isNotNull%28tcp_lostlen_ratio%29%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}
const mockGet7 = {
  data: {"status":200,"code":200,"queryKey":"bc04f2b6120feeb9eee2d83640475447","success":true,"message":null,"statistics":{"elapsed":2,"rows_read":7960,"bytes_read":335660,"result_size":295,"result_rows":5},"job":null,"formatType":"json","meta":[{"name":"app_subcategory","type":"string","category":"Dimension"},{"name":"pkt_retrans_percent","type":"double","category":"Metric"}],"data":{"resultType":"object","result":[{"appSubcategory":"gaming","pktRetransPercent":0.0023},{"appSubcategory":"file-sharing","pktRetransPercent":0},{"appSubcategory":"voip-video","pktRetransPercent":0},{"appSubcategory":"multimedia-streaming","pktRetransPercent":0.0171},{"appSubcategory":"social-networking","pktRetransPercent":0.0003}]},"originalUrl":"http://192.168.44.55:9999?query=%20SELECT%20app_subcategory%20AS%20app_subcategory%2C%20ROUND%28AVG%28pkt_retrans_ratio%29%2C%204%29%20AS%20pkt_retrans_percent%20FROM%20metric_application%20WHERE%20stat_time%20%3E%3D%201675144350%20AND%20stat_time%20%3C%201675147950%20AND%20isNotNull%28pkt_retrans_ratio%29%20AND%20app_subcategory%20IN%20%28%27multimedia-streaming%27%2C%27social-networking%27%2C%27file-sharing%27%2C%27gaming%27%2C%27email%27%2C%27voip-video%27%29%20GROUP%20BY%20app_subcategory%20&format=json&option=real-time","msg":"OK"}
}

// 实例，使用var提升变量，供下面调用
var wrapper = null

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1673244000000,
  endTime: 1673247600000
}

/**
 * 进行axios请求，并挂载vue实例
 * @param list
 */
function axiosPostAndMounted (list) {
  require('vue-router').useRoute.mockReturnValue({ query: {} })
  require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })

  // 模拟Promise.all批量请求，分开请求
  list ? axios.get.mockResolvedValueOnce(list) : axios.get.mockResolvedValueOnce(mockGet1)
  axios.get.mockResolvedValueOnce(mockGet2)

  axios.get.mockImplementation(url => {
    switch (url) {
      case '/interface/application/performance/overview/appTcpSessionDelay':
        return Promise.resolve(mockGet3)
      case '/interface/application/performance/overview/appHttpResponseDelay':
        return Promise.resolve(mockGet4)
      case '/interface/application/performance/overview/appSslConDelay':
        return Promise.resolve(mockGet5)
      case '/interface/application/performance/overview/appTcpLostlenPercent':
        return Promise.resolve(mockGet6)
      case '/interface/application/performance/overview/appPacketRetransPercent':
        return Promise.resolve(mockGet7)
    }
  })

  // 加载vue组件，获得实例
  wrapper = mount(NpmAppCategoryScore, {
    global: {
      plugins: [ElementPlus]
    },
    propsData: {
      timeFilter
    }
  })
}

describe('views/charts2/charts/npm/NpmAppCategoryScore.vue测试', () => {
  test('NpmAppCategoryScore测试score列分数显示', async () => {
    // 调用axios请求，并加载实例
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的分数列
      const textNode0 = wrapper.find('[test-id="score-gaming"]')
      const textNode1 = wrapper.find('[test-id="score-email"]')
      const textNode2 = wrapper.find('[test-id="score-file-sharing"]')
      const textNode3 = wrapper.find('[test-id="score-voip-video"]')
      const textNode4 = wrapper.find('[test-id="score-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="score-social-networking"]')

      expect(textNode0.text()).toBe('6')
      expect(textNode1.text()).toBe('-')
      expect(textNode2.text()).toBe('5')
      expect(textNode3.text()).toBe('6')
      expect(textNode4.text()).toBe('5')
      expect(textNode5.text()).toBe('6')
      resolve()
    }, 200))
  })
  test('NpmAppCategoryScore测试分类不足6个时icon的class类名是否正确', async () => {
    // 模拟分类不足6个的情况
    const obj = JSON.parse(JSON.stringify(mockGet1))
    obj.data.data.result.splice(5, 1)

    // 调用axios请求，并加载实例
    axiosPostAndMounted(obj)

    await new Promise(resolve => setTimeout(() => {
      const iconNode0 = wrapper.find('[test-id="iconContent0"]')
      const iconNode1 = wrapper.find('[test-id="iconContent1"]')
      const iconNode2 = wrapper.find('[test-id="iconContent2"]')
      const iconNode3 = wrapper.find('[test-id="iconContent3"]')
      const iconNode4 = wrapper.find('[test-id="iconContent4"]')
      // const iconNode5 = wrapper.find('[test-id="iconContent5"]')

      expect(iconNode0.classes()).toContain('cn-icon-gaming')
      expect(iconNode1.classes()).toContain('cn-icon-email')
      expect(iconNode2.classes()).toContain('cn-icon-file-sharing')
      expect(iconNode3.classes()).toContain('cn-icon-voip')
      expect(iconNode4.classes()).toContain('cn-icon-video')
      // expect(iconNode5.classes()).toContain('cn-icon-social-network')
      resolve()
    }, 200))
  })
  test('NpmAppCategoryScore测试Inound同比超500%或无上周情况等', async () => {
    const prev0 = mockGet1.data.data.result.find(p => p.appSubcategory === 'multimedia-streaming')
    const prev1 = mockGet2.data.data.result.find(p => p.appSubcategory === 'social-networking')
    // 设置multimedia-streaming行(即video)上周期无数据
    prev0.inboundBitsRate = 0
    // 设置Social Network行(即network)的输入>500%
    prev1.inboundBitsRate = 1.76

    // 调用axios请求，并加载实例
    axiosPostAndMounted()

    await new Promise(resolve => setTimeout(() => {
      // 右侧表格的inbound列
      // const textNode0 = wrapper.find('[test-id="inbound-gaming"]')
      // const textNode1 = wrapper.find('[test-id="inbound-email"]')
      // const textNode2 = wrapper.find('[test-id="inbound-file-sharing"]')
      // const textNode3 = wrapper.find('[test-id="inbound-voip-video"]')
      const textNode4 = wrapper.find('[test-id="inbound-multimedia-streaming"]')
      const textNode5 = wrapper.find('[test-id="inbound-social-networking"]')

      expect(textNode4.text()).toBe('100.00%')
      expect(textNode5.text()).toBe('>500.00%')
      resolve()
    }, 200))
  })
})
