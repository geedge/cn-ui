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
        chartOption: null,
        sentChart: null,
        receivedChart: null
      },
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
            this.entityData.establishLatency = response.data.result.establishLatency
            this.entityData.httpResponseLatency = response.data.result.httpResponseLatency
            this.entityData.sslConLatency = response.data.result.sslConLatency
            this.entityData.sequenceGapLossPercent = response.data.result.sequenceGapLossPercent
            this.entityData.pktRetransPercent = response.data.result.pktRetransPercent

            this.singleValues.chartDatas.splice(0, 1, this.$_.get(this.entityData, 'establishLatency'))
            this.singleValues.chartDatas.splice(1, 1, this.$_.get(this.entityData, 'httpResponseLatency'))
            this.singleValues.chartDatas.splice(2, 1, this.$_.get(this.entityData, 'sslConLatency'))
            this.singleValues.chartDatas.splice(3, 1, this.$_.get(this.entityData, 'sequenceGapLossPercent'))
            this.singleValues.chartDatas.splice(4, 1, this.$_.get(this.entityData, 'pktRetransPercent'))
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

    queryEntityDetailAlert () {
      get(this.alertUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.entityData.alertNum = response.data.result.length
          this.entityData.alertList = response.data.result
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

    queryEntityDetail () {
      this.queryEntityDetailTraffic()
      // this.queryEntityDetailRelation()
      this.queryEntityDetailAlert()
      this.queryEntityDetailSecurity()
      this.queryEntityDetailNetworkQuantity()
      this.queryEntityDetailLinkOutUrl()
      this.queryEntityDetailLinkInUrl()
      this.queryRelated()
    }
  },
  setup () {
    return {
      chartOption: entityListLineOption,
      unitTypes,
      unitConvert
    }
  },
  mounted () {
    if (this.listMode === 'list') {
      this.chartOption = _.cloneDeep(entityListLineOption)
      setTimeout(() => { this.queryEntityDetail() })
    }
  }
}
