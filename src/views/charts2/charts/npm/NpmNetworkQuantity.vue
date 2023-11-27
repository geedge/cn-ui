<template>
  <div class="npm-network-quantity">
    <div class="single-value" v-for="(npm, index) in newNpmNetworkData" :key="index">
      <div class="single-value__title" style="display: flex">
        {{ $t(npmNetworkName[index].name) }}
        <chart-error v-if="npm.message" tooltip :content="npm.message"></chart-error>
      </div>

      <div class="single-value__content" >
        <div class="single-value__content-number" v-if="index ===0 || index ===1 || index ===2" :test-id="`singleValueContent${index}`">
          {{ valueToRangeValue(npm.Avg, unitTypes.time).join(' ') }}
        </div>
        <div class="single-value__content-number" v-else :test-id="`singleValueContent${index}`">
          {{valueToRangeValue(npm.Avg, unitTypes.percent).join(' ')}}
        </div>
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red" >
          <i class="cn-icon-rise1 cn-icon" :test-id="`singleValueTrendIcon${index}`"></i>&nbsp;
          <span v-if="npm.value <= 5" :test-id="`singleValueTrendValue${index}`">
            {{ unitConvert(npm.value, unitTypes.percent).join('') }}
        </span>
          <span v-else :test-id="`singleValueTrendValue${index}`">>500.00%</span>
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green" >
          <i class="cn-icon-decline cn-icon" :test-id="`singleValueTrendIcon${index}`"></i>&nbsp;
          <span v-if="npm.value >= -5" :test-id="`singleValueTrendValue${index}`">
            {{ unitConvert(npm.value, unitTypes.percent).join('') }}
        </span>
          <span v-else :test-id="`singleValueTrendValue${index}`">>500.00%</span>
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon" :test-id="`singleValueTrendIcon${index}`"></i>
        </div>
        <div v-else></div>
      </div>

      <div class="single-value__circle">
        <div class="single-value__circle-p95" :test-id="`singleValueP95${index}`">
        <span v-if="index ===0 || index ===1 || index ===2">
          P95: {{ valueToRangeValue(npm.P95, unitTypes.time).join(' ') }}</span>
          <span v-else>
          P95: {{ valueToRangeValue(npm.P95, unitTypes.percent).join(' ') }}
        </span>
        </div>
        <div class="single-value__circle-p99" :test-id="`singleValueP99${index}`">
        <span v-if="index ===0 || index ===1 || index ===2">
          P99: {{ valueToRangeValue(npm.P99, unitTypes.time).join(' ') }}
        </span>
          <span v-else>
          P99: {{ valueToRangeValue(npm.P99, unitTypes.percent).join(' ') }}
        </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import _ from 'lodash'
