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
      const now = window.$dayJs.tz().valueOf()
      switch (this.entityData.entityType) {
        case ('ip'): {
          params = {
            startTime: this.timeFilter.startTime ? parseInt(this.timeFilter.startTime / 1000) : Math.floor(now / 1000 - 3600),
            endTime: this.timeFilter.endTime ? parseInt(this.timeFilter.endTime / 1000) : Math.floor(now / 1000),
            ip: this.entityData.ipAddr
          }
          break
        }
        case ('domain'): {
          params = {
            startTime: this.timeFilter.startTime ? parseInt(this.timeFilter.startTime / 1000) : Math.floor(now / 1000 - 3600),
            endTime: this.timeFilter.endTime ? parseInt(this.timeFilter.endTime / 1000) : Math.floor(now / 1000),
            domain: this.entityData.domainName
          }
          break
        }
        case ('app'): {
          params = {
            startTime: this.timeFilter.startTime ? parseInt(this.timeFilter.startTime / 1000) : Math.floor(now / 1000 - 3600),
            endTime: this.timeFilter.endTime ? parseInt(this.timeFilter.endTime / 1000) : Math.floor(now / 1000),
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
    showDetail () {
      const { href } = this.$router.resolve({
        path: '/entityDetail',
        query: {
          entityType: this.entityData.entityType,
          name: this.entityData.ipAddr || this.entityData.domainName || this.entityData.appName
        }
      })
      window.open(href, '_blank')
    },
    queryTraffic () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        entityType: this.entityData.entityType,
        name: this.entityName
      }
      get(api.entityTraffic, queryParams).then(response => {
        if (response.code === 200) {
          response.data.result.forEach(t => {
            if (t.legend === 'bytesSentRate') {
              this.entityData.bytesSentRate = t.aggregation.last
            }
            if (t.legend === 'bytesReceivedRate') {
              this.entityData.bytesReceivedRate = t.aggregation.last
            }
          })
        }
      })
    },
    querySecurity () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        entityType: this.entityData.entityType,
        name: this.entityName
      }
      get(api.entitySecurityNum, queryParams).then(response => {
        if (response.code === 200) {
          this.entityData.securityCount = response.data.result[0].count
        }
      })
    },
    queryAlert () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        entityType: this.entityData.entityType,
        name: this.entityName
      }
      get(api.entityAlertNum, queryParams).then(response => {
        if (response.code === 200) {
          this.entityData.alertCount = response.data.result[0].value
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
                data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
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
                data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
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
            return {}
          })
          chartOption = {
            ...this.chartOption,
            series
          }
        }
      }).finally(() => {
        this.$nextTick(() => {
          if (chartOption) {
            const myChart = echarts.init(document.getElementById(`entityListChart${this.entityName}`))
            myChart.setOption(chartOption)
          }
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
