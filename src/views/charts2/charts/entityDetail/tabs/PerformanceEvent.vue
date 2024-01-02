<template>
  <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
  <chart-no-data v-if="isNoData && !showError"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block">
    <div
        class="entity-detail-event-border"
        v-for="(item, index) in eventList"
        :key="item.eventId">
      <div class="cn-detection--list">
        <div class="cn-detection__case entity-detail-performance">
          <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[item.eventSecurity]}`"></div>
          <div class="cn-detection__row">
            <div class="cn-detection__header" style="padding-bottom: 0">
            <span
                :test-id="`severity-color-block${index}`"
                class="detection-event-severity-color-block"
                :style="`background-color: ${eventSeverityColor[item.eventSeverity]}`">
            </span>
              <span class="detection-event-severity-block" style="margin-right: 30px">
              {{ toUpperCaseByString(item.eventType) || '-' }}
            </span>
              <div class="cn-detection__body">
                <div class="body__basic-info">
                  <div class="basic-info">
                    <div class="basic-info__item" v-if="item.eventSeverity">
                      <i class="cn-icon cn-icon-severity-level"></i>
                      <span>{{ $t('network.severity') }}&nbsp;:&nbsp;&nbsp;</span>
                      <span :test-id="`severity${index}`">{{ toUpperCaseByString(item.eventSeverity) || '-' }}</span>
                    </div>
                    <div class="basic-info__item">
                      <i class="cn-icon cn-icon-time2"></i>
                      <span>{{ $t('detection.list.startTime') }}&nbsp;:&nbsp;&nbsp;</span>
                      <span :test-id="`start-time${index}`">{{ dateFormatByAppearance(item.startTime) || '-' }}</span>
                    </div>
                    <div class="basic-info__item">
                      <i class="cn-icon cn-icon-duration"></i>
                      <span>{{ $t('overall.duration') }}&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                      <span :test-id="`duration-time${index}`">{{ unitConvert(item.durationMs, 'time', null, null, 0).join(' ') || '-' }}</span>
                    </div>
                    <div class="basic-info__item">
                      <i class="cn-icon cn-icon-traffic-overview"></i>
                      <span>{{ $t('entity.detail.anomaly') }}&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                      <div id="anomalyChart" style="height: 20px; width: 100px;"></div>
                    </div>
                  </div>
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
import { dateFormatByAppearance } from '@/utils/date-util'
import { eventSeverityColor, entityDetailTabsName, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import { reverseSortBy, sortBy, toUpperCaseByString } from '@/utils/tools'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { markRaw } from 'vue'
import { metricOption } from '@/views/detections/options/detectionOptions'
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'PerformanceEvent',
  components: { ChartError, ChartNoData },
  mixins: [chartMixin],
  data () {
    return {
      eventList: [],
      showError: false,
      eventSeverityColor,
      errorMsg: ''
    }
  },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName

    return {
      entityType,
      entityName,
      chartOption: metricOption
    }
  },
  mounted () {
    this.initData()
    /*this.isNoData = true
    this.$emit('checkTag', entityDetailTabsName.performanceEvent, 0)
    this.toggleLoading(true)
    const timer = setTimeout(() => {
      this.toggleLoading(false)
      clearInterval(timer)
    }, 200)*/
  },
  methods: {
    unitConvert,
    toUpperCaseByString,
    dateFormatByAppearance,
    initData () {
      const params = {
        resource: this.entityName
        // startTime: getSecond(this.timeFilter.startTime),
        // endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)

      if (this.entityName === 'hqzc.wssp.hainan.gov.cn' || this.entityName === '218.77.183.150') {
        setTimeout(() => {
          this.toggleLoading(false)
          this.isNoData = false
          this.eventList = [
            {
              "serverIp": "1.1.1.1",
              "domain": "www.baidu.com",
              "appName": "ab",
              "eventSeverity": "critical",
              "eventType": "Http error",
              "durationMs": 840000,
              "startTime": new Date().getTime() - 1957 * 1000,
              "endTime": 2222222222
            }
          ]
          this.metricList = [
            [new Date().getTime() / 1000 - 2677, 2],
            [new Date().getTime() / 1000 - 2557, 3],
            [new Date().getTime() / 1000 - 2437, 2],
            [new Date().getTime() / 1000 - 2317, 7],
            [new Date().getTime() / 1000 - 2197, 8],
            [new Date().getTime() / 1000 - 2077, 38],
            [new Date().getTime() / 1000 - 1857, 12],
            [new Date().getTime() / 1000 - 1637, 8],
            [new Date().getTime() / 1000 - 1517, 7],
            [new Date().getTime() / 1000 - 1277, 3],
            [new Date().getTime() / 1000 - 1157, 1],
            [new Date().getTime() / 1000 - 1037, 2]
          ]
          this.$emit('checkTag', entityDetailTabsName.performanceEvent, 1)
          this.$nextTick(() => {
            this.initChart()
          })
        }, 200)
      } else {
        setTimeout(() => {
          this.isNoData = true
          this.toggleLoading(false)
          this.eventList = []
          this.$emit('checkTag', entityDetailTabsName.performanceEvent, 0)
        }, 200)
        /*axios.get(`${api.entity.performance}/${this.entityType}`, {params: params}).then(response => {
          const res = response.data

          if (response.status === 200) {
            this.isNoData = res.data.result.length === 0
            this.$emit('checkTag', entityDetailTabsName.performanceEvent, res.data.result.length)
            this.showError = false
            if (!this.isNoData) {
              this.eventList = res.data.result
            }
          } else {
            this.httpError(res)
          }
        }).catch(e => {
          console.error(e)
          this.httpError(e)
        }).finally(() => {
          this.toggleLoading(false)
        })*/
      }
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
      this.$emit('checkTag', entityDetailTabsName.performanceEvent, 0)
    },
    initChart () {
      this.metricChart = markRaw(echarts.init(document.getElementById('anomalyChart')))
      this.chartOptionMetric = _.cloneDeep(this.chartOption)
      this.chartOptionMetric.series[0].data = this.metricList.slice(0, 4).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
      this.chartOptionMetric.series[1].data = this.metricList.slice(3, 9).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
      this.chartOptionMetric.series[2].data = this.metricList.slice(8, 11).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])

      this.chartOptionMetric.series.forEach(item => {
        item.name = 'Http error'
      })

      this.chartOptionMetric && this.metricChart.setOption(this.chartOptionMetric)
    }
  }
}
</script>
