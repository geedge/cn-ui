import _ from 'lodash'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { entityListLineOption } from '@/components/charts/chart-options'
import { unitTypes } from '@/utils/constants'

export default {
  props: {
    entity: Object,
    timeFilter: {},
    listMode: ''
  },
  data () {
    return {
      entityData: {},
      chartOption: null
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.entityData.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app'
          break
        }
        default: break
      }
      return className
    },
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
    queryUrl () {
      let url
      switch (this.entityData.entityType) {
        case ('ip'): {
          url = api.ipBytes
          break
        }
        case ('domain'): {
          url = api.domainBytes
          break
        }
        case ('app'): {
          url = api.appBytes
          break
        }
        default: break
      }
      return url
    },
    queryParams () {
      let params
      const now = new Date()
      switch (this.entityData.entityType) {
        case ('ip'): {
          params = {
            queryTimeRange: {
              startTime: Math.floor(now.getTime() / 1000 - 3600),
              endTime: Math.floor(now.getTime() / 1000)
            },
            ip: this.entityData.ipAddr
          }
          break
        }
        case ('domain'): {
          params = {
            queryTimeRange: {
              startTime: Math.floor(now.getTime() / 1000 - 3600),
              endTime: Math.floor(now.getTime() / 1000)
            },
            domain: this.entityData.domainName
          }
          break
        }
        case ('app'): {
          params = {
            queryTimeRange: {
              startTime: Math.floor(now.getTime() / 1000 - 3600),
              endTime: Math.floor(now.getTime() / 1000)
            },
            appName: this.entityData.appName
          }
          break
        }
        default: break
      }
      return params
    }
  },
  methods: {
    entityDetail (entity) {

    },
    queryTraffic () {
      get(api.entityTraffic, { entityType: this.entityData.entityType, name: this.entityName }).then(response => {
        if (response.code === 200) {
          response.data.result.forEach(t => {
            if (t.name === 'bytes_sent_rate') {
              this.entityData.bytesSentRate = t.value
            }
            if (t.name === 'bytes_received_rate') {
              this.entityData.bytesReceivedRate = t.value
            }
          })
        }
      })
    },
    querySecurity () {
      get(api.entitySecurityNum, { entityType: this.entityData.entityType, name: this.entityName }).then(response => {
        if (response.code === 200) {
          this.entityData.securityCount = response.data.result[0].count
        }
      })
    },
    queryAlert () {
      get(api.entityAlertNum, { entityType: this.entityData.entityType, name: this.entityName }).then(response => {
        if (response.code === 200) {
          this.entityData.securityCount = response.data.result[0].value
        }
      })
    },

    queryTrafficLine () {
      let chartOption
      this.chartOption = this.$_.cloneDeep(entityListLineOption)
      get(this.queryUrl, this.queryParams).then(response => {
        if (response.code === 200) {
          const seriesTemplate = this.chartOption.series[0]
          const series = response.data.result.map((r, i) => {
            if (r.legend === 'bytes_sent_rate') {
              return {
                ...seriesTemplate,
                name: this.$t('entities.sentThroughput'), // 'bytes_sent_rate',//legendMapping[`ip_${r.legend}`],
                data: r.values.map(v => [Number(v[0]), Number(v[1]), unitTypes.byte]),
                itemStyle: {
                  normal: {
                    color: '#69b072',
                    lineStyle: {
                      width: 1.5
                    }
                  }
                },
                smooth: true,
                areaStyle: {
                  opacity: 0.8,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#f0fff8'
                    },
                    {
                      offset: 1,
                      color: '#f0fff8'
                    }
                  ])
                }
              }
            } else if (r.legend === 'bytes_received_rate') {
              return {
                ...seriesTemplate,
                name: this.$t('entities.receivedThroughput'), // legendMapping[`ip_${r.legend}`],
                data: r.values.map(v => [Number(v[0]), Number(v[1]), unitTypes.byte]),
                itemStyle: {
                  normal: {
                    color: '#7899c6',
                    lineStyle: {
                      width: 1.5
                    }
                  }
                },
                smooth: true,
                areaStyle: {
                  opacity: 0.8,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#f0f4ff'
                    },
                    {
                      offset: 1,
                      color: '#f0f4ff'
                    }
                  ])
                }
              }
            }
          })
          chartOption = {
            ...this.chartOption,
            series
          }
        }
      }).finally(() => {
        this.$nextTick(() => {
          const myChart = echarts.init(document.getElementById(`entityListChart${this.entityName}`))
          myChart.setOption(chartOption)
        })
      })
    }
  },
  mounted () {
    this.entityData = _.cloneDeep(this.entity)
    setTimeout(() => { this.queryTraffic() })
    setTimeout(() => { this.querySecurity() })
    setTimeout(() => { this.queryAlert() })
    if (this.listMode === 'block') {
      setTimeout(() => { this.queryTrafficLine() })
    }
  }
}
