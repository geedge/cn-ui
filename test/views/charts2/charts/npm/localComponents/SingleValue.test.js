import SingleValue from '@/views/charts2/charts/npm/localComponents/SingleValue'
import { mount } from '@vue/test-utils'

const npmNetworkName = [
  { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
  { name: 'networkAppPerformance.httpResponse' },
  { name: 'networkAppPerformance.sslResponseLatency' },
  { name: 'networkAppPerformance.packetLoss' },
  { name: 'overall.packetRetrans' }
]
const npmNetworkData = [
  {
    "establishLatencyMsAvg": 90,
    "establishLatencyMsP50": 49,
    "establishLatencyMsP90": 91,
    "establishLatencyMsP95": 164,
    "establishLatencyMsP99": 727,
    "value": -0.01098901098901099
  },
  {
    "httpResponseLatencyAvg": 178,
    "httpResponseLatencyP50": 57,
    "httpResponseLatencyP90": 121,
    "httpResponseLatencyP95": 256,
    "httpResponseLatencyP99": 1616,
    "value": 0.017142857142857144
  },
  {
    "sslConLatencyAvg": 0,
    "sslConLatencyP50": 0,
    "sslConLatencyP90": 0,
    "sslConLatencyP95": 0,
    "sslConLatencyP99": 0,
    "value": "-"
  },
  {
    "tcpLostlenPercentAvg": 0.0088,
    "tcpLostlenPercentP50": 0.0057,
    "tcpLostlenPercentP90": 0.0184,
    "tcpLostlenPercentP95": 0.0226,
    "tcpLostlenPercentP99": 0.0397,
    "value": 0.10000000000000005
  },
  {
    "pktRetransPercentAvg": 0.0388,
    "pktRetransPercentP50": 0.0341,
    "pktRetransPercentP90": 0.0614,
    "pktRetransPercentP95": 0.0691,
    "pktRetransPercentP99": 0.0853,
    "value": 0
  }
]

describe('views/charts2/charts/npm/localComponents/SingleValue.vue测试', () => {
  test('Npm概况信息：服务质量图', async () => {
    // 加载vue组件，获得实例
    const wrapper = mount(SingleValue, {
      propsData: {
        npmNetworkName,
        npmNetworkData
      }
    })
    // 延迟等待渲染。使用wrapper.vm.$nextTick有时不管用（例如组件中使用了setTimeout的时候）
    await wrapper.vm.$nextTick(() => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('90 ms')
      expect(textNode1.text()).toEqual('178 ms')
      expect(textNode2.text()).toEqual('0 ms')
      expect(textNode3.text()).toEqual('0.88 %')
      expect(textNode4.text()).toEqual('3.88 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      /*
       * 当元素存在的时候，find 和 get 是一样的；
       * 当找不到元素的时候:
       *    (1) find 会返回 null, 不会报错，case 通过
       *    (2) get 会报错，case 失败
       * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
       */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')

      expect(trendIconNode0.classes()).toContain('cn-icon-decline')
      expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2 === null)
      expect(trendIconNode3.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode4.classes()).toContain('cn-icon-constant')

      const trendValueNode0 = wrapper.get('[test-id="singleValueTrendValue0"]')
      const trendValueNode1 = wrapper.get('[test-id="singleValueTrendValue1"]')
      const trendValueNode2 = wrapper.find('[test-id="singleValueTrendValue2"]')
      const trendValueNode3 = wrapper.get('[test-id="singleValueTrendValue3"]')
      const trendValueNode4 = wrapper.find('[test-id="singleValueTrendValue4"]')

      expect(trendValueNode0.text()).toEqual('-1.10%')
      expect(trendValueNode1.text()).toEqual('1.71%')
      expect(trendValueNode2 === null)
      expect(trendValueNode3.text()).toEqual('10.00%')
      expect(trendValueNode4 === null)

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95:164 ms')
      expect(p95Node1.text()).toEqual('P95:256 ms')
      expect(p95Node2.text()).toEqual('P95:0 ms')
      expect(p95Node3.text()).toEqual('P95:2.26 %')
      expect(p95Node4.text()).toEqual('P95:6.91 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99:727 ms')
      expect(p99Node1.text()).toEqual('P99:1.62 s')
      expect(p99Node2.text()).toEqual('P99:0 ms')
      expect(p99Node3.text()).toEqual('P99:3.97 %')
      expect(p99Node4.text()).toEqual('P99:8.53 %')
    })
  })
})
