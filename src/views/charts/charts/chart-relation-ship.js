import _ from 'lodash'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/views/charts/charts/chart-options'
import { eventSeverity, riskLevelMapping, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { shallowRef } from 'vue'
import { object } from '@amcharts/amcharts4/core'

export default {
  props: {
    entity: Object,
    timeFilter: Object
  },
  data () {
    return {
      entityData: {
        chartOptionSent: null,
        chartOptionReceived: null,
        chartOption: null,
        sentChart: null,
        receivedChart: null,
        tableData: {}
      },
      chartOption: null,
      echartsArray: [],
      security: [],
      performance: [],
      shipSeverity: []
    }
  },
  computed: {
    iconClass () {
      return function (entityData) {
        let className
        switch (entityData.eventSeverity) {
          case ('critical'): {
            className = 'critical'
            break
          }
          case ('high'): {
            className = 'high'
            break
          }
          case ('info'): {
            className = 'info'
            break
          }
          case ('medium'): {
            className = 'medium'
            break
          }
          case ('low'): {
            className = 'low'
            break
          }
          default:
            break
        }
        return className
      }
    },
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    },
    ipLocationRegion () {
      return function (entityData) {
        let result = ''
        if (entityData.country) {
          result += `${entityData.country},`
        }
        if (entityData.province) {
          result += `${entityData.province},`
        }
        if (entityData.city) {
          result += `${entityData.city},`
        }
        result = result.substr(0, result.length - 1)
        if (!result) {
          result = '-'
        }
        return result
      }
    }
  },
  methods: {
    queryEntityDetailTraffic (urlObj, params, queryParams) {
      if (!echarts.init(document.getElementById('entityDetailSend')) && !echarts.init(document.getElementById('entityDetailReceived'))) return ''
      this.chartOption = _.cloneDeep(entityListLineOption)
      this.sentChart = echarts.init(document.getElementById('entityDetailSend'))
      this.receivedChart = echarts.init(document.getElementById('entityDetailReceived'))
      this.loadingTraffic = true
      get(urlObj.trafficUrl, queryParams).then(response => {
        if (response.code === 200 && response.data.result && response.data.result.length > 0) {
          response.data.result.forEach(t => {
            if (t.legend === 'bytesSentRate') {
              this.entityData.bytesSentRate = _.nth(t.values, -3)[1]
              this.chartOptionSent = {
                ...this.chartOption,
                series: [
                  {
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
                ]
              }
            } else if (t.legend === 'bytesReceivedRate') {
              this.entityData.bytesReceivedRate = t.aggregation.last
              this.chartOptionReceived = {
                ...this.chartOption,
                series: [
                  {
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
                ]
              }
            }
          })
          this.echartsArray.push(shallowRef(this.sentChart), shallowRef(this.receivedChart))
          this.sentChart.setOption(this.chartOptionSent)
          this.receivedChart.setOption(this.chartOptionReceived)
          this.loadingTraffic = false
        } else {
          this.loadingTraffic = false
        }
      })
    },

    queryEntityDetaServerOverview (urlObj, params, queryParams) {
      this.loadingServiceQuality = true
      get(urlObj.ServerOverviewUrl, queryParams).then(response => {
        if (response.code === 200) {
          this.entityData.establishLatencyMs = response.data.result.establishLatencyMs
          this.entityData.pktRetransPercent = response.data.result.pktRetransPercent
        }
        this.loadingServiceQuality = false
      })
    },

    queryEntityDetailAll (urlObj, params, queryParams) {
      this.loadingAlert = true
      this.shipSeverity = []
      const performance = get(urlObj.performanceUrl, queryParams)
      const security = get(urlObj.securityUrl, queryParams)
      Promise.all([performance, security]).then(res => {
        // const alertEventSeverity = ['critical', 'high', 'medium', 'info', 'low']
        const alertAll = [...res[0].data.result, ...res[1].data.result]
        // alertEventSeverity.forEach(d => {
        //   const eventArray = alertAll.filter(p => d === p.eventSeverity)
        //   const eventArrayMap = eventArray.map(t => { return { eventSeverity: t.eventSeverity } })
        //   if (eventArrayMap) {
        //     const eventObject = eventArrayMap.find(e => e.eventSeverity === d)
        //     const eventObjectMap = object.keys(eventObject).map(m => {
        //       return {
        //         eventSeverity: eventObject[m],
        //         length: eventArray.length
        //       }
        //     })
        //     this.shipSeverity.push(...eventObjectMap)
        //   }
        // })
        alertAll.forEach(t => {
          const hit = this.shipSeverity.find(e => e.eventSeverity === t.eventSeverity)
          if (hit) {
            this.shipSeverity.forEach(d => {
              d.totalNumberOfEvents++
            })
          } else {
            this.shipSeverity.push({ eventSeverity: t.eventSeverity, totalNumberOfEvents: 1 })
          }
        })
        this.loadingAlert = false
      })
    },
    getBasicProperties (urlObj, params, queryParams) {
      this.loadingIp = true
      this.loadingDomain = true
      this.loadingApp = true
      get(urlObj.basicProperties, queryParams).then(response => {
        if (response.code === 200) {
          if (urlObj.entityType === 'ip') {
            this.entityData = {
              ...this.entityData,
              asn: response.data.result.asn,
              country: response.data.result.country,
              province: response.data.result.province,
              city: response.data.result.city
            }
          } else if (urlObj.entityType === 'domain') {
            this.entityData = {
              ...this.entityData,
              domainCategory: response.data.result.domainCategory,
              domainCategoryGroup: response.data.result.domainCategoryGroup,
              domainDescription: response.data.result.domainDescription,
              domainReputationScore: response.data.result.domainReputationScore,
              domainWhoisAddress: response.data.result.domainWhoisAddress,
              domainWhoisOrg: response.data.result.domainWhoisOrg
            }
          } else if (urlObj.entityType === 'app') {
            this.entityData = {
              ...this.entityData,
              name: response.data.result.name,
              appId: response.data.result.appId,
              category: response.data.result.category,
              subcategory: response.data.result.subcategory
            }
          }
        }
        this.loadingIp = false
        this.loadingDomain = false
        this.loadingApp = false
      })
    },

    queryEntityDetail (urlObj, params, queryParams) {
      this.entityData.tableData.name = params.data.name
      this.entityData.tableData.symbol = params.data.symbol.slice(8)
      this.entityData.tableData.type = urlObj.entityType
      this.queryEntityDetailTraffic(urlObj, params, queryParams)
      this.queryEntityDetailAll(urlObj, params, queryParams)
      this.queryEntityDetaServerOverview(urlObj, params, queryParams)
      this.getBasicProperties(urlObj, params, queryParams)
    },
    resize () {
      this.echartsArray.forEach(item => { item.value.resize() })
    }
  },
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.resize, 200)
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
  }
}
