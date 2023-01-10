import NetworkOverviewLine from '@/views/charts2/charts/networkOverview/NetworkOverviewLine'
import { mount } from '@vue/test-utils'
import axios from 'axios'

const mockGet = {
  data: {"status":200,"code":200,"success":true,"message":null,"formatType":"json","data":{"resultType":"object","result":[{"type":"bytes","totalBitsRate":{"values":[[1673247564,"96801019.52"]],"analysis":{"avg":"112042808.24","max":"301842105.76","min":"52096324","p95":"168089003.35199997"}},"inboundBitsRate":{"values":[[1673247564,"11814508.48"]],"analysis":{"avg":"18587597.36","max":"137528138.88","min":"3181142.88","p95":"49561521.447999954"}},"outboundBitsRate":{"values":[[1673247564,"84282965.52"]],"analysis":{"avg":"87557861.44","max":"290402258","min":"45337684.48","p95":"121041718.81199999"}},"internalBitsRate":{"values":[[1673247564,"9125.12"]],"analysis":{"avg":"278114.32","max":"2215460.48","min":"0","p95":"923494.5719999998"}},"throughBitsRate":{"values":[[1673247564,"694420.48"]],"analysis":{"avg":"5619235.12","max":"42455480.24","min":"262607.76","p95":"13559588.195999999"}},"other":{"values":[[1673247564,"0.00"]],"analysis":{"avg":"0.01","max":"0.08","min":"0.00","p95":"0.08"}}},{"type":"packets","totalPacketsRate":{"values":[[1673247564,"12077.53"]],"analysis":{"avg":"14062.37","max":"32840.42","min":"6564.17","p95":"20923.167999999987"}},"inboundPacketsRate":{"values":[[1673247564,"3865.58"]],"analysis":{"avg":"4241.61","max":"15460.03","min":"1918.22","p95":"8549.799999999997"}},"outboundPacketsRate":{"values":[[1673247564,"8118.89"]],"analysis":{"avg":"9170.98","max":"27134.58","min":"4510.25","p95":"13690.540999999996"}},"internalPacketsRate":{"values":[[1673247564,"15.89"]],"analysis":{"avg":"35.95","max":"276.47","min":"0.00","p95":"122.49749999999999"}},"throughPacketsRate":{"values":[[1673247564,"77.17"]],"analysis":{"avg":"613.82","max":"3768.56","min":"42.92","p95":"1279.757499999999"}},"other":{"values":[[1673247564,"0.00"]],"analysis":{"avg":"0","max":"0.01","min":"0.00","p95":"0.01"}}},{"type":"sessions","totalSessionsRate":{"values":[[1673247564,"29.92"]],"analysis":{"avg":"29.89","max":"29.92","min":"29.67","p95":"29.92"}}}]},"msg":"OK"}
}

describe('NetworkOverviewLine.vue测试', () => {
  test('Metric=Bits/s', async () => {
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NetworkOverviewLine, {
      propsData: {
        timeFilter: {
          dateRangeValue: -1,
          startTime: 1673244000000,
          endTime: 1673247600000
        },
        chart: {"id":1,"name":"network overview line","i18n":"","panelId":1,"pid":0,"type":102,"x":0,"y":0,"w":19,"h":6,"params":{},"cby":1,"ctime":"2022-07-06 16:59:22","uby":1,"utime":"2022-07-06 16:59:22","remark":"","state":1,"system":0,"buildIn":0,"uuser":{"id":1,"name":null,"username":"admin","salt":null,"lang":null,"theme":null,"lastLoginIp":null,"lastLoginTime":null,"ctime":null,"cby":null,"email":null,"mobile":null,"status":null,"source":null,"buildIn":null,"roleIds":null,"usergroupIds":null,"roles":null,"apiKeyId":null},"cuser":{"id":1,"name":null,"username":"admin","salt":null,"lang":null,"theme":null,"lastLoginIp":null,"lastLoginTime":null,"ctime":null,"cby":null,"email":null,"mobile":null,"status":null,"source":null,"buildIn":null,"roleIds":null,"usergroupIds":null,"roles":null,"apiKeyId":null},"children":[],"parent":null,"panel":{"id":1,"name":"Network Overview","i18n":null,"type":null,"params":null,"cby":null,"ctime":null,"uby":null,"utime":null,"remark":null,"state":null,"buildIn":null,"uuser":null,"cuser":null},"i":1,"category":"echarts","firstShow":false,"moved":false}
      }
    })
    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')
    // 延迟1秒等待渲染。使用wrapper.vm.$nextTick有时不管用
    await new Promise(resolve => setTimeout(() => {
      expect(textNode0.text()).toEqual('112.04Mbps')
      expect(textNode1.text()).toEqual('18.59Mbps')
      expect(textNode2.text()).toEqual('87.56Mbps')
      resolve()
    }, 1000))
  })
  test('Metric=Packets/s', async () => {
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NetworkOverviewLine, {
      propsData: {
        timeFilter: {
          dateRangeValue: -1,
          startTime: 1673244000000,
          endTime: 1673247600000
        },
        metric: 'Packets/s',
        chart: {"id":1,"name":"network overview line","i18n":"","panelId":1,"pid":0,"type":102,"x":0,"y":0,"w":19,"h":6,"params":{},"cby":1,"ctime":"2022-07-06 16:59:22","uby":1,"utime":"2022-07-06 16:59:22","remark":"","state":1,"system":0,"buildIn":0,"uuser":{"id":1,"name":null,"username":"admin","salt":null,"lang":null,"theme":null,"lastLoginIp":null,"lastLoginTime":null,"ctime":null,"cby":null,"email":null,"mobile":null,"status":null,"source":null,"buildIn":null,"roleIds":null,"usergroupIds":null,"roles":null,"apiKeyId":null},"cuser":{"id":1,"name":null,"username":"admin","salt":null,"lang":null,"theme":null,"lastLoginIp":null,"lastLoginTime":null,"ctime":null,"cby":null,"email":null,"mobile":null,"status":null,"source":null,"buildIn":null,"roleIds":null,"usergroupIds":null,"roles":null,"apiKeyId":null},"children":[],"parent":null,"panel":{"id":1,"name":"Network Overview","i18n":null,"type":null,"params":null,"cby":null,"ctime":null,"uby":null,"utime":null,"remark":null,"state":null,"buildIn":null,"uuser":null,"cuser":null},"i":1,"category":"echarts","firstShow":false,"moved":false}
      }
    })
    const textNode0 = await wrapper.get('[test-id="tabContent0"]')
    const textNode1 = await wrapper.get('[test-id="tabContent1"]')
    const textNode2 = await wrapper.get('[test-id="tabContent2"]')
    await new Promise(res => setTimeout(() => {
      expect(textNode0.text()).toEqual('14.06Kpackets/s')
      expect(textNode1.text()).toEqual('4.24Kpackets/s')
      expect(textNode2.text()).toEqual('9.17Kpackets/s')
      res()
    }, 1000))
  })
})
