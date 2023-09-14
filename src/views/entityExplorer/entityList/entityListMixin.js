import _ from 'lodash'
import axios from 'axios'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/views/charts/charts/chart-options'
import { riskLevelMapping, unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import { valueToRangeValue } from '@/utils/unit-convert'
import { shallowRef } from 'vue'
import { computeScore } from '@/utils/tools'
import i18n from '@/i18n'

export default {
  props: {
    entity: Object,
    timeFilter: Object,
    listMode: String
  },
  data () {
    return {
      entityData: {},
      trafficUrl: '',
      chartOption: null,
      unitTypes,
      valueToRangeValue,
      echartsArray: [],
      loadingNetworkQuality: false,
      score: '-', // 网络质量评分
      scoreUrl: '', // 网络质量评分url
      eventNum: 0, // 性能事件和安全事件数量之和
      loadingEvent: false, // event的loading
      performanceEventUrl: '', // 性能事件接口url
      securityEventUrl: '' // 安全事件接口url
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.entityData.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip2'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain2'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app2'
          break
        }
        default: break
      }
      return className
    },
    entityType () {
      return this.entity.entityValue
    },
    entityName () {
      return this.entity.entityValue
    },
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    },
    queryParams () {
      let params
      const now = window.$dayJs.tz().valueOf()
      // eslint-disable-next-line prefer-const
      params = {
        startTime: this.timeFilter.startTime ? getSecond(this.timeFilter.startTime) : Math.floor(now / 1000 - 3600),
        endTime: this.timeFilter.endTime ? getSecond(this.timeFilter.endTime) : Math.floor(now / 1000),
        resource: this.entityData.entityValue
      }
      return params
    }
  },
  methods: {
    showDetail () {
      const { href } = this.$router.resolve({
        path: '/entityDetail',
        query: {
          entityType: this.entityData.entityType,
          entityName: this.entityData.entityValue
        }
      })
      window.open(href, '_blank')
    },
    showGraph () {
      const { href } = this.$router.resolve({
        path: '/entityGraph',
        query: {
          entityType: this.entityData.entityType,
          entityName: this.entityData.entityValue
        }
      })
      window.open(href, '_blank')
    },
    getQueryParams () {
      return {
        // startTime: getSecond(this.timeFilter.startTime),
        // endTime: getSecond(this.timeFilter.endTime),
        resource: this.entityType
      }
    },
    queryEntityDetailTraffic () {
      this.loading = true
      axios.get(this.trafficUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200 && response.data.data.result && response.data.data.result.length > 0) {
          let sentSeries
          let receivedSeries
          response.data.data.result.forEach(t => {
            if (t.legend === 'bytesRate') {
              this.entityData.max = t.aggregation.max
              this.entityData.avg = t.aggregation.avg
              this.entityData.p50 = t.aggregation.p50
              this.entityData.p90 = t.aggregation.p90
            } else if (t.legend === 'bytesSentRate') {
              this.entityData.bytesSentRate = t.aggregation.avg
              sentSeries = {
                name: i18n.global.t('entities.sentThroughput'),
                type: 'line',
                legendHoverLink: false,
                itemStyle: {
                  lineStyle: {
                    width: 1
                  }
                },
                color: '#69b072',
                data: _.dropRight(t.values, 2).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.bps]),
                showSymbol: false
              }
            } else if (t.legend === 'bytesReceivedRate') {
              this.entityData.bytesReceivedRate = t.aggregation.avg
              receivedSeries = {
                name: i18n.global.t('entities.receivedThroughput'),
                type: 'line',
                legendHoverLink: false,
                itemStyle: {
                  lineStyle: {
                    width: 1
                  }
                },
                color: '#7899c6',
                data: t.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.bps]),
                showSymbol: false
              }
            }
          })
          if (this.listMode === 'block') {
            const chart = echarts.init(document.getElementById(`entityListChart${this.entityName}${this.listMode}`))
            this.echartsArray.push(shallowRef(chart))
            chart.setOption({
              ...this.chartOption,
              series: [sentSeries, receivedSeries]
            })
          } else if (this.listMode === 'list') {
            const sentChart = echarts.init(document.getElementById(`entityDetailSend${this.entityName}${this.listMode}`))
            const receivedChart = echarts.init(document.getElementById(`entityDetailReceived${this.entityName}${this.listMode}`))
            this.echartsArray.push(shallowRef(sentChart), shallowRef(receivedChart))
            sentChart.setOption({
              ...this.chartOption,
              series: [sentSeries]
            })
            receivedChart.setOption({
              ...this.chartOption,
              series: [receivedSeries]
            })
          }
          this.loading = false
        } else {
          this.loading = false
        }
      }).finally(() => {
        setTimeout(() => {
          try {
            this.$nextTick(() => {
              this.sentChart && this.sentChart.resize()
              this.receivedChart && this.receivedChart.resize()
            })
          } catch (e) {}
        }, 250)
      })
    },
    resize () {
      this.echartsArray.forEach(item => { item.value.resize() })
    },
    initUrl () {
      if (this.entity.entityType) {
        switch (this.entity.entityType) {
          case 'ip': {
            this.scoreUrl = api.entity.entityList.ipPerformance
            this.trafficUrl = api.entity.entityList.ipThroughput
            this.securityEventUrl = api.entity.entityList.ipSecurity
            this.performanceEventUrl = api.entity.entityList.ipEventPerformance
            break
          }
          case 'domain': {
            this.scoreUrl = api.entity.entityList.domainPerformance
            this.trafficUrl = api.entity.entityList.domainThroughput
            this.securityEventUrl = api.entity.entityList.domainSecurity
            this.performanceEventUrl = api.entity.entityList.domainEventPerformance
            break
          }
          case 'app': {
            this.scoreUrl = api.entity.entityList.appPerformance
            this.trafficUrl = api.entity.entityList.appThroughput
            this.securityEventUrl = api.entity.entityList.appSecurity
            this.performanceEventUrl = api.entity.entityList.appEventPerformance
            break
          }
          default:
            break
        }
      }
    },
    /** 获取网络评分 */
    queryNetworkQuantity () {
      this.loadingNetworkQuality = true

      axios.get(this.scoreUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          const data = {
            establishLatencyMs: _.get(response, 'data.data.result.establishLatencyMsAvg', null),
            httpResponseLatency: _.get(response, 'data.data.result.httpResponseLatencyAvg', null),
            sslConLatency: _.get(response, 'data.data.result.sslConLatencyAvg', null),
            tcpLostlenPercent: _.get(response, 'data.data.result.tcpLostlenPercentAvg', null),
            pktRetransPercent: _.get(response, 'data.data.result.pktRetransPercentAvg', null)
          }
          this.score = computeScore(data)
        }
      }).finally(() => {
        this.loadingNetworkQuality = false
      })
    },
    /** 获取事件数量 */
    queryEventNum () {
      this.loadingEvent = true
      const performance = axios.get(this.performanceEventUrl, { params: this.getQueryParams() })
      const security = axios.get(this.securityEventUrl, { params: this.getQueryParams() })
      this.eventNum = 0

      Promise.all([performance, security]).then(response => {
        this.eventNum = response[0].data.data.result.length + response[1].data.data.result.length
      }).catch(e => {
        this.eventNum = 0
      }).finally(() => {
        this.loadingEvent = false
      })
    }
  },
  watch: {
    entityData: {
      deep: true,
      handler (n) {
        this.initUrl()
      }
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.resize, 200)
    window.addEventListener('resize', this.debounceFunc)
    this.chartOption = _.cloneDeep(entityListLineOption)
    this.entityData = { ...this.entityData, ...this.entity }
    this.initUrl()
    setTimeout(() => {
      this.queryEntityDetailTraffic()
      this.queryNetworkQuantity()
      // this.queryEventNum()
    })
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
  }
}