import { getChainRatio } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { unitTypes } from '@/utils/constants'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import axios from 'axios'
import { dataForNpmNetworkQuantity } from '@/utils/static-data'
export default {
  name: 'NpmNetworkQuantity',
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const lineQueryCondition = ref(query.lineQueryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    const tabIndex = ref(query.tabIndex || 0)
    const tabOperationType = ref(query.tabOperationType)
    const networkOverviewBeforeTab = ref(query.networkOverviewBeforeTab || '')
    return {
      lineQueryCondition,
      dimensionType,
      tabIndex,
      tabOperationType,
      networkOverviewBeforeTab
    }
  },
  data () {
    return {
      unitTypes,
      unitConvert,
      valueToRangeValue,
      npmNetworkName: dataForNpmNetworkQuantity.npmNetworkName,
      npmNetworkCycleData: [],
      npmNetworkLastCycleData: [],
      newNpmNetworkData: [],
      npmNetworkData: [],
      side: '',
      chartData: {},
      timer1: null,
      timer2: null
    }
  },
  watch: {
    timeFilter: {
      handler () {
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
      if (this.lineQueryCondition && this.lineQueryCondition.indexOf(' OR ') > -1) {
        condition = this.lineQueryCondition.split(/["|'](.*?)["|']/)
      } else if (this.lineQueryCondition.indexOf('+OR+') > -1) {
        condition = this.lineQueryCondition.replace(/\+/g, ' ').split(/["|'](.*?)["|']/)
      } else {
        condition = this.lineQueryCondition
      }
      const type = this.dimensionType || this.networkOverviewBeforeTab
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 0
      }

      if (parseFloat(this.tabIndex) === 0) {
        this.side = 'client'
      } else if (parseFloat(this.tabIndex) === 1) {
        this.side = 'server'
      }

      if (type === 'ip' || type === 'clientIp' || type === 'serverIp') { // condition 为数组时数组长度不为 0 | type 不为空 | type为ip
        params.q = `${condition} and side='${this.side}'`
      } else {
        params.q = condition
      }
      params.type = type

      // 区分 3 级菜单和 2 级菜单使用不同的 url
      url = parseFloat(this.tabOperationType) === 3 ? api.npm.overview.allNetworkAnalysis : api.npm.overview.networkAnalysis

      // if ((type && condition) || type) {
      if (condition || type) {
        params.type = params.type || type
        this.toggleLoading(true)
        axios.get(url, { params: params }).then(response => {
          const res = response.data
          if (response.status === 200) {
            this.npmNetworkCycleData = res.data.result
          }
          this.npmNetworkLastCycleQuery(url, params)
        }).catch(e => {
          console.error(e)
          this.toggleLoading(false)
        })
      } else {
        const tcp = axios.get(api.npm.overview.tcpSessionDelay, { params: params })
        const http = axios.get(api.npm.overview.httpResponseDelay, { params: params })
        const ssl = axios.get(api.npm.overview.sslConDelay, { params: params })
        const tcpPercent = axios.get(api.npm.overview.tcpLostlenPercent, { params: params })
        const packetPercent = axios.get(api.npm.overview.packetRetransPercent, { params: params })
        this.toggleLoading(true)
        Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
          // 状态为200的，赋值接口数据，不为200的传入报错提示message，
          // 传给子组件SingleValue，再进行error处理，注：error处理不在此处处理
          this.npmNetworkCycleData = []
          res.forEach(t => {
            if (t.status === 200) {
              this.npmNetworkCycleData.push(t.data.data.result)
            } else {
              this.npmNetworkCycleData.push(t.data)
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
        axios.get(url, { params: params }).then(response => {
          const res = response.data
          if (response.status === 200) {
            this.npmNetworkLastCycleData = res.data.result
          } else {
            this.npmNetworkLastCycleData = [res]
          }
          this.timer1 = setTimeout(() => {
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 0)
          }, 300)
        }).catch((e) => {
          this.npmNetworkLastCycleData = [e]
          this.timer2 = setTimeout(() => {
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 0)
          }, 300)
        }).finally(() => {
          this.toggleLoading(false)
        })
      } else {
        const tcp = axios.get(api.npm.overview.tcpSessionDelay, { params: params })
        const http = axios.get(api.npm.overview.httpResponseDelay, { params: params })
        const ssl = axios.get(api.npm.overview.sslConDelay, { params: params })
        const tcpPercent = axios.get(api.npm.overview.tcpLostlenPercent, { params: params })
        const packetPercent = axios.get(api.npm.overview.packetRetransPercent, { params: params })
        this.toggleLoading(true)
        Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
          // 状态为200的，赋值接口数据，不为200的保留报错提示message，
          // 传给子组件SingleValue，再进行error处理，注：error处理不在此处处理
          res.forEach(t => {
            if (t.status === 200) {
              this.npmNetworkLastCycleData.push(t.data.data.result)
            } else {
              this.npmNetworkLastCycleData.push(t.data)
            }
            this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData, 1)
          })
        }).catch((e) => {
          if (e instanceof Array) {
            e.forEach(t => {
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
      this.initData(this.npmNetworkData)
    },
    initData (data) {
      // 处理数据后的数组
      const dealList = []

      if (data !== undefined && data.length > 0) {
        data.forEach((item) => {
          const tempObj = {}
          for (const i in item) {
            if (item.msg || item.message) {
              // 为了兼容字段为msg的情况
              tempObj.message = item.msg ? item.msg : item.message
            } else {
              // 将含有avg、p90等关键字使用avg、p90来代替，形成统一属性
              if (i.indexOf('Avg') > -1) {
                tempObj.Avg = item[i]
              } else if (i.indexOf('P50') > -1) {
                tempObj.P50 = item[i]
              } else if (i.indexOf('P90') > -1) {
                tempObj.P90 = item[i]
              } else if (i.indexOf('P95') > -1) {
                tempObj.P95 = item[i]
              } else if (i.indexOf('P99') > -1) {
                tempObj.P99 = item[i]
              }
              tempObj.value = item.value
            }
          }
          dealList.push(tempObj)
        })
        this.newNpmNetworkData = dealList
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
    this.unitConvert = null
    this.valueToRangeValue = null
  }
}
</script>
