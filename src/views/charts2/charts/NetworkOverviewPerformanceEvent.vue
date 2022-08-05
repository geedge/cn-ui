<template>
  <div class="performance-event">
    <div class="performance-event-title"><i class="cn-icon cn-icon-a-NetworkPerformanceEvent"></i>{{$t('network.networkPerEvent')}}</div>
    <div class="performance-event-value">
      <div class="performance-event-pie">
        <div class="chart-drawing" id="chart1"></div>
        <div class="performance-event-pie-hr"></div>
        <div class="chart-drawing" id="chart2"></div>
      </div>
      <el-button class="pie-button" size="small">{{$t('network.dashboards')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
    </div>
  </div>
</template>

<script>
import { pieChartOption1, pieChartOption2 } from '@/views/charts2/charts/options/echartOption.js'
import * as echarts from 'echarts'
import { shallowRef } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
export default {
  name: 'NetworkOverviewPerformanceEvent',
  setup () {
    return {
      myChart: shallowRef(null),
      myChart2: shallowRef(null)
    }
  },
  props: {
    timeFilter: Object
  },
  data () {
    return {
      timer: null
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
        get(api.netWorkOverview.eventSeverity, params).then(res => {
          if (res.code === 200) {
            res.data.result = res.data.result.map(t => {
              return {
                name: t.eventSeverity,
                value: t.count
              }
            })
            if (res.data.result.length <= 0) {
              this.chartOption.legend.show = false
            } else {
              this.chartOption.legend.show = true
            }
            this.chartOption.series[0].data = res.data.result
            this.myChart.setOption(this.chartOption)
          }
        })
      }
      if (dom2) {
        this.myChart2 = echarts.init(dom2)
        this.chartOption2 = pieChartOption2
        get(api.netWorkOverview.eventType, params).then(res => {
          if (res.code === 200) {
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
        })
      }
    },
    resize () {
      this.myChart.resize()
      this.myChart2.resize()
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
  }
}
</script>
