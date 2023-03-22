<template>
  <div class="performance-event">
    <div class="performance-event-title">
      <i class="cn-icon cn-icon-a-NetworkPerformanceEvent"></i>{{$t('network.networkPerEvent')}}
    </div>
    <div class="performance-event-value">
      <div class="performance-event-pie">
        <chart-no-data v-if="isNoData"></chart-no-data>
        <chart-error v-if="showError1" info :content="errorMsg1" />
        <div class="chart-drawing" id="chart1" v-show="!isNoData"></div>
      </div>
      <div class="performance-event-pie-hr"></div>
      <div class="performance-event-pie">
        <chart-no-data v-if="isNoData2"></chart-no-data>
        <chart-error v-if="showError1" info :content="errorMsg1" />
        <div class="chart-drawing" id="chart2" v-show="!isNoData2"></div>
      </div>
    </div>
    <el-button class="pie-button" size="small" @click="routerJump">
      {{$t('network.dashboards')}}<i class="cn-icon cn-icon-arrow-right"></i>
    </el-button>
  </div>
</template>

<script>
import { pieChartOption1, pieChartOption2 } from '@/views/charts2/charts/options/echartOption.js'
import * as echarts from 'echarts'
import { shallowRef } from 'vue'
import axios from 'axios'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
export default {
  name: 'NetworkOverviewPerformanceEvent',
  setup () {
    return {
      myChart: shallowRef(null),
      myChart2: shallowRef(null)
    }
  },
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  data () {
    return {
      timer: null,
      isNoData: false,
      isNoData2: false,
      loading1: false,
      loading2: false,
      showError1: false,
      showError2: false,
      errorMsg1: '',
      errorMsg2: ''
    }
  },
  methods: {
    init () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      const dom = document.getElementById('chart1')
      const dom2 = document.getElementById('chart2')
      if (dom) {
        if (!this.myChart) {
          this.myChart = echarts.init(dom)
        }
        this.chartOption = pieChartOption1
        this.loading1 = true
        axios.get(api.netWorkOverview.eventSeverity, { params: params }).then(res => {
          if (res.data.code === 200) {
            this.showError1 = false
            if (res.data.data.result.length === 0) {
              this.isNoData = true
              return
            } else {
              this.isNoData = false
            }
            res.data.data.result = res.data.data.result.map(t => {
              if (t.eventSeverity === 'critical') {
                t.index = 0
              } else if (t.eventSeverity === 'high') {
                t.index = 1
              } else if (t.eventSeverity === 'medium') {
                t.index = 1
              } else if (t.eventSeverity === 'low') {
                t.index = 3
              } else if (t.eventSeverity === 'info') {
                t.index = 4
              }
              return {
                name: t.eventSeverity,
                value: t.count,
                index: t.index
              }
            })
            this.chartOption.legend.show = res.data.data.result.length > 0
            this.chartOption.series[0].data = res.data.data.result.sort((a, b) => { return a.index - b.index })
            this.myChart.setOption(this.chartOption)
          } else {
            this.isNoData = false
            this.showError1 = true
            this.errorMsg1 = this.errorMsgHandler(res.data.message)
          }
        }).catch(e => {
          console.error(e)
          this.isNoData = false
          this.showError1 = true
          this.errorMsg1 = this.errorMsgHandler(e)
        }).finally(() => {
          this.loading1 = false
        })
      }
      if (dom2) {
        if (!this.myChart2) {
          this.myChart2 = echarts.init(dom2)
        }
        this.chartOption2 = pieChartOption2
        this.loading2 = true
        axios.get(api.netWorkOverview.eventType, { params: params }).then(res => {
          if (res.data.code === 200) {
            this.showError2 = false

            if (res.data.data.result.length === 0) {
              this.isNoData2 = true
              return
            } else {
              this.isNoData2 = false
            }
            res.data.data.result = res.data.data.result.map(t => {
              return {
                name: t.eventType,
                value: t.count
              }
            })
            if (res.data.data.result.length <= 0) {
              this.chartOption2.legend.show = false
            } else {
              this.chartOption2.legend.show = true
            }
            this.chartOption2.series[0].data = res.data.data.result
            this.myChart2.setOption(this.chartOption2)
          } else {
            this.isNoData2 = false
            this.showError2 = true
            this.errorMsg2 = this.errorMsgHandler(res)
          }
        }).catch(e => {
          this.isNoData2 = false
          this.showError2 = true
          this.errorMsg2 = this.errorMsgHandler(e)
        }).finally(() => {
          this.loading2 = false
        })
      }
    },
    routerJump () {
      this.$router.push({
        path: '/panel/networkAppPerformance',
        query: {
          tabIndex: 2,
          t: +new Date()
        }
      })
    },
    resize () {
      this.myChart.resize()
      this.myChart2.resize()
    }
  },
  computed: {
    loading () {
      return this.loading1 && this.loading2
    }
  },
  watch: {
    loading (n) {
      this.toggleLoading(n)
    },
    timeFilter: {
      handler (n) {
        this.init()
      }
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.init()
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
    const dom = document.getElementById('chart1')
    const dom2 = document.getElementById('chart2')
    if (dom) {
      echarts.dispose(dom)
    }
    if (dom2) {
      echarts.dispose(dom2)
    }
    this.myChart = null
    this.myChart2 = null
  }
}
</script>
