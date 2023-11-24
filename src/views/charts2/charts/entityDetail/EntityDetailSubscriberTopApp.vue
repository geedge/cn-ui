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
      <chart-error v-if="showError" :content="errorMsg" />

      <div class="top-app-left" v-show="!isNoData && !showError">
        <div class="app-data" v-for="(app, index) in topAppData">
          <div class="app-index">{{++index}}</div>
          <div class="app-name">{{app.name}}</div>
          <div class="app-trend">
            <i class="cn-icon cn-icon-egress"></i>
            <div class="app-up">{{app.up}}</div>
          </div>
          <el-divider direction="vertical" class="top-app-divider"/>
          <div class="app-trend">
            <i class="cn-icon cn-icon-ingress"></i>
            <div class="app-down">{{app.down}}</div>
          </div>

        </div>
      </div>
      <div class="top-app-right" >
        <div  class="chart-content" id="subscriberTopAppChart"></div>
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
    const rangeParam = query.topAppRange
    const startTimeParam = query.topAppStartTime
    const endTimeParam = query.topAppEndTime

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
      topAppData: [
        {
          name: 'Wetchat',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'QQ',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Douyin',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Weibo',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Tecent',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Kuaishou',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Taobao',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Jd',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Aiqiyi',
          up: '1.2GB',
          down: '28MB'
        },
        {
          name: 'Baidu',
          up: '1.2GB',
          down: '28MB'
        }
      ],
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
            this.topAppData = res.data.result
            this.initEchart()
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
        // 无数据时的测试代码
        //this.isNoData = false
        //this.initEchart()
      })
    },
    initEchart (data) {
      data = [
        {
          count: 0.307,
          app: 1
        },
        {
          count: 0.206,
          app: 2
        },
        {
          count: 0.09,
          app: 3
        },
        {
          count: 0.082,
          app: 4
        },
        {
          count: 0.06,
          app: 5
        },
        {
          count: 0.032,
          app: 6
        },
        {
          count: 0.024,
          app: 7
        },
        {
          count: 0.017,
          app: 8
        },
        {
          count: 0.009,
          app: 9
        },
        {
          count: 0.006,
          app: 10
        }
      ]
      if (data && data.length > 0) {
        const chartDom = document.getElementById('subscriberTopAppChart')
        this.myChart = echarts.getInstanceByDom(chartDom)
        if (this.myChart) {
          echarts.dispose(this.myChart)
        }
        this.myChart = echarts.init(chartDom)
        const chartOption = this.$_.cloneDeep(entityDetailSubscriberTopApp)
        chartOption.series[0].data = data.map(d => {
          return [d.count, d.app]
        }).reverse()
        this.myChart.setOption(chartOption)
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
