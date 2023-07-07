import _ from 'lodash'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/views/charts/charts/chart-options'
import { riskLevelMapping, unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { shallowRef } from 'vue'

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
      unitConvert,
      echartsArray: []
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
    querySecurity () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      let url
      switch (this.entityData.entityType) {
        case ('ip'): {
          url = api.entityIpDetailSecurity
          queryParams.ip = this.entityName
          break
        }
        case ('domain'): {
          url = api.entityDomainDetailSecurity
          queryParams.domain = this.entityName
          break
        }
        case ('app'): {
          url = api.entityAppDetailSecurity
          queryParams.appName = this.entityName
          break
        }
        default: break
      }
      get(url, queryParams).then(response => {
        if (response.code === 200) {
          this.entityData.securityCount = response.data.result ? response.data.result.length : 0
        }
      })
    },
    queryPerformance () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      let url
      switch (this.entityData.entityType) {
        case ('ip'): {
          url = api.entityIpDetailPerformance
          queryParams.ip = this.entityName
          break
        }
        case ('domain'): {
          url = api.entityDomainDetailPerformance
          queryParams.domain = this.entityName
          break
        }
        case ('app'): {
          url = api.entityAppDetailPerformance
          queryParams.appName = this.entityName
          break
        }
        default: break
      }
      get(url, queryParams).then(response => {
        if (response.code === 200) {
          this.entityData.performanceCount = response.data.result ? response.data.result.length : 0
        }
      })
    },
    getQueryParams () {
      return {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        resource: this.entityType
      }
    },
    queryEntityDetailTraffic () {
      this.loading = true
      get(this.trafficUrl, this.getQueryParams()).then(response => {
        if (response.code === 200 && response.data.result && response.data.result.length > 0) {
          let sentSeries
          let receivedSeries
          response.data.result.forEach(t => {
            if (t.legend === 'bytesRate') {
              this.entityData.max = t.aggregation.max
              this.entityData.avg = t.aggregation.avg
              this.entityData.p50 = t.aggregation.p50
              this.entityData.p90 = t.aggregation.p90
            } else if (t.legend === 'bytesSentRate') {
              this.entityData.bytesSentRate = _.nth(t.values, -3)[1]
              sentSeries = {
                name: this.$t('entities.sentThroughput'),
                type: 'line',
                legendHoverLink: false,
                itemStyle: {
                  lineStyle: {
                    width: 1
                  }
                },
                color: '#69b072',
                data: _.dropRight(t.values, 2).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
                showSymbol: false
              }
            } else if (t.legend === 'bytesReceivedRate') {
              this.entityData.bytesReceivedRate = t.aggregation.last
              receivedSeries = {
                name: this.$t('entities.receivedThroughput'),
                type: 'line',
                legendHoverLink: false,
                itemStyle: {
                  lineStyle: {
                    width: 1
                  }
                },
                color: '#7899c6',
                data: t.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
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
            // this.trafficUrl = api.entityIpDetailTraffic
            this.trafficUrl = api.entity.entityList.ipThroughput
            break
          }
          case 'domain': {
            // this.trafficUrl = api.entityDomainDetailTraffic
            this.trafficUrl = api.entity.entityList.domainThroughput
            break
          }
          case 'app': {
            // this.trafficUrl = api.entityAppDetailTraffic
            this.trafficUrl = api.entity.entityList.appThroughput
            break
          }
          default:
            break
        }
      }
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
    // this.entityData = _.cloneDeep(this.entity)
    this.entityData = { ...this.entityData, ...this.entity }
    this.initUrl()
    setTimeout(() => {
      this.querySecurity()
      this.queryEntityDetailTraffic()
      this.queryPerformance()
    })
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
  }
}
