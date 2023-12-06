<template>
  <div class="subscriber-kpi">
    <div class="subscriber-kpi-header">
      <div class="subscriber-kpi-title">{{$t('subscriber.kpi')}}</div>
      <date-time-range
              class="entity-detail-date-time-range"
              :start-time="timeFilter.startTime"
              :end-time="timeFilter.endTime"
              :date-range="timeFilter.dateRangeValue"
              ref="dateTimeRange"
              showPosition="left"
              @change="reload"
      />
    </div>

    <div class="subscriber-kpi-body">
      <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg" style="top:34px;" />

      <div class="subscriber-kpi-content" v-if="!isNoData && !showError">
        <div class="kpi-type">
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.volume')}}</div>
            <div class="kpi-type-data" >
              <template v-if="$_.get(kpiData, 'volume')">
                <div class="kpi-type-value-number" >{{$_.get(kpiData, 'volume') ? unitConvert($_.get(kpiData, 'volume')[0], unitTypes.bps).join(' ') : '-'}}</div>
                <div class="data-trend">
                  <div v-if="$_.get(kpiData, 'volume')[1] === 'up'" class="data-total-trend data-total-trend-red" >
                    <i class="cn-icon-rise1 cn-icon"></i><span>{{$_.get(kpiData, 'volume')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'volume')[1] === 'down'" class="data-total-trend data-total-trend-green" >
                    <i class="cn-icon-decline cn-icon"></i><span>{{$_.get(kpiData, 'volume')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'volume')[1] === 'noChange'" class="data-total-trend data-total-trend-black" >
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </div>
              </template>
              <template  v-else>
                -
              </template>
            </div>
          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.throughput')}}</div>
            <div class="kpi-type-data" >
              <template v-if="$_.get(kpiData, 'throughput')">
                <div class="kpi-type-value-number" >{{$_.get(kpiData, 'throughput') ? unitConvert($_.get(kpiData, 'throughput')[0], unitTypes.bps).join(' ') : '-'}}</div>
                <div class="data-trend">
                    <div v-if="$_.get(kpiData, 'throughput')[1] === 'up'" class="data-total-trend data-total-trend-red" >
                      <i class="cn-icon-rise1 cn-icon"></i><span>{{$_.get(kpiData, 'throughput')[2]}}</span>
                    </div>
                    <div v-else-if=" $_.get(kpiData, 'throughput')[1] === 'down'" class="data-total-trend data-total-trend-green" >
                      <i class="cn-icon-decline cn-icon"></i><span>{{$_.get(kpiData, 'throughput')[2]}}</span>
                    </div>
                    <div v-else-if=" $_.get(kpiData, 'throughput')[1] === 'noChange'" class="data-total-trend data-total-trend-black" >
                      <i class="cn-icon-constant cn-icon"></i>
                    </div>
                </div>
              </template>
              <template  v-else>
                -
              </template>
            </div>
          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.latency')}}</div>
            <div class="kpi-type-data" >
              <template v-if="$_.get(kpiData, 'latency')">
                <div class="kpi-type-value-number" >{{$_.get(kpiData, 'latency') ? unitConvert($_.get(kpiData, 'latency')[0], unitTypes.bps).join(' ') : '-'}}</div>
                <div class="data-trend">
                  <div v-if="$_.get(kpiData, 'latency')[1] === 'up'" class="data-total-trend data-total-trend-red" >
                    <i class="cn-icon-rise1 cn-icon"></i><span>{{$_.get(kpiData, 'latency')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'latency')[1] === 'down'" class="data-total-trend data-total-trend-green" >
                    <i class="cn-icon-decline cn-icon"></i><span>{{$_.get(kpiData, 'latency')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'latency')[1] === 'noChange'" class="data-total-trend data-total-trend-black" >
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </div>
              </template>
              <template  v-else>
                -
              </template>
            </div>
          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.packetLoss')}}</div>
            <div class="kpi-type-data" >
              <template v-if="$_.get(kpiData, 'packetLoss')">
                <div class="kpi-type-value-number" >{{$_.get(kpiData, 'packetLoss') ? unitConvert($_.get(kpiData, 'packetLoss')[0], unitTypes.bps).join(' ') : '-'}}</div>
                <div class="data-trend">
                  <div v-if="$_.get(kpiData, 'packetLoss')[1] === 'up'" class="data-total-trend data-total-trend-red" >
                    <i class="cn-icon-rise1 cn-icon"></i><span>{{$_.get(kpiData, 'packetLoss')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'packetLoss')[1] === 'down'" class="data-total-trend data-total-trend-green" >
                    <i class="cn-icon-decline cn-icon"></i><span>{{$_.get(kpiData, 'packetLoss')[2]}}</span>
                  </div>
                  <div v-else-if=" $_.get(kpiData, 'packetLoss')[1] === 'noChange'" class="data-total-trend data-total-trend-black" >
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </div>
              </template>
              <template  v-else>
                -
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { api } from '@/utils/api'
import { ref, shallowRef } from 'vue'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import { overwriteUrl, urlParamsHandler, getChainRatio } from '@/utils/tools'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { getNowTime, getSecond } from '@/utils/date-util'

export default {
  name: 'EntityDetailSubscriberKpi',
  components: {
    ChartError,
    ChartNoData
  },
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')

    // 获取url携带的range、startTime、endTime
    const rangeParam = query.kpiRange
    const startTimeParam = query.kpiStartTime
    const endTimeParam = query.kpiEndTime

    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.entity.subscriberKpi || 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(dateRangeValue)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }

    return {
      queryCondition,
      timeFilter
    }
  },
  data () {
    return {
      kpiData: {
        volume: [5300000000, 'up', '6%'],
        throughput: [600000, 'noChange', '6%'],
        httpLatency: [21, 'down', '6%'],
        sslLatency: [21, 'down', '6%'],
        packetLoss: [0.0192, 'down', '2%']
      },
      unitConvert,
      unitTypes,
      isNoData: false,
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    timeFilter: {
      handler () {
        this.init()
      }
    }
  },
  methods: {
    handleTrendData (curData, preData) {
      let trend = ''
      let trendPercent = ''
      const totalDiff = curData - preData
      const chainRatio = getChainRatio(curData, preData)
      if (chainRatio !== '-') {
        trendPercent = parseFloat(Math.abs(chainRatio) * 100).toFixed(2)
        if (totalDiff > 0) {
          trend = 'up'
          if (trendPercent <= 500) {
            trendPercent = trendPercent + '%'
          } else {
            trendPercent = '>500%'
          }
        } else if (totalDiff < 0) {
          trend = 'down'
          if (trendPercent <= 500) {
            trendPercent = trendPercent + '%'
          } else {
            trendPercent = '>500%'
          }
        } else if (totalDiff === 0) {
          trend = 'noChange'// 横向图标
        } else {
          trend = ''
        }
        if (trendPercent === '0%') {
          trend = 'noChange'
          trendPercent = ''
        }
      }
      return [curData, trend, trendPercent]
    },
    init () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      const preParams = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }

      this.toggleLoading(true)

      axios.get(api.entity.subscriberKpi, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          const data = res.data
          this.isNoData = Object.keys(data).length === 0
          this.showError = false
          if (!this.isNoData) {
            this.kpiData = {
              volume: [data ? data.total_bytes : '', '', ''],
              throughput: [data ? data.avg_bits_per_sec : '', '', ''],
              httpLatency: [data ? data.avg_http_response_latency_ms : '', '', ''],
              sslLatency: [data ? data.avg_ssl_handshake_latency_ms : '', '', ''],
              packetLoss: [data ? data.tcp_lost_bytes_ratio : '', '', '']
            }

            axios.get(api.entity.subscriberKpi, { params: preParams }).then(preCycleRes => {
              const preRes = preCycleRes.data
              if (preCycleRes.status === 200) {
                const data = preRes.data
                if (Object.keys(data).length > 0) {
                  const preVolume = data ? data.avg_bits_per_sec : ''
                  const preThroughput = data ? data.total_bytes : ''
                  const preHttpLatency = data ? data.avg_http_response_latency_ms : ''
                  const preSslLatency = data ? data.avg_ssl_handshake_latency_ms : ''
                  const prePacketLoss = data ? data.tcp_lost_bytes_ratio : ''

                  if (this.kpiData.volume[0] !== '' && preVolume !== '') {
                    this.kpiData.volume = this.handleTrendData(this.kpiData.volume[0], preVolume)
                  }
                  if (this.kpiData.throughput[0] !== '' && preThroughput !== '') {
                    this.kpiData.throughput = this.handleTrendData(this.kpiData.throughput[0], preThroughput)
                  }
                  if (this.kpiData.httpLatency[0] !== '' && preHttpLatency !== '') {
                    this.kpiData.httpLatency = this.handleTrendData(this.kpiData.httpLatency[0], preHttpLatency)
                  }
                  if (this.kpiData.sslLatency[0] !== '' && preSslLatency !== '') {
                    this.kpiData.sslLatency = this.handleTrendData(this.kpiData.sslLatency[0], preSslLatency)
                  }
                  if (this.kpiData.packetLoss[0] !== '' && prePacketLoss !== '') {
                    this.kpiData.packetLoss = this.handleTrendData(this.kpiData.packetLoss[0], prePacketLoss)
                  }
                }
              } else {
                this.httpError(res)
              }
            })
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime) }
      const { query } = this.$route

      const newUrl = urlParamsHandler(window.location.href, query, {
        kpiStartTime: this.timeFilter.startTime,
        kpiEndTime: this.timeFilter.endTime,
        kpiRange: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  beforeUnmount () {
    this.unitConvert = null
  }
}
</script>
