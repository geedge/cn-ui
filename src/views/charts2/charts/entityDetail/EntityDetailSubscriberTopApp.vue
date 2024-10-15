<template>
  <div class="subscriber-top-app">
    <div class="subscriber-top-app-header">
      <div class="subscriber-top-app-title">{{$t('subscriber.topApp')}}</div>
      <date-time-range
              class="entity-detail-date-time-range"
              :start-time="timeFilter.startTime"
              :end-time="timeFilter.endTime"
              :date-range="timeFilter.dateRangeValue"
              ref="dateTimeRange"
              @change="reload"
      />
    </div>

    <div class="subscriber-top-app-body">
      <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg"  style="top:34px;"/>

      <div class="top-app-left" v-show="!isNoData && !showError">
        <div class="app-data" v-for="(appData, index) in topAppData">
          <div class="app-index">{{++index}}</div>
          <div class="app-name" :title="appData.app">{{appData.app}}</div>
          <div class="app-trend-left">
            <i class="cn-icon cn-icon-egress"></i>
            <div class="app-up">{{appData.up ? unitConvert(appData.up, unitTypes.byte,null,null,1).join('') : '<1B'}}</div>
          </div>
          <el-divider direction="vertical" class="top-app-divider"/>
          <div class="app-trend-right">
            <i class="cn-icon cn-icon-ingress"></i>
            <div class="app-down">{{appData.down ? unitConvert(appData.down, unitTypes.byte,null,null,1).join('') : '<1B'}}</div>
          </div>

        </div>
      </div>
      <div class="top-app-right" >
        <div  class="chart-content"  :style="isSetHeight ? newHeight : ''" id="subscriberTopAppChart"></div>
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
import { overwriteUrl, urlParamsHandler, reverseSortBy } from '@/utils/tools'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { getNowTime, getSecond } from '@/utils/date-util'
import * as echarts from 'echarts'
import { entityDetailSubscriberTopApp } from '@/views/charts2/charts/options/echartOption'

export default {
  name: 'EntityDetailSubscriberTopApp',
  components: {
    ChartError,
    ChartNoData
  },
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')

    // 获取url携带的range、startTime、endTime
    /*const rangeParam = query.topAppRange
    const startTimeParam = query.topAppStartTime
    const endTimeParam = query.topAppEndTime*/
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime

    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.entity.subscriberTopApp || 60)
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
      timeFilter,
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      topAppData: [],
      unitConvert,
      unitTypes,
      isNoData: false,
      showError: false,
      errorMsg: '',
      isSetHeight: false,
      newHeight: ''
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
    init () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      axios.get(api.entity.subscriberTopApp, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!this.isNoData) {
            const appDatas = res.data.result.map(item => {
              const upData = item.outbound_bytes ? Number(item.outbound_bytes) : 0
              const downData = item.inbound_bytes ? Number(item.inbound_bytes) : 0
              return {
                app: item.app,
                up: upData,
                down: downData,
                appTotal: upData + downData
              }
            })

            this.topAppData = appDatas.sort(reverseSortBy('appTotal'))
            this.getTotalData()
          } else {
            if (this.myChart) {
              echarts.dispose(this.myChart)
            }
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
    getTotalData () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      axios.get(api.entity.subscriberKpi, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          const data = res.data
          this.isNoData = Object.keys(data).length === 0
          this.showError = false
          if (!this.isNoData) {
            const totalData = data.total_bytes ? Number(data.total_bytes) : 0
            if (totalData !== 0) {
              const echartDataList = []
              this.topAppData.forEach(item => {
                echartDataList.push({
                  count: (item.appTotal / totalData).toFixed(3),
                  app: item.app
                })
              })

              this.initEchart(echartDataList)
            }
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
      })
    },
    initEchart (data) {
      if (data && data.length > 0) {
        // if (data.length < 10) { // 重新设置图标高度
        this.isSetHeight = true
        this.newHeight = 'height:' + unitConvert(data.length / 10, unitTypes.percent, null, null, 0).join('') + ';'
        // }
        const chartDom = document.getElementById('subscriberTopAppChart')
        this.myChart = echarts.getInstanceByDom(chartDom)
        if (this.myChart) {
          echarts.dispose(this.myChart)
        }
        this.$nextTick(() => {
          this.myChart = echarts.init(chartDom)
          const chartOption = this.$_.cloneDeep(entityDetailSubscriberTopApp)
          chartOption.series[0].data = data.map(d => {
            return [d.count, d.app]
          }).reverse()
          this.myChart.setOption(chartOption)
        })
      }
    },
    resize () {
      if (this.myChart) {
        this.myChart.resize()
      }
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
        topAppStartTime: this.timeFilter.startTime,
        topAppEndTime: this.timeFilter.endTime,
        topAppRange: dateRangeValue.value
      })
      overwriteUrl(newUrl)
      if (this.myChart) {
        echarts.dispose(this.myChart)
      }
    }
  },
  mounted () {
    this.myChart = null
    this.$nextTick(() => {
      this.init()
    })
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    // 检测时发现该方法占用较大内存，且未被释放
    this.unitConvert = null
  }
}
</script>
