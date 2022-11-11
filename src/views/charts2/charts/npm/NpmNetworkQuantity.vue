<template>
  <div class="npm-network-quantity">
    <single-value
      :npm-network-name="npmNetworkName"
      :npm-network-data="npmNetworkData"
    ></single-value>
  </div>
</template>

<script>
import SingleValue from '@/views/charts2/charts/npm/localComponents/SingleValue'
import { get } from '@/utils/http'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import _ from 'lodash'
import { getChainRatio } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
export default {
  name: 'NpmNetworkQuantity',
  components: { SingleValue },
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    const tabIndex = ref(query.tabIndex)
    return {
      queryCondition,
      dimensionType,
      tabIndex
    }
  },
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
  watch: {
    timeFilter: {
      handler (n) {
        this.npmNetworkCycleData = []
        this.npmNetworkLastCycleData = []
        this.npmNetworkCycleQuery()
      }
    }
  },
  methods: {
    npmNetworkCycleQuery () {
      let condition = ''
      if (this.queryCondition.indexOf(' OR ') > -1) {
        condition = this.queryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.queryCondition
      }
      const type = this.dimensionType
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 0
      }
      if (this.tabIndex == 0) {
        this.side = 'client'
      } else if (this.tabIndex == 1) {
        this.side = 'server'
      }
      if (condition && (typeof condition !== 'object') && type) {
        params.q = condition
        params.type = type
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
        params.type = type
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
          params.type = type
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
          params.type = type
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
          params.type = type
        }
      }
      if (type && condition) {
        this.toggleLoading(true)
        get(api.npm.overview.networkAnalysis, params).then(res => {
          if (res.code === 200) {
            this.npmNetworkCycleData = res.data.result
          }
          this.npmNetworkLastCycleQuery()
        }).catch(e => {
          this.toggleLoading(false)
        })
      } else {
        const tcp = get(api.npm.overview.tcpSessionDelay, params)
        const http = get(api.npm.overview.httpResponseDelay, params)
        const ssl = get(api.npm.overview.sslConDelay, params)
        const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
        const packetPercent = get(api.npm.overview.packetRetransPercent, params)
        this.toggleLoading(true)
        Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
          this.npmNetworkCycleData = []
          res.forEach(t => {
            if (t.code === 200) {
              this.npmNetworkCycleData.push(t.data.result)
            }
          })
          this.npmNetworkLastCycleQuery()
        }).catch(e => {
          this.toggleLoading(false)
        })
      }
    },
    npmNetworkLastCycleQuery () {
      let condition = ''
      if (this.queryCondition.indexOf(' OR ') > -1) {
        condition = this.queryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.queryCondition
      }
      const type = this.dimensionType
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }
      if (this.tabIndex == 0) {
        this.side = 'client'
      } else if (this.tabIndex == 1) {
        this.side = 'server'
      }
      if (condition && (typeof condition !== 'object') && type) {
        params.q = condition
        params.type = type
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
        params.type = type
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
          params.type = type
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
          params.type = type
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
          params.type = type
        }
      }
      if (type && condition) {
        this.toggleLoading(true)
        get(api.npm.overview.networkAnalysis, params).then(res => {
          if (res.code === 200) {
            this.npmNetworkLastCycleData = res.data.result
            let timer = null
            if (timer) {
              clearTimeout(timer)
            }
            timer = setTimeout(() => {
              this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 0)
            }, 300)
          }
        }).finally(() => {
          this.toggleLoading(false)
        })
      } else {
        const tcp = get(api.npm.overview.tcpSessionDelay, params)
        const http = get(api.npm.overview.httpResponseDelay, params)
        const ssl = get(api.npm.overview.sslConDelay, params)
        const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
        const packetPercent = get(api.npm.overview.packetRetransPercent, params)
        this.toggleLoading(true)
        Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
          res.forEach((t, i) => {
            if (t.code === 200) {
              this.npmNetworkLastCycleData.push(t.data.result)
              this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 1)
            }
          })
        }).finally(() => {
          this.toggleLoading(false)
        })
      }
    },
    npmNetworkQuantity (cycle, lastCycle, num) {
      if (num === 0) {
        this.npmNetworkData[0] = {
          establishLatencyMsAvg: Math.floor(cycle.establishLatencyMsAvg),
          establishLatencyMsP99: cycle.establishLatencyMsP99,
          establishLatencyMsP95: cycle.establishLatencyMsP95,
          value: getChainRatio(cycle.establishLatencyMsAvg, lastCycle.establishLatencyMsAvg)
        }
        this.npmNetworkData[1] = {
          httpResponseLatencyAvg: Math.floor(cycle.httpResponseLatencyAvg),
          httpResponseLatencyP99: cycle.httpResponseLatencyP99,
          httpResponseLatencyP95: cycle.httpResponseLatencyP95,
          value: getChainRatio(cycle.httpResponseLatencyAvg, lastCycle.httpResponseLatencyAvg)
        }
        this.npmNetworkData[2] = {
          sslConLatencyAvg: Math.floor(cycle.sslConLatencyAvg),
          sslConLatencyP99: cycle.sslConLatencyP99,
          sslConLatencyP95: cycle.sslConLatencyP95,
          value: getChainRatio(cycle.sslConLatencyAvg, lastCycle.sslConLatencyAvg)
        }
        this.npmNetworkData[3] = {
          tcpLostlenPercentAvg: cycle.tcpLostlenPercentAvg,
          tcpLostlenPercentP99: cycle.tcpLostlenPercentP99,
          tcpLostlenPercentP95: cycle.tcpLostlenPercentP95,
          value: getChainRatio(cycle.tcpLostlenPercentAvg, lastCycle.tcpLostlenPercentAvg)
        }
        this.npmNetworkData[4] = {
          pktRetransPercentAvg: cycle.pktRetransPercentAvg,
          pktRetransPercentP99: cycle.pktRetransPercentP99,
          pktRetransPercentP95: cycle.pktRetransPercentP95,
          value: getChainRatio(cycle.pktRetransPercentAvg, lastCycle.pktRetransPercentAvg)
        }
      } else if (num === 1) {
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
    }
  },
  mounted () {
    if (this.chart) {
      this.chartData = _.cloneDeep(this.chart)
    }
    this.npmNetworkCycleQuery()
  }
}
</script>
