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
              @change="reload"
      />
    </div>

    <div class="subscriber-kpi-body">
      <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg" />

      <div class="subscriber-kpi-content" v-if="!isNoData && !showError">
        <div class="kpi-type">
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.volume')}}</div>
            <div class="kpi-type-data" >
              <div class="kpi-type-value-number">
                {{unitConvert($_.get(kpiData, 'volume'), unitTypes.number).join(' ')}}
              </div>

              <div class="data-trend">
                <div  class="data-total-trend data-total-trend-red">
                  <i class="cn-icon-rise1 cn-icon"></i>&nbsp;
                  <span >32%</span>
                </div>
              </div>

            </div>
          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.throughput')}}</div>
            <div class="kpi-type-data" >
              <div class="kpi-type-value-number" >{{unitConvert($_.get(kpiData, 'throughput'), unitTypes.bps).join(' ')}}</div>
              <div class="data-trend">

                <div  class="data-total-trend data-total-trend-green">
                  <i class="cn-icon-decline cn-icon"></i>&nbsp;
                  <span >8%</span>
                </div>
              </div>
            </div>

          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.latency')}}</div>
            <div class="kpi-type-data" >
              <div class="kpi-type-value-number" >{{unitConvert($_.get(kpiData, 'latency'), unitTypes.time).join(' ')}}</div>
              <div class="data-trend">

                <div  class="data-total-trend data-total-trend-black">
                  <i class="cn-icon-constant cn-icon"></i>
                </div>
              </div>

            </div>
          </div>
          <div class="kpi-type-value">
            <div class="kpi-type-value-name">{{$t('subscriber.packetLoss')}}</div>
            <div class="kpi-type-data" >
              <div class="kpi-type-value-number" >{{unitConvert($_.get(kpiData, 'packetLoss'), unitTypes.percent).join(' ')}}</div>
              <div class="data-trend">

                <div  class="data-total-trend data-total-trend-green">
                  <i class="cn-icon-decline cn-icon"></i>&nbsp;
                  <span >66%</span>
                </div>
              </div>

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
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
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
        volume: 5300000000,
        throughput: 600000,
        latency: 21,
        packetLoss: 0.0192
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
    init (val, show, active, n) {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      if (this.queryCondition) {
        // params.q = this.queryCondition
      }

      this.toggleLoading(true)
      axios.get(`${api.entity.throughput}/${this.entity.entityType}`, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!this.isNoData) {
            this.kpiData = res.data.result
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
        // 测试代码
        // this.isNoData = false
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
