<template>
  <div class="npm-network-quantity">
    <single-value
        v-if="npmNetworkData.length>0"
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
    const tabIndex = ref(query.tabIndex || 0)
    const tabOperationType = ref(query.tabOperationType)
    const networkOverviewBeforeTab = ref(query.networkOverviewBeforeTab || '')
    return {
      queryCondition,
      dimensionType,
      tabIndex,
      tabOperationType,
      networkOverviewBeforeTab
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
      chartData: {},
      timer1: null,
      timer2: null
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
      let url = ''
      if (this.queryCondition.indexOf(' OR ') > -1) {
        condition = this.queryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.queryCondition
      }
      const type = this.dimensionType || this.networkOverviewBeforeTab
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
        if (type === 'clientIp') {
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}' and side='client'`
        } else if (type === 'serverIp') {
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}' and side='server'`
        } else if (type === 'clientCity') {
          params.q = `client_city='${condition.split(/'(.*?)'/)[1]}'`
        } else if (type === 'serverCity') {
          params.q = `server_city='${condition.split(/'(.*?)'/)[1]}'`
        } else {
          params.q = condition
        }
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
      if (parseFloat(this.tabOperationType) === 3) {
        url = api.npm.overview.allNetworkAnalysis
      } else {
        url = api.npm.overview.networkAnalysis
      }
      if ((type && condition) || type) {
        params.type = params.type || type
        this.toggleLoading(true)
        get(url, params).then(res => {
          if (res.code === 200) {
            this.npmNetworkCycleData = res.data.result
          }
          this.npmNetworkLastCycleQuery(url, params)
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
            } else {
              this.npmNetworkCycleData.push(t)
            }
          })
          this.npmNetworkLastCycleQuery()
        }).catch(e => {
          this.toggleLoading(false)
          // 此时e为数组
          if (e instanceof Array) {
            this.npmNetworkCycleData = []
            e.forEach(t => {
              this.npmNetworkCycleData.push(t)
            })
            this.npmNetworkLastCycleQuery()
          }
        })
      }
    },
    npmNetworkLastCycleQuery (url, param) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }
      if (param && param.type && param.q) {
        params.type = param.type
        params.q = param.q
      }
      if ((params.type && params.q) || (param && param.type)) {
        params.type = params.type || param.type
        this.toggleLoading(true)
        get(url, params).then(res => {
          if (res.code === 200) {
            this.npmNetworkLastCycleData = res.data.result
          } else {
            this.npmNetworkLastCycleData = [res]
          }
          const timer = null
          if (timer) {
            clearTimeout(timer)
          }
          this.timer1 = setTimeout(() => {
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 0)
          }, 300)
        }).catch((e) => {
          const timer = null
          if (timer) {
            clearTimeout(timer)
          }
          this.npmNetworkLastCycleData = [e]
          this.timer2 = setTimeout(() => {
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 0)
          }, 300)
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
            } else {
              this.npmNetworkLastCycleData.push(t)
            }
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 1)
          })
        }).catch((e) => {
          // todo 此处的e可能为数组
          if (e instanceof Array) {
            e.forEach((t, i) => {
              this.npmNetworkLastCycleData.push(t)
              this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 1)
            })
          }
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
  },
  beforeUnmount () {
    clearTimeout(this.timer1)
    clearTimeout(this.timer2)
  }
}
</script>
