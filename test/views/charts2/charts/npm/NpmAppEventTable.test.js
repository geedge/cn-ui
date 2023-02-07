import NpmAppEventTable from '@/views/charts2/charts/npm/NpmAppEventTable'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import ElementPlus from "element-plus"

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675558657,
  endTime: 1675731457
}

const mockGet = {
  data: {"status":200,"code":200,"queryKey":"88eeb92e0ddb40c0327db494cfe5c74c","success":true,"message":null,"statistics":{"elapsed":0,"rows_read":2,"result_size":752,"result_rows":10},"job":null,"formatType":"json","meta":[{"name":"app_name","type":"string","category":"Dimension"},{"name":"event_severity","type":"string","category":"Dimension"},{"name":"event_type","type":"string","category":"Dimension"},{"name":"count","type":"long","category":"Metric"}],"data":{"resultType":"table","result":[{"appName":"youku","eventSeverity":"info","eventType":"http error","count":6},{"appName":"uplive","eventSeverity":"critical","eventType":"http error","count":5},{"appName":"youku","eventSeverity":"low","eventType":"http error","count":4},{"appName":"apple_hls","eventSeverity":"info","eventType":"http error","count":3},{"appName":"apple_hls","eventSeverity":"low","eventType":"http error","count":3},{"appName":"apple_hls","eventSeverity":"medium","eventType":"http error","count":2},{"appName":"uplive","eventSeverity":"high","eventType":"http error","count":2},{"appName":"windows_update","eventSeverity":"medium","eventType":"http error","count":2},{"appName":"apple_hls","eventSeverity":"critical","eventType":"http error","count":1},{"appName":"cloudflare","eventSeverity":"info","eventType":"http error","count":1}]},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20app_name%20AS%20app_name%2C%20event_severity%20AS%20event_severity%2C%20event_type%20AS%20event_type%2C%20COUNT%28*%29%20AS%20count%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675580110%20AND%20end_time%20%3C%201675752910%20AND%20entity_type%20%3D%20%27app%27%20GROUP%20BY%20app_name%2Cevent_severity%2Cevent_type%20ORDER%20BY%20count%20DESC%20%20LIMIT%2010%20&format=json&option=real-time","msg":"OK"}
}

describe('views/charts2/charts/npm/NpmAppEventTable.vue测试', () => {
  test('Npm 事件：APP事件信息表格 严重程度色块验证', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmAppEventTable, {
      global: {
        plugins: [ElementPlus]
      },
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      // critical
      let criticalArray = [1,8]
      for(let index=0; index < criticalArray.length; index++){
        let rowIndex = criticalArray[index]
        for(let i=1; i<=5 ; i++){
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
      }

      // high
      let highArray = [6]
      for(let index=0; index < highArray.length; index++){
        let rowIndex = highArray[index]
        for(let i=1; i<=4 ; i++){
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for(let i=5; i<=5 ; i++){
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // medium
      let mediumArray = [5,7]
      for(let index=0; index < mediumArray.length; index++){
        let rowIndex = mediumArray[index]
        for(let i=1; i<=3 ; i++){
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for(let i=4; i<=5 ; i++){
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // low
      let lowArray = [2,4]
      for(let index=0; index < lowArray.length; index++){
        let rowIndex = lowArray[index]
        for(let i=1; i<=2 ; i++){
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for(let i=3; i<=5 ; i++){
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }

      // info
      let infoArray = [0,3,9]
      for(let index=0; index < infoArray.length; index++){
        let rowIndex = infoArray[index]
        for(let i=1; i<=1 ; i++){
          const eventSeverityRedValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityRedValue.classes()).toContain('red-dot')
        }
        for(let i=2; i<=5 ; i++){
          const eventSeverityGreyValue = wrapper.find('[test-id="eventSeverityValue'+rowIndex+i+'"]')
          expect(eventSeverityGreyValue.classes()).toContain('grey-dot')
        }
      }
      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(应用数据列)', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmAppEventTable, {
      global: {
        plugins: [ElementPlus]
      },
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="appName0"]')
      const textNode1 = wrapper.find('[test-id="appName1"]')
      const textNode2 = wrapper.find('[test-id="appName2"]')
      const textNode3 = wrapper.find('[test-id="appName3"]')
      const textNode4 = wrapper.find('[test-id="appName4"]')
      const textNode5 = wrapper.find('[test-id="appName5"]')
      const textNode6 = wrapper.find('[test-id="appName6"]')
      const textNode7 = wrapper.find('[test-id="appName7"]')
      const textNode8 = wrapper.find('[test-id="appName8"]')
      const textNode9 = wrapper.find('[test-id="appName9"]')

      expect(textNode0.text()).toEqual('youku')
      expect(textNode1.text()).toEqual('uplive')
      expect(textNode2.text()).toEqual('youku')
      expect(textNode3.text()).toEqual('apple_hls')
      expect(textNode4.text()).toEqual('apple_hls')
      expect(textNode5.text()).toEqual('apple_hls')
      expect(textNode6.text()).toEqual('uplive')
      expect(textNode7.text()).toEqual('windows_update')
      expect(textNode8.text()).toEqual('apple_hls')
      expect(textNode9.text()).toEqual('cloudflare')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(严重程度数据列)', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmAppEventTable, {
      global: {
        plugins: [ElementPlus]
      },
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="eventSeverity0"]')
      const textNode1 = wrapper.find('[test-id="eventSeverity1"]')
      const textNode2 = wrapper.find('[test-id="eventSeverity2"]')
      const textNode3 = wrapper.find('[test-id="eventSeverity3"]')
      const textNode4 = wrapper.find('[test-id="eventSeverity4"]')
      const textNode5 = wrapper.find('[test-id="eventSeverity5"]')
      const textNode6 = wrapper.find('[test-id="eventSeverity6"]')
      const textNode7 = wrapper.find('[test-id="eventSeverity7"]')
      const textNode8 = wrapper.find('[test-id="eventSeverity8"]')
      const textNode9 = wrapper.find('[test-id="eventSeverity9"]')

      expect(textNode0.text()).toEqual('info')
      expect(textNode1.text()).toEqual('critical')
      expect(textNode2.text()).toEqual('low')
      expect(textNode3.text()).toEqual('info')
      expect(textNode4.text()).toEqual('low')
      expect(textNode5.text()).toEqual('medium')
      expect(textNode6.text()).toEqual('high')
      expect(textNode7.text()).toEqual('medium')
      expect(textNode8.text()).toEqual('critical')
      expect(textNode9.text()).toEqual('info')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(事件类型数据列)', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmAppEventTable, {
      global: {
        plugins: [ElementPlus]
      },
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="eventType0"]')
      const textNode1 = wrapper.find('[test-id="eventType1"]')
      const textNode2 = wrapper.find('[test-id="eventType2"]')
      const textNode3 = wrapper.find('[test-id="eventType3"]')
      const textNode4 = wrapper.find('[test-id="eventType4"]')
      const textNode5 = wrapper.find('[test-id="eventType5"]')
      const textNode6 = wrapper.find('[test-id="eventType6"]')
      const textNode7 = wrapper.find('[test-id="eventType7"]')
      const textNode8 = wrapper.find('[test-id="eventType8"]')
      const textNode9 = wrapper.find('[test-id="eventType9"]')

      expect(textNode0.text()).toEqual('http error')
      expect(textNode1.text()).toEqual('http error')
      expect(textNode2.text()).toEqual('http error')
      expect(textNode3.text()).toEqual('http error')
      expect(textNode4.text()).toEqual('http error')
      expect(textNode5.text()).toEqual('http error')
      expect(textNode6.text()).toEqual('http error')
      expect(textNode7.text()).toEqual('http error')
      expect(textNode8.text()).toEqual('http error')
      expect(textNode9.text()).toEqual('http error')

      resolve()
    }, 200))
  })
  test('Npm 事件：APP事件信息表格 数据验证(事件数量数据列)', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 数据
    axios.get.mockResolvedValue(mockGet)
    // 加载vue组件，获得实例
    const wrapper = mount(NpmAppEventTable, {
      global: {
        plugins: [ElementPlus]
      },
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.find('[test-id="count0"]')
      const textNode1 = wrapper.find('[test-id="count1"]')
      const textNode2 = wrapper.find('[test-id="count2"]')
      const textNode3 = wrapper.find('[test-id="count3"]')
      const textNode4 = wrapper.find('[test-id="count4"]')
      const textNode5 = wrapper.find('[test-id="count5"]')
      const textNode6 = wrapper.find('[test-id="count6"]')
      const textNode7 = wrapper.find('[test-id="count7"]')
      const textNode8 = wrapper.find('[test-id="count8"]')
      const textNode9 = wrapper.find('[test-id="count9"]')

      expect(textNode0.text()).toEqual('6')
      expect(textNode1.text()).toEqual('5')
      expect(textNode2.text()).toEqual('4')
      expect(textNode3.text()).toEqual('3')
      expect(textNode4.text()).toEqual('3')
      expect(textNode5.text()).toEqual('2')
      expect(textNode6.text()).toEqual('2')
      expect(textNode7.text()).toEqual('2')
      expect(textNode8.text()).toEqual('1')
      expect(textNode9.text()).toEqual('1')

      resolve()
    }, 200))
  })
})