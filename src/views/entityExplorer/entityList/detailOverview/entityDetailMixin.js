import _ from 'lodash'
import axios from 'axios'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/views/charts/charts/chart-options'
import { riskLevelMapping, unitTypes } from '@/utils/constants'
import { shallowRef, markRaw } from 'vue'
import { metricOption } from '@/views/detections/options/detectionOptions'
import { sortBy, reverseSortBy, computeScore } from '@/utils/tools'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'

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
      performanceChartBasicOption: null,
      performanceChartOption: null,
      queryParams: {},
      echartsArray: [],
      performanceData: [],
      securityData: [],
      showMore: {
        securityPageSize: 5,
        performancePageSize: 5,
        pageNo: 1
      },
      metricChart: null,
      performanceChartList: [],
      loadingPerformance: [],
      score: '-', // 网络质量评分
      performanceMetricEndTimeInterval: 3600 // 服务质量事件指标的结束时间与开始时间的秒间隔
    }
  },
  computed: {
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
      this.loadingTraffic = true
      axios.get(this.trafficUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200 && response.data.data.result && response.data.data.result.length > 0) {
          response.data.data.result.forEach(t => {
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
          this.$emit('reloadEntity', this.entityData)
        } else {
          this.loadingTraffic = false
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
    queryEntityDetailPerformanceChart (performanceList, startIndex) {
      if (performanceList && performanceList.length > 0) {
        performanceList.forEach((item, i) => {
          const index = startIndex + i
          this.loadingPerformance[index] = true
          const startTime = getSecond(item.startTime)
          const endTime = getSecond(item.startTime) + this.performanceMetricEndTimeInterval
          const nowTime = getSecond(new Date())
          const searchStartTime = startTime - this.performanceMetricEndTimeInterval / 2
          const searchEndTime = _.min([nowTime, endTime + this.performanceMetricEndTimeInterval / 2])
          let url
          if (item.eventType === 'dns error') {
            url = api.detection.performanceEvent.dnsErrorMetric
          } else if (item.eventType === 'http error') {
            url = api.detection.performanceEvent.httpErrorMetric
          } else if (item.eventType === 'high dns response time') {
            url = api.detection.performanceEvent.highDnsResponseTimeMetric
          }

          if (url) {
            axios.get(url, {
              params: {
                ...this.getPerformanceQueryParams(),
                startTime: searchStartTime,
                endTime: searchEndTime,
                eventType: item.eventType
              }
            }).then(response => {
              if (response.status === 200) {
                const metricDataList = response.data.data.result[0] && response.data.data.result[0].values
                this.$nextTick(() => {
                  if (metricDataList && metricDataList.length > 0) {
                    metricDataList.sort(reverseSortBy(0))// 将返回的数据按时间降序排序，方便找到实线和虚线的交点
                    let endIndex = (metricDataList).findIndex((item) => item[0] <= endTime)
                    endIndex = metricDataList.length - endIndex

                    metricDataList.sort(sortBy(0))// 将返回的数据按时间升序排序，方便找到实线和虚线的交点
                    const startIndex = metricDataList.findIndex((item) => item[0] >= startTime)

                    const performanceChartOption = _.cloneDeep(metricOption)
                    if (startIndex > -1 && endIndex > -1) {
                      performanceChartOption.series[0].data = metricDataList.slice(0, startIndex).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
                      performanceChartOption.series[1].data = metricDataList.slice(startIndex - 1, endIndex).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
                      performanceChartOption.series[2].data = metricDataList.slice(endIndex - 1, metricDataList.length).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
                    }
                    const metricChart = markRaw(echarts.init(document.getElementById(`entityPerformanceChart${this.entityName}_${index}`)))
                    performanceChartOption && metricChart.setOption(performanceChartOption)
                    this.performanceChartList.push(metricChart)
                    this.echartsArray.push(shallowRef(metricChart))
                  } else {
                    const chartDom = document.getElementById(`entityPerformanceChart${this.entityName}_${index}`)
                    chartDom.innerHTML = '<span style="padding-left:5px;">-</span>'
                  }
                })
              }
            }).catch(error => {
              console.error(error)
              const chartDom = document.getElementById(`entityPerformanceChart${this.entityName}${index}`)
              chartDom.innerHTML = '<span style="padding-left:5px;">-</span>'
            }).finally(() => {
              setTimeout(() => {
                try {
                  this.$nextTick(() => {
                    this.performanceChartList.forEach(item => {
                      item && item.resize()
                    })
                    this.loadingPerformance[index] = false
                  })
                } catch (e) {}
              }, 250)
            })
          }
        })
      }
    },
    queryEntityDetailRelation () {
      axios.get(this.relationUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.handleRelationData(response.data.data.result)
        }
      })
    },

    queryEntityDetailNetworkQuantity () {
      this.loadingNetworkQuality = true
      if (this.networkQuantityUrl) {
        axios.get(this.networkQuantityUrl, { params: this.getQueryParams() }).then(response => {
          if (response.status === 200) {
            const data = {
              establishLatencyMs: response.data.data.result.establishLatencyValue || null,
              httpResponseLatency: response.data.data.result.httpResponseLatencyValue || null,
              sslConLatency: response.data.data.result.sslConLatencyValue || null,
              tcpLostlenPercent: response.data.data.result.sequenceGapLossPercentValue || null,
              pktRetransPercent: response.data.data.result.pktRetransPercentValue || null
            }
            // this.score = computeScore(data)
            this.entityData.establishLatencyValue = response.data.data.result.establishLatencyValue
            this.entityData.establishLatencyP50 = response.data.data.result.establishLatencyP50
            this.entityData.establishLatencyP90 = response.data.data.result.establishLatencyP90

            this.entityData.httpResponseLantencyValue = response.data.data.result.httpResponseLantencyValue
            this.entityData.httpResponseLantencyP50 = response.data.data.result.httpResponseLantencyP50
            this.entityData.httpResponseLantencyP90 = response.data.data.result.httpResponseLantencyP90

            this.entityData.sslConLatencyValue = response.data.data.result.sslConLatencyValue
            this.entityData.sslConLatencyP50 = response.data.data.result.sslConLatencyP50
            this.entityData.sslConLatencyP90 = response.data.data.result.sslConLatencyP90

            this.entityData.sequenceGapLossPercentValue = response.data.data.result.sequenceGapLossPercentValue
            this.entityData.sequenceGapLossPercentP50 = response.data.data.result.sequenceGapLossPercentP50
            this.entityData.sequenceGapLossPercentP90 = response.data.data.result.sequenceGapLossPercentP90

            this.entityData.pktRetransPercentValue = response.data.data.result.pktRetransPercentValue
            this.entityData.pktRetransPercentP50 = response.data.data.result.pktRetransPercentP50
            this.entityData.pktRetransPercentP90 = response.data.data.result.pktRetransPercentP90

            const establishLatency = {
              value: this.entityData.establishLatencyValue,
              p50: this.entityData.establishLatencyP50,
              p90: this.entityData.establishLatencyP90
            }
            this.singleValues.chartDatas.splice(0, 1, establishLatency)
            const httpResponseLatency = {
              value: this.entityData.httpResponseLantencyValue,
              p50: this.entityData.httpResponseLantencyP50,
              p90: this.entityData.httpResponseLantencyP90
            }
            this.singleValues.chartDatas.splice(1, 1, httpResponseLatency)
            const sslConLatency = {
              value: this.entityData.sslConLatencyValue,
              p50: this.entityData.sslConLatencyP50,
              p90: this.entityData.sslConLatencyP90
            }
            this.singleValues.chartDatas.splice(2, 1, sslConLatency)
            const sequenceGapLoss = {
              value: this.entityData.sequenceGapLossPercentValue,
              p50: this.entityData.sequenceGapLossPercentP50,
              p90: this.entityData.sequenceGapLossPercentP90
            }
            this.singleValues.chartDatas.splice(3, 1, sequenceGapLoss)
            const pktRetransPercent = {
              value: this.entityData.pktRetransPercentValue,
              p50: this.entityData.pktRetransPercentP50,
              p90: this.entityData.pktRetransPercentP90
            }
            this.singleValues.chartDatas.splice(4, 1, pktRetransPercent)
          }
          this.loadingNetworkQuality = false
        })
      }
    },

    queryEntityDetailLinkInUrl () {
      this.loadingIn = true
      if (this.linkInUrl) {
        axios.get(this.linkInUrl, { params: this.getQueryParams() }).then(response => {
          if (response.status === 200) {
            if (!this.$_.isEmpty(response.data.data.result)) {
              let sum = 0
              response.data.data.result.forEach(r => {
                sum += parseFloat(r.bytes)
              })
              const sorted = response.data.data.result.sort((r1, r2) => {
                return parseFloat(r2.bytes) - parseFloat(r1.bytes)
              })
              const sortedId = response.data.data.result.sort((r1, r2) => {
                return parseFloat(r2.commonIngressLinkId) - parseFloat(r1.commonIngressLinkId)
              })
              const max = parseFloat(sorted[0].bytes)
              const maxId = parseFloat(sortedId[0].commonIngressLinkId)
              this.entityData.linkInPercent = (parseFloat(max / sum)).toFixed(2)
              this.entityData.linkInId = maxId
            }
          }
          this.loadingIn = false
        })
      }
    },

    queryEntityDetailLinkOutUrl () {
      this.loadingOut = true
      if (this.linkOutUrl) {
        axios.get(this.linkOutUrl, { params: this.getQueryParams() }).then(response => {
          if (response.status === 200) {
            if (!this.$_.isEmpty(response.data.data.result)) {
              let sum = 0
              response.data.data.result.forEach(r => {
                sum += parseFloat(r.bytes)
              })
              const sorted = response.data.data.result.sort((r1, r2) => {
                return parseFloat(r2.bytes) - parseFloat(r1.bytes)
              })
              const sortedId = response.data.data.result.sort((r1, r2) => {
                return parseFloat(r2.commonEgressLinkId) - parseFloat(r1.commonEgressLinkId)
              })
              const max = parseFloat(sorted[0].bytes)
              const maxId = parseFloat(sortedId[0].commonEgressLinkId)
              this.entityData.linkOutPercent = (parseFloat(max / sum)).toFixed(2)
              this.entityData.linkOutId = maxId
            }
          }
          this.loadingOut = false
        })
      }
    },

    queryEntityDetailPerformance () {
      this.loadingAlert = true
      axios.get(this.performanceUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.entityData.performanceNum = response.data.data.result.length
          this.performanceData = response.data.data.result
          this.entityData.performanceList = this.getTargetPageData(1, this.showMore.performancePageSize, this.performanceData)
        }
        this.loadingAlert = false
      })
    },

    queryEntityDetailSecurity () {
      this.loadingSecurityEvents = true
      axios.get(this.securityUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.entityData.securityNum = response.data.data.result.length
          this.securityData = response.data.data.result
          this.entityData.securityList = this.getTargetPageData(1, this.showMore.securityPageSize, this.securityData)
        }
        this.loadingSecurityEvents = false
      })
    },

    performanceShowMore (num) {
      this.showMore.performancePageSize += num
      this.entityData.performanceList = this.getTargetPageData(this.showMore.pageNo, this.showMore.performancePageSize, this.performanceData)
    },

    securityShowMore (num) {
      this.showMore.securityPageSize += num
      this.entityData.securityList = this.getTargetPageData(this.showMore.pageNo, this.showMore.securityPageSize, this.securityData)
    },

    getTargetPageData (pageNum, pageSize, data) {
      return this.$_.slice(data, (pageNum - 1) * pageSize, pageNum * pageSize)
    },

    queryDnsServerInfo () {
      axios.get(this.entityDetectionsIpUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.entityData.dnsServerRole = response.data.data.result.dnsServerRole
          this.entityData.dnsServerOrg = response.data.data.result.dnsServerOrg
          this.entityData.dnsServerSoftware = response.data.data.result.dnsServerSoftware
          this.entityData.dnsServerOs = response.data.data.result.dnsServerOs
          this.entityData.dohSupport = response.data.data.result.dohSupport
          this.entityData.dotSupport = response.data.data.result.dotSupport
          this.entityData.dnssecSupport = response.data.data.result.dnssecSupport
        }
        if (this.entityData.dnsServerRole) {
          this.loadingDns = false
        }
      })
    },

    queryDnsServerInfoRate () {
      this.loading = true
      this.detectionChart = echarts.init(document.getElementById(`entityDnsServerInfo${this.entityName}`))
      axios.get(this.entityDetectionsIpQueryRateUrl, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200 && response.data.data.result && response.data.data.result.length > 0) {
          response.data.data.result.forEach(t => {
            this.entityData.queryRate = _.nth(t.values, -3)[1]
            this.chartDetectionQueryRate = {
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
          })
          this.echartsArray.push(shallowRef(this.detectionChart))
          this.detectionChart.setOption(this.chartDetectionQueryRate)
        }
        this.loading = false
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
        if (!this.entityData.dnsServerRole) {
          this.loadingDns = true
        }
        this.queryDnsServerInfo()
        this.$nextTick(() => {
          setTimeout(() => {
            if (!this.entityData.dnsServerRole) return
            this.queryDnsServerInfoRate()
          }, 200)
        })
      }
    },

    resize () {
      this.echartsArray.forEach(item => { item.value.resize() })
    }
  },
  setup () {
    return {
      unitTypes
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.resize, 200)
    window.addEventListener('resize', this.debounceFunc)
    this.chartOption = _.cloneDeep(entityListLineOption)
    setTimeout(() => { this.queryEntityDetail() })
    const _this = this
    this.entityData = { ...this.entityData, ...this.entity }
    this.emitter.on('switch-collapse', function () {
      setTimeout(() => { _this.queryEntityDetail() }, 200)
    })
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
    if (this.performanceChartList) {
      this.performanceChartList.forEach(item => {
        item.dispose()
        item = null
      })
    }
  }
}
