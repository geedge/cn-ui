import _ from 'lodash'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/components/charts/chart-options'
import { unitTypes } from '@/utils/constants'
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
      }
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
              this.entityData.bytesSentRate = t.aggregation.last
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
                    data: t.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
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
          }
        })
      }
    },

    queryEntityDetailLinkInUrl () {
      if (this.linkInUrl) {
        get(this.linkInUrl, this.getQueryParams()).then(response => {
          if (response.code === 200 && response.data.aggregation) {
            const sum = response.data.aggregation.sum
            const max = response.data.aggregation.max
            this.entityData.linkInPercent = (parseFloat(max / sum) * 100).toFixed(2)
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
              const max = parseFloat(sorted[0].bytes)
              this.entityData.linkOutPercent = (parseFloat(max / sum) * 100).toFixed(2)
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
      this.queryEntityDetailRelation()
      this.queryEntityDetailAlert()
      this.queryEntityDetailSecurity()
      this.queryEntityDetailNetworkQuantity()
      this.queryEntityDetailLinkOutUrl()
      this.queryEntityDetailLinkInUrl()
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
      this.entityData = _.cloneDeep(this.entity)
      this.chartOption = _.cloneDeep(entityListLineOption)
      setTimeout(() => { this.queryEntityDetail() })
    }
  }
}
