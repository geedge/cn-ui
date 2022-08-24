<template>
  <div class="npm-network-quantity">
    <single-value
      :npm-network-name="npmNetworkName"
      :npm-network-data="npmNetworkData"
    ></single-value>
  </div>
</template>

<script>
import SingleValue from '@/views/charts2/charts/SingleValue'
import { get } from '@/utils/http'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import _ from 'lodash'
import { computeScore, getChainRatio } from '@/utils/tools'
export default {
  name: 'NpmNetworkQuantity',
  components: { SingleValue },
  mixins: [chartMixin],
  data () {
    return {
      npmNetworkName: [
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
        { name: 'networkAppPerformance.httpResponse' },
        { name: 'networkAppPerformance.sslResponseLatency' },
        { name: 'networkAppPerformance.packetLoss' },
        { name: 'overall.packetRetrans' }
      ],
      npmNetworkCycleData: [],
      npmNetworkLastCycleData: [],
      npmNetworkData: [],
      side: '',
      chartData: {}
    }
  },
  methods: {
    npmNetworkCycleQuery () {
      let condition = ''
      if (this.$store.getters.getQueryCondition.indexOf('OR') > -1) {
        condition = this.$store.getters.getQueryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.$store.getters.getQueryCondition
      }
      const type = this.$store.getters.getDimensionType
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 0
      }
      if (this.chartData.id === 23) {
        this.side = 'client'
      } else if (this.chartData.id === 24) {
        this.side = 'server'
      }
      if (condition && (typeof condition !== 'object') && type) {
        params.q = condition
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
        }
      }
      const tcp = get(api.npm.overview.tcpSessionDelay, params)
      const http = get(api.npm.overview.httpResponseDelay, params)
      const ssl = get(api.npm.overview.sslConDelay, params)
      const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      this.toggleLoading(true)
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        res.forEach(t => {
          if (t.code === 200) {
            this.npmNetworkCycleData.push(t.data.result)
          }
        })
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    npmNetworkLastCycleQuery () {
      let condition = ''
      if (this.$store.getters.getQueryCondition.indexOf('OR') > -1) {
        condition = this.$store.getters.getQueryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.$store.getters.getQueryCondition
      }
      const type = this.$store.getters.getDimensionType
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }
      if (this.chartData.id === 23) {
        this.side = 'client'
      } else if (this.chartData.id === 26) {
        this.side = 'server'
      }
      if (condition && (typeof condition !== 'object') && type) {
        params.q = condition
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
        }
      }
      const tcp = get(api.npm.overview.tcpSessionDelay, params)
      const http = get(api.npm.overview.httpResponseDelay, params)
      const ssl = get(api.npm.overview.sslConDelay, params)
      const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      this.toggleLoading(true)
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        const keyPre = ['tcp', 'http', 'ssl', 'tcpLost', 'packetRetrans']
        const scoreInfo = {}
        res.forEach((t, i) => {
          if (t.code === 200) {
            if (t.data.result.establishLatencyAvg || t.data.result.establishLatencyAvg === 0) {
              t.data.result.establishLatencyMs = t.data.result.establishLatencyAvg
            }
            if (t.data.result.httpResponseLatencyAvg || t.data.result.httpResponseLatencyAvg === 0) {
              t.data.result.httpResponseLatency = t.data.result.httpResponseLatencyAvg
            }
            if (t.data.result.sequenceGapLossAvg || t.data.result.sequenceGapLossAvg === 0) {
              t.data.result.tcpLostlenPercent = t.data.result.sequenceGapLossAvg
            }
            if (t.data.result.pktRetransAvg || t.data.result.pktRetransAvg === 0) {
              t.data.result.pktRetransPercent = t.data.result.pktRetransAvg
            }
            if (t.data.result.sslConLatencyAvg || t.data.result.sslConLatencyAvg === 0) {
              t.data.result.sslConLatency = t.data.result.sslConLatencyAvg
            }
            scoreInfo[keyPre[i] + 'Score'] = computeScore(t.data.result, i)
            this.npmNetworkLastCycleData.push(t.data.result)
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData)
          } else {
            t[keyPre[i] + 'Score'] = 0
          }
        })
        scoreInfo.score = Math.ceil((scoreInfo.tcpScore + scoreInfo.httpScore + scoreInfo.sslScore + scoreInfo.tcpLostScore + scoreInfo.packetRetransScore) * 6)
        if (scoreInfo.score > 6) {
          scoreInfo.score = 6
        }
        if (!params.q && this.chart.id === 44) {
          this.$store.commit('setNpmThirdLevelMenuScore', scoreInfo.score)
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    npmNetworkQuantity (cycle, lastCycle) {
      cycle.forEach(t => {
        lastCycle.forEach(e => {
          Object.keys(t).forEach(r => {
            Object.keys(e).forEach(d => {
              if (r === d) {
                t.value = getChainRatio(t[r], e[d])
              }
            })
          })
        })
      })
      this.npmNetworkData = cycle
    }
  },
  mounted () {
    if (this.chart) {
      this.chartData = _.cloneDeep(this.chart)
    }
    this.npmNetworkCycleQuery()
    this.npmNetworkLastCycleQuery()
  }
}
</script>
