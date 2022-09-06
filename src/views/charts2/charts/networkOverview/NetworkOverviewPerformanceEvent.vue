<template>
  <div class="performance-event">
    <div class="performance-event-title"><i class="cn-icon cn-icon-a-NetworkPerformanceEvent"></i>{{$t('network.networkPerEvent')}}</div>
    <div class="performance-event-value">
      <div class="performance-event-pie">
        <chart-no-data v-if="isNoData"></chart-no-data>
        <div class="chart-drawing" id="chart1" v-show="!isNoData"></div>
      </div>
      <div class="performance-event-pie-hr"></div>
      <div class="performance-event-pie">
        <chart-no-data v-if="isNoData2"></chart-no-data>
        <div class="chart-drawing" id="chart2" v-show="!isNoData2"></div>
      </div>
    </div>
    <el-button class="pie-button" size="small">{{$t('network.dashboards')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
  </div>
</template>

<script>
import { pieChartOption1, pieChartOption2 } from '@/views/charts2/charts/options/echartOption.js'
import * as echarts from 'echarts'
import { shallowRef } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
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
    ChartNoData
  },
  data () {
    return {
      timer: null,
      isNoData: false,
      isNoData2: false,
      loading1: false,
      loading2: false
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
        this.myChart = echarts.init(dom)
        this.chartOption = pieChartOption1
        this.loading1 = true
        get(api.netWorkOverview.eventSeverity, params).then(res => {
          if (res.code === 200) {
            if (res.data.result.length === 0) {
              this.isNoData = true
              return
            } else {
              this.isNoData = false
            }
            res.data.result = res.data.result.map(t => {
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
            this.chartOption.legend.show = res.data.result.length > 0
            this.chartOption.series[0].data = res.data.result.sort((a, b) => { return a.index - b.index })
            this.myChart.setOption(this.chartOption)
          } else {
            this.isNoData = true
          }
        }).finally(() => {
          this.loading1 = false
        })
      }
      if (dom2) {
        this.myChart2 = echarts.init(dom2)
        this.chartOption2 = pieChartOption2
        this.loading2 = true
        get(api.netWorkOverview.eventType, params).then(res => {
          if (res.code === 200) {
            if (res.data.result.length === 0) {
              this.isNoData2 = true
              return
            } else {
              this.isNoData2 = false
            }
            res.data.result = res.data.result.map(t => {
              return {
                name: t.eventType,
                value: t.count
              }
            })
            if (res.data.result.length <= 0) {
              this.chartOption2.legend.show = false
            } else {
              this.chartOption2.legend.show = true
            }
            this.chartOption2.series[0].data = res.data.result
            this.myChart2.setOption(this.chartOption2)
          }
        }).finally(() => {
          this.loading2 = false
        })
      }
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
      deep: true,
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
  }
}
</script>
