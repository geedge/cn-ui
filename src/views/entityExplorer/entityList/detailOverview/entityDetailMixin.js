import _ from 'lodash'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/views/charts/charts/chart-options'
import { riskLevelMapping, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'

export default {
  props: {
    entity: Object,
    timeFilter: Object
  },
  data () {
    return {
      entityData: {
        domainCount: 0,
        appCount: 0,
        ipCount: 0,
        securityNum: 0,
        alertNum: 0,
        chartOptionSent: null,
        chartOptionReceived: null,
        chartDetectionQueryRate: null,
        chartOption: null,
        sentChart: null,
        receivedChart: null
      },
      chartOption: null,
      queryParams: {}
    }
  },
  computed: {
    entityName () {
      let name
      switch (this.entityData.entityType) {
        case ('ip'): {
          name = this.entity.ipAddr
          break
        }
        case ('domain'): {
          name = this.entity.domainName
          break
        }
        case ('app'): {
          name = this.entity.appName
          break
        }
        default: break
      }
      return name
    },
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    }
  },
  methods: {
    getCurrentTimeRange (callback) {
      const myEndTime = window.$dayJs.tz().valueOf()
      const myStartTime = myEndTime - this.timeFilter.dateRangeValue * 60 * 1000
      callback({ startTime: myStartTime, endTime: myEndTime })
    },
    queryEntityDetailTraffic () {
      this.sentChart = echarts.init(document.getElementById(`entityDetailSend${this.entityName}`))
      this.receivedChart = echarts.init(document.getElementById(`entityDetailReceived${this.entityName}`))
      get(this.trafficUrl, this.getQueryParams()).then(response => {
        if (response.code === 200 && response.data.result && response.data.result.length > 0) {
          response.data.result.forEach(t => {
            if (t.legend === 'bytesRate') {
              this.entityData.max = t.aggregation.max
              this.entityData.avg = t.aggregation.avg
              this.entityData.p50 = t.aggregation.p50
              this.entityData.p90 = t.aggregation.p90
            } else if (t.legend === 'bytesSentRate') {
              this.entityData.bytesSentRate = _.nth(t.values, -3)[1]
              this.chartOptionSent = {
                ...this.chartOption,
                series: [
                  {
                    name: this.$t('entities.sentThroughput'),
                    type: 'line',
                    legendHoverLink: false,
                    itemStyle: {
                      normal: {
                        lineStyle: {
                          width: 1
                        }
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
                      normal: {
                        lineStyle: {
                          width: 1
                        }
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
          this.sentChart.setOption(this.chartOptionSent)
          this.receivedChart.setOption(this.chartOptionReceived)
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

    queryEntityDetailRelation () {
      get(this.relationUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.handleRelationData(response.data.result)
        }
      })
    },

    queryEntityDetailNetworkQuantity () {
      if (this.networkQuantityUrl) {
        get(this.networkQuantityUrl, this.getQueryParams()).then(response => {
          if (response.code === 200) {
            this.entityData.establishLatencyAvg = response.data.result.establishLatencyAvg
            this.entityData.establishLatencyP50 = response.data.result.establishLatencyP50
            this.entityData.establishLatencyP90 = response.data.result.establishLatencyP90

            this.entityData.httpResponseLantencyAvg = response.data.result.httpResponseLantencyAvg
            this.entityData.httpResponseLantencyP50 = response.data.result.httpResponseLantencyP50
            this.entityData.httpResponseLantencyP90 = response.data.result.httpResponseLantencyP90

            this.entityData.sslConLatencyAvg = response.data.result.sslConLatencyAvg
            this.entityData.sslConLatencyP50 = response.data.result.sslConLatencyP50
            this.entityData.sslConLatencyP90 = response.data.result.sslConLatencyP90

            this.entityData.sequenceGapLossAvg = response.data.result.sequenceGapLossAvg
            this.entityData.sequenceGapLossP50 = response.data.result.sequenceGapLossP50
            this.entityData.sequenceGapLossP90 = response.data.result.sequenceGapLossP90

            this.entityData.pktRetransAvg = response.data.result.pktRetransAvg
            this.entityData.pktRetransP50 = response.data.result.pktRetransP50
            this.entityData.pktRetransP90 = response.data.result.pktRetransP90

            const establishLatency = {
              value: this.entityData.establishLatencyAvg,
              p50: this.entityData.establishLatencyP50,
              p90: this.entityData.establishLatencyP90
            }
            this.singleValues.chartDatas.splice(0, 1, establishLatency)
            const httpResponseLatency = {
              value: this.entityData.httpResponseLantencyAvg,
              p50: this.entityData.httpResponseLantencyP50,
              p90: this.entityData.httpResponseLantencyP90
            }
            this.singleValues.chartDatas.splice(1, 1, httpResponseLatency)
            const sslConLatency = {
              value: this.entityData.sslConLatencyAvg,
              p50: this.entityData.sslConLatencyP50,
              p90: this.entityData.sslConLatencyP90
            }
            this.singleValues.chartDatas.splice(2, 1, sslConLatency)
            const sequenceGapLoss = {
              value: this.entityData.sequenceGapLossAvg,
              p50: this.entityData.sequenceGapLossP50,
              p90: this.entityData.sequenceGapLossP90
            }
            this.singleValues.chartDatas.splice(3, 1, sequenceGapLoss)
            const pktRetransPercent = {
              value: this.entityData.pktRetransAvg,
              p50: this.entityData.pktRetransP50,
              p90: this.entityData.pktRetransP90
            }
            this.singleValues.chartDatas.splice(4, 1, pktRetransPercent)

            console.log(this.singleValues.chartDatas)
          }
        })
      }
    },

    queryEntityDetailLinkInUrl () {
      if (this.linkInUrl) {
        get(this.linkInUrl, this.getQueryParams()).then(response => {
          if (response.code === 200) {
            if (!this.$_.isEmpty(response.data.result)) {
              let sum = 0
              response.data.result.forEach(r => {
                sum += parseFloat(r.bytes)
              })
              const sorted = response.data.result.sort((r1, r2) => {
                return parseFloat(r2.bytes) - parseFloat(r1.bytes)
              })
              const sortedId = response.data.result.sort((r1, r2) => {
                return parseFloat(r2.commonIngressLinkId) - parseFloat(r1.commonIngressLinkId)
              })
              const max = parseFloat(sorted[0].bytes)
              const maxId = parseFloat(sortedId[0].commonIngressLinkId)
              this.entityData.linkInPercent = (parseFloat(max / sum) * 100).toFixed(2)
              this.entityData.linkInId = maxId
            }
          }
        })
      }
    },

    queryEntityDetailLinkOutUrl () {
      if (this.linkOutUrl) {
        get(this.linkOutUrl, this.getQueryParams()).then(response => {
          if (response.code === 200) {
            if (!this.$_.isEmpty(response.data.result)) {
              let sum = 0
              response.data.result.forEach(r => {
                sum += parseFloat(r.bytes)
              })
              const sorted = response.data.result.sort((r1, r2) => {
                return parseFloat(r2.bytes) - parseFloat(r1.bytes)
              })
              const sortedId = response.data.result.sort((r1, r2) => {
                return parseFloat(r2.commonEgressLinkId) - parseFloat(r1.commonEgressLinkId)
              })
              const max = parseFloat(sorted[0].bytes)
              const maxId = parseFloat(sortedId[0].commonEgressLinkId)
              this.entityData.linkOutPercent = (parseFloat(max / sum) * 100).toFixed(2)
              this.entityData.linkOutId = maxId
            }
          }
        })
      }
    },

    queryEntityDetailPerformance () {
      get(this.performanceUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.entityData.performanceNum = response.data.result.length
          this.entityData.performanceList = response.data.result
        }
      })
    },

    queryEntityDetailSecurity () {
      get(this.securityUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.entityData.securityNum = response.data.result.length
          this.entityData.securityList = response.data.result
        }
      })
    },

    queryDnsServerInfo () {
      get(this.entityDetectionsIpUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.entityData.dnsServerRole = response.data.result.dnsServerRole
          this.entityData.dnsServerOrg = response.data.result.dnsServerOrg
          this.entityData.dnsServerSoftware = response.data.result.dnsServerSoftware
          this.entityData.dnsServerOs = response.data.result.dnsServerOs
          this.entityData.dohSupport = response.data.result.dohSupport
          this.entityData.dotSupport = response.data.result.dotSupport
          this.entityData.dnssecSupport = response.data.result.dnssecSupport
        }
      })
    },

    queryDnsServerInfoRate () {
      this.detectionChart = echarts.init(document.getElementById(`entityDnsServerInfo${this.entityName}`))
      get(this.entityDetectionsIpQueryRateUrl, this.getQueryParams()).then(response => {
        if (response.code === 200 && response.data.result && response.data.result.length > 0) {
          response.data.result.forEach(t => {
            this.entityData.queryRate = _.nth(t.values, -3)[1]
            this.chartDetectionQueryRate = {
              ...this.chartOption,
              series: [
                {
                  name: this.$t('entities.sentThroughput'),
                  type: 'line',
                  legendHoverLink: false,
                  itemStyle: {
                    normal: {
                      lineStyle: {
                        width: 1
                      }
                    }
                  },
                  color: '#69b072',
                  data: _.dropRight(t.values, 2).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
                  showSymbol: false
                }
              ]
            }
          })
          this.detectionChart.setOption(this.chartDetectionQueryRate)
        }
      })
    },

    queryEntityDetail () {
      this.queryEntityDetailTraffic()
      this.queryEntityDetailPerformance()
      this.queryEntityDetailSecurity()
      this.queryEntityDetailNetworkQuantity()
      this.queryEntityDetailLinkOutUrl()
      this.queryEntityDetailLinkInUrl()
      if (this.entity.entityType === 'ip') {
        this.queryDnsServerInfo()
        this.$nextTick(() => {
          setTimeout(() => {
            if (!this.entityData.dnsServerRole) return
            this.queryDnsServerInfoRate()
          }, 200)
        })
      }
    }
  },
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  },
  mounted () {
    this.chartOption = _.cloneDeep(entityListLineOption)
    setTimeout(() => { this.queryEntityDetail() })
  }
}
